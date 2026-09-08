import { authRepository } from './auth.repository.js';
import { comparePassword, hashPassword, generateTemporaryPassword } from '../../utils/password.js';
import { signAccessToken, generateRandomToken, hashToken } from '../../utils/tokens.js';
import { config } from '../../config/env.js';

export const authService = {
  async login({ email, password, userAgent, ipAddress }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (user.status !== 'active') {
      const err = new Error('Your account is currently suspended or disabled');
      err.statusCode = 403;
      err.code = 'ACCOUNT_SUSPENDED';
      throw err;
    }

    if (user.customer_status && user.customer_status === 'suspended') {
      const err = new Error('Customer account is suspended');
      err.statusCode = 403;
      err.code = 'ACCOUNT_SUSPENDED';
      throw err;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    // 1. Generate access token
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customer_id,
    });

    // 2. Generate refresh token & session
    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenDays * 24 * 60 * 60 * 1000);
    const ipHash = hashToken(ipAddress || 'unknown');

    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: tokenHash,
      userAgent: (userAgent || '').slice(0, 500),
      ipHash,
      expiresAt,
    });

    await authRepository.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        customerId: user.customer_id,
        fullName: user.full_name,
        mustChangePassword: Boolean(user.must_change_password),
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  async refresh({ refreshToken, userAgent, ipAddress }) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const tokenHash = hashToken(refreshToken);
    const session = await authRepository.findActiveSession(tokenHash);

    if (!session) {
      const err = new Error('Session is invalid or has expired');
      err.statusCode = 401;
      err.code = 'INVALID_SESSION';
      throw err;
    }

    if (session.user_status !== 'active') {
      const err = new Error('Account is suspended');
      err.statusCode = 403;
      err.code = 'ACCOUNT_SUSPENDED';
      throw err;
    }

    // Rotate refresh token: Revoke existing session
    await authRepository.revokeSession(session.id);

    // Create new session
    const newRawRefreshToken = generateRandomToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenDays * 24 * 60 * 60 * 1000);
    const ipHash = hashToken(ipAddress || 'unknown');

    await authRepository.createSession({
      userId: session.user_id,
      refreshTokenHash: newTokenHash,
      userAgent: (userAgent || '').slice(0, 500),
      ipHash,
      expiresAt,
    });

    const accessToken = signAccessToken({
      userId: session.user_id,
      email: session.email,
      role: session.role,
      customerId: session.customer_id,
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      const session = await authRepository.findActiveSession(tokenHash);
      if (session) {
        await authRepository.revokeSession(session.id);
      }
    }
  },

  async changePassword({ userId, currentPassword, newPassword }) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Verify current password
    const fullUser = await authRepository.findUserByEmail(user.email);
    const isMatch = await comparePassword(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      const err = new Error('Current password does not match');
      err.statusCode = 400;
      err.code = 'INVALID_PASSWORD';
      throw err;
    }

    const newHash = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, newHash);

    // Revoke all existing sessions for security
    await authRepository.revokeAllUserSessions(userId);

    return { success: true };
  },

  async forgotPassword(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return success anyway to avoid user enumeration attacks
      return { message: 'If an account exists with this email, a reset token has been issued.' };
    }

    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      message: 'If an account exists with this email, a reset token has been issued.',
      resetToken: config.env === 'development' ? rawToken : undefined,
    };
  },

  async resetPassword({ token, newPassword }) {
    const tokenHash = hashToken(token);
    const resetRecord = await authRepository.findValidPasswordResetToken(tokenHash);

    if (!resetRecord) {
      const err = new Error('Invalid or expired password reset token');
      err.statusCode = 400;
      err.code = 'INVALID_RESET_TOKEN';
      throw err;
    }

    const newHash = await hashPassword(newPassword);
    await authRepository.updatePassword(resetRecord.user_id, newHash);
    await authRepository.markPasswordResetTokenUsed(resetRecord.id);
    await authRepository.revokeAllUserSessions(resetRecord.user_id);

    return { success: true };
  }
};
