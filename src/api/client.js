/**
 * Centralized API Client with automatic JWT token attachment,
 * refresh token interceptor, and structured service modules.
 */

let accessToken = localStorage.getItem('access_token') || null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getAccessToken() {
  return accessToken;
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  // Attach Authorization header if token exists
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Default to JSON body if not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include HTTP-only cookies
    });
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }

  // Handle 401 Unauthorized by attempting a token refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);

          // Retry original request with new access token
          headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { success: response.ok, message: await response.text() };
  }

  if (!response.ok || (data && data.success === false)) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) =>
      apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () =>
      apiRequest('/auth/logout', { method: 'POST' }),
    getMe: () =>
      apiRequest('/auth/me', { method: 'GET' }),
    changePassword: (passwords) =>
      apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
  },
  public: {
    submitRequest: (requestData) =>
      apiRequest('/public/requests', { method: 'POST', body: JSON.stringify(requestData) }),
    getInvitation: (slug) =>
      apiRequest(`/public/invitations/${slug}`, { method: 'GET' }),
    recordEvent: (slug, eventData) =>
      apiRequest(`/public/invitations/${slug}/events`, { method: 'POST', body: JSON.stringify(eventData) }),
  },
  customer: {
    getDashboard: () =>
      apiRequest('/customer/dashboard', { method: 'GET' }),
    getInvitations: () =>
      apiRequest('/customer/invitations', { method: 'GET' }),
    getInvitation: (publicId) =>
      publicId ? apiRequest(`/customer/invitations/${publicId}`, { method: 'GET' }) : apiRequest('/customer/invitations', { method: 'GET' }),
    updateInvitation: (publicId, data) =>
      apiRequest(`/customer/invitations/${publicId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateContent: (publicId, content) =>
      apiRequest(`/customer/invitations/${publicId}/content`, { method: 'PATCH', body: JSON.stringify(content) }),
    getPreview: (publicId) =>
      apiRequest(`/customer/invitations/${publicId}/preview`, { method: 'GET' }),
    publish: (publicId) =>
      apiRequest(`/customer/invitations/${publicId}/publish`, { method: 'POST' }),
    unpublish: (publicId) =>
      apiRequest(`/customer/invitations/${publicId}/unpublish`, { method: 'POST' }),
    getAnalytics: (publicId) =>
      apiRequest(`/customer/invitations/${publicId}/analytics`, { method: 'GET' }),
    uploadMedia: (publicId, formData) =>
      apiRequest(`/customer/invitations/${publicId}/media`, { method: 'POST', body: formData }),
    updateCustomLocations: (publicId, locations) =>
      apiRequest(`/customer/invitations/${publicId}/custom-locations`, { method: 'PATCH', body: JSON.stringify({ locations }) }),
    updateCustomOptions: (publicId, options) =>
      apiRequest(`/customer/invitations/${publicId}/custom-options`, { method: 'PATCH', body: JSON.stringify({ options }) }),
    getGifs: (category) =>
      apiRequest(`/customer/gifs${category ? '?category=' + category : ''}`, { method: 'GET' }),
  },

  admin: {
    getRequests: (params = {}) =>
      apiRequest('/admin/requests', { method: 'GET' }),
    recordPayment: (requestId, paymentData) =>
      apiRequest(`/admin/requests/${requestId}/payment`, { method: 'POST', body: JSON.stringify(paymentData) }),
    activateCustomer: (requestId) =>
      apiRequest(`/admin/requests/${requestId}/activate`, { method: 'POST' }),
    getCustomers: () =>
      apiRequest('/admin/customers', { method: 'GET' }),
    createCustomer: (data) =>
      apiRequest('/admin/customers', { method: 'POST', body: JSON.stringify(data) }),
    suspendCustomer: (customerId) =>
      apiRequest(`/admin/customers/${customerId}/suspend`, { method: 'POST' }),
    reactivateCustomer: (customerId) =>
      apiRequest(`/admin/customers/${customerId}/reactivate`, { method: 'POST' }),
    resetPassword: (userId) =>
      apiRequest(`/admin/users/${userId}/reset-password`, { method: 'POST' }),
  },
};

export default api;
