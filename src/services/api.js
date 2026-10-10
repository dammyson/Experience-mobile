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

  console.log('[API Request] /auth/refresh: Refreshing token...');

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({refresh_token: refreshToken}),
  });

  const data = await response.json();
  console.log('[API Response] /auth/refresh:', JSON.stringify(data, null, 2));

  if (!response.ok || data.success === false) {
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user', 'profile']);
    throw new Error('Session expired. Please login again.');
  }

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
  console.log(`[API Response] ${endpoint}:`, JSON.stringify(data, null, 2));

  if (!response.ok || data.success === false) {
    const errorMessage = data.detail || data.message || data.error || 'Something went wrong';
    console.log(`[API Error] ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }
  return data;
};

const authenticatedRequest = async (endpoint, options = {}) => {
  const headers = await getHeaders();
  const fullUrl = `${BASE_URL}${endpoint}`;

  console.log(`[API Request] ${endpoint}:`, options.body || 'GET');

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
  register: async ({firstName, lastName, email, phoneNumber, password}) => {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      password,
    };
    console.log('[API Request] /auth/register/customer:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/auth/register/customer`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    return handleResponse(response, '/auth/register/customer');
  },

  login: async ({email, phoneNumber, password}) => {
    const payload = {password};
    if (email) payload.email = email;
    if (phoneNumber) payload.phone_number = phoneNumber;

    console.log('[API Request] /auth/login:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    return handleResponse(response, '/auth/login');
  },

  forgotPassword: async ({email}) => {
    const payload = {email};
    console.log('[API Request] /auth/forgot-password:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    return handleResponse(response, '/auth/forgot-password');
  },

  verifyOtp: async ({email, otp}) => {
    const payload = {email, otp};
    console.log('[API Request] /auth/verify-otp:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    return handleResponse(response, '/auth/verify-otp');
  },

  resetPassword: async ({email, otp, newPassword}) => {
    const payload = {email, otp, new_password: newPassword};
    console.log('[API Request] /auth/reset-password:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    return handleResponse(response, '/auth/reset-password');
  },

  refreshToken: async ({refreshToken}) => {
    const payload = {refresh_token: refreshToken};
    console.log('[API Request] /auth/refresh:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    return handleResponse(response, '/auth/refresh');
  },
};

export const customerAPI = {
  getProfile: () => authenticatedRequest('/customer/profile', {method: 'GET'}),

  getWallet: () => authenticatedRequest('/customer/wallet', {method: 'GET'}),

  getDashboard: () => authenticatedRequest('/customer/dashboard', {method: 'GET'}),

  getTransactions: () => authenticatedRequest('/customer/transactions', {method: 'GET'}),
};

export default {
  auth: authAPI,
  customer: customerAPI,
};
