import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const BASE_URL = config.API_URL;

let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && {Authorization: `Bearer ${token}`}),
  };
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const endpoint = '/auth/refresh';
  const body = JSON.stringify({refresh_token: refreshToken});
  logRequest(endpoint, 'POST', body);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    logResponse(endpoint, {error: 'Session expired', status: response.status}, true);
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user', 'profile', 'userType']);
    throw new Error('Session expired. Please login again.');
  }

  logResponse(endpoint, data);

  const newToken = data.data?.token || data.data?.access_token;
  const newRefreshToken = data.data?.refresh_token;

  if (newToken) {
    await AsyncStorage.setItem('token', newToken);
  }
  if (newRefreshToken) {
    await AsyncStorage.setItem('refreshToken', newRefreshToken);
  }

  return newToken;
};

const logRequest = (endpoint, method, body) => {
  const payload = body ? JSON.parse(body) : null;
  console.log(`[API ${method}] ${endpoint}`, payload ? JSON.stringify(payload, null, 2) : '');
};

const logResponse = (endpoint, data, isError = false) => {
  const prefix = isError ? '[API Error]' : '[API Response]';
  console.log(`${prefix} ${endpoint}:`, JSON.stringify(data, null, 2));
};

const handleResponse = async (response, endpoint, retryFn) => {
  if (response.status === 401 && retryFn) {
    console.log(`[API 401] ${endpoint}: Token expired, attempting refresh...`);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(async (newToken) => {
          try {
            const result = await retryFn(newToken);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      onTokenRefreshed(newToken);
      return retryFn(newToken);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];
      throw refreshError;
    }
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMessage = data.detail || data.message || data.error || 'Something went wrong';
    logResponse(endpoint, {error: errorMessage, status: response.status}, true);
    throw new Error(errorMessage);
  }

  logResponse(endpoint, data);
  return data;
};

const request = async (endpoint, options = {}) => {
  const fullUrl = `${BASE_URL}${endpoint}`;
  logRequest(endpoint, options.method || 'GET', options.body);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {'Content-Type': 'application/json', ...options.headers},
  });

  return handleResponse(response, endpoint);
};

const authenticatedRequest = async (endpoint, options = {}) => {
  const headers = await getHeaders();
  const fullUrl = `${BASE_URL}${endpoint}`;

  logRequest(endpoint, options.method || 'GET', options.body);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {...headers, ...options.headers},
  });

  const retryFn = async (newToken) => {
    const retryResponse = await fetch(fullUrl, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });
    return handleResponse(retryResponse, endpoint, null);
  };

  return handleResponse(response, endpoint, retryFn);
};

export const authAPI = {
  register: ({firstName, lastName, email, phoneNumber, password}) =>
    request('/auth/register/customer', {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        password,
      }),
    }),

  login: ({email, phoneNumber, password, userType = 'customer'}) => {
    const payload = {password};
    if (email) payload.email = email;
    if (phoneNumber) payload.phone_number = phoneNumber;
    const endpoint = userType === 'merchant' ? '/auth/login/merchant' : '/auth/login';
    return request(endpoint, {method: 'POST', body: JSON.stringify(payload)});
  },

  forgotPassword: ({email}) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({email}),
    }),

  verifyOtp: ({email, otp}) =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({email, otp}),
    }),

  resetPassword: ({email, otp, newPassword}) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({email, otp, new_password: newPassword}),
    }),

  refreshToken: ({refreshToken}) =>
    request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({refresh_token: refreshToken}),
    }),
};

export const customerAPI = {
  getProfile: () => authenticatedRequest('/customer/profile', {method: 'GET'}),

  getWallet: () => authenticatedRequest('/customer/wallet', {method: 'GET'}),

  getDashboard: () => authenticatedRequest('/customer/dashboard', {method: 'GET'}),

  getTransactions: ({limit = 100, offset = 0} = {}) =>
    authenticatedRequest(`/customer/transactions?limit=${limit}&offset=${offset}`, {method: 'GET'}),

  getPointsByMerchant: () => authenticatedRequest('/customer/points/merchants', {method: 'GET'}),

  getMerchants: () => authenticatedRequest('/customer/merchants', {method: 'GET'}),

  getSpendable: merchantId =>
    authenticatedRequest(`/customer/merchant/${merchantId}/spendable`, {method: 'GET'}),

  getPurchases: () => authenticatedRequest('/customer/purchases', {method: 'GET'}),

  payWithPoints: (merchantId, purchaseId) =>
    authenticatedRequest(`/customer/merchant/${merchantId}/pay-with-points`, {
      method: 'POST',
      body: JSON.stringify({purchase_id: purchaseId}),
    }),
};

// Merchant endpoints identify the merchant via an `X-Merchant-Id` header rather than the URL path
const merchantRequest = (merchantId, endpoint, options = {}) =>
  authenticatedRequest(endpoint, {
    ...options,
    headers: {...options.headers, 'X-Merchant-Id': merchantId},
  });

export const merchantAPI = {
  getWallet: merchantId => merchantRequest(merchantId, '/merchant/wallet', {method: 'GET'}),

  getProfile: merchantId => merchantRequest(merchantId, '/merchant/profile', {method: 'GET'}),

  getPrograms: merchantId => merchantRequest(merchantId, '/merchant/programs', {method: 'GET'}),

  getProgramBalance: (merchantId, programId) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/balance`, {method: 'GET'}),

  getActivities: (merchantId, {limit = 50, offset = 0} = {}) =>
    merchantRequest(merchantId, `/merchant/activities?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    }),

  lookupCustomer: (merchantId, {email, phoneNumber, customerId}) => {
    const params = [];
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    if (phoneNumber) params.push(`phone_number=${encodeURIComponent(phoneNumber)}`);
    if (customerId) params.push(`customer_id=${encodeURIComponent(customerId)}`);
    return merchantRequest(merchantId, `/merchant/customers/lookup?${params.join('&')}`, {
      method: 'GET',
    });
  },

  createPurchase: (merchantId, {customerId, amount, currency, reference, note}) =>
    merchantRequest(merchantId, '/merchant/purchases', {
      method: 'POST',
      body: JSON.stringify({customer_id: customerId, amount, currency, reference, note}),
    }),

  awardPoints: (merchantId, programId, customerId, {points, reason}) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/customers/${customerId}/award`, {
      method: 'POST',
      body: JSON.stringify({points, reason}),
    }),
};

export default {
  auth: authAPI,
  customer: customerAPI,
  merchant: merchantAPI,
};
