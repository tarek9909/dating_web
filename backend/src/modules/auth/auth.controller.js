import { authService } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { config } from '../../config/env.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.login({ email, password, userAgent, ipAddress });

      const isHttps = Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https');

      // Set secure HTTP-only refresh cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        maxAge: config.jwt.refreshTokenDays * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 'UNAUTHORIZED', 401);
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.refresh({ refreshToken, userAgent, ipAddress });

      const isHttps = Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https');

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        maxAge: config.jwt.refreshTokenDays * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      return sendSuccess(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      if (err.statusCode === 401 || err.code === 'UNAUTHORIZED' || err.code === 'INVALID_SESSION') {
        return sendError(res, err.message, err.code || 'UNAUTHORIZED', 401);
      }
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      return sendSuccess(res, { user: req.user });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword({
        userId: req.user.id,
        currentPassword,
        newPassword,
      });

      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword({ token, newPassword });
      return sendSuccess(res, { message: 'Password reset successfully. Please log in with your new password.' });
    } catch (err) {
      next(err);
    }
  }
};
