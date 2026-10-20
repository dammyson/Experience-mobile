import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const BASE_URL = config.API_URL;

// Thrown when the refresh token is missing or rejected; screens use it to show
// the expired-session state
export const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again.';

// Called once the refresh token is rejected, so the app can sign out and show
// the login screen (registered in navigations/app-stack.js)
let sessionExpiredHandler = null;
export const setSessionExpiredHandler = handler => {
  sessionExpiredHandler = handler;
};

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
    sessionExpiredHandler?.();
    throw new Error(SESSION_EXPIRED_MESSAGE);
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
    sessionExpiredHandler?.();
    throw new Error(SESSION_EXPIRED_MESSAGE);
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

  // DELETE and some actions may reply 204 with no body
  if (response.status === 204) {
    logResponse(endpoint, {status: 204});
    return {success: true, data: null};
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

  // Creates the business and its admin user. The admin signs in afterwards with
  // POST /auth/login/merchant.
  // TODO: confirm the admin_user field names, and the country / currency
  // formats, with the backend — the README only lists admin_user{…}.
  registerMerchant: ({name, slug, description, businessEmail, businessPhone, country, currency, admin}) =>
    request('/merchant/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        slug,
        description,
        business_email: businessEmail,
        business_phone: businessPhone,
        country,
        currency,
        admin_user: {
          first_name: admin.firstName,
          last_name: admin.lastName,
          email: admin.email,
          phone_number: admin.phoneNumber,
          password: admin.password,
        },
      }),
    }),

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

  // Optional filters: {status: 'OPEN', merchantId}
  getPurchases: ({status, merchantId} = {}) => {
    const params = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (merchantId) params.push(`merchant_id=${encodeURIComponent(merchantId)}`);
    return authenticatedRequest(`/customer/purchases${params.length ? `?${params.join('&')}` : ''}`, {
      method: 'GET',
    });
  },

  getFavoriteMerchants: () =>
    authenticatedRequest('/customer/favorites/merchants', {method: 'GET'}),

  addFavoriteMerchant: merchantId =>
    authenticatedRequest(`/customer/merchants/${merchantId}/favorite`, {method: 'POST'}),

  removeFavoriteMerchant: merchantId =>
    authenticatedRequest(`/customer/merchants/${merchantId}/favorite`, {method: 'DELETE'}),

  getPromos: () => authenticatedRequest('/customer/promos', {method: 'GET'}),

  claimGiveaway: giveawayCode =>
    authenticatedRequest('/customer/giveaways/claim', {
      method: 'POST',
      body: JSON.stringify({giveaway_code: giveawayCode}),
    }),

  getAccountBalance: () =>
    authenticatedRequest('/safehaven/customer/account-balance', {method: 'GET'}),

  sendPoints: (merchantId, {points, note}) =>
    authenticatedRequest(`/customer/merchant/${merchantId}/send-points`, {
      method: 'POST',
      body: JSON.stringify({points_to_use: points, ...(note ? {note} : {})}),
    }),

  // First-time wallet setup after identity verification.
  // TODO: confirm the request body with the backend — the README doesn't list one.
  createWallet: () => authenticatedRequest('/customer/wallet', {method: 'POST', body: JSON.stringify({})}),

  payWithPoints: (merchantId, purchaseId) =>
    authenticatedRequest(`/customer/merchant/${merchantId}/pay-with-points`, {
      method: 'POST',
      body: JSON.stringify({purchase_id: purchaseId}),
    }),
};

// Safe Haven routes the app may call. The token, account-listing and subaccount
// routes are server-only and must never be added here.
export const safeHavenAPI = {
  getBanks: () => authenticatedRequest('/safehaven/banks', {method: 'GET'}),

  // Returns the account name and a sessionId to send as name_enquiry_reference.
  // TODO: confirm the request field names with the backend.
  nameEnquiry: ({bankCode, accountNumber}) =>
    authenticatedRequest('/safehaven/name-enquiry', {
      method: 'POST',
      body: JSON.stringify({bank_code: bankCode, account_number: accountNumber}),
    }),

  transferExternal: ({
    nameEnquiryReference,
    debitAccountNumber,
    bankCode,
    accountNumber,
    amount,
    narration,
    paymentReference,
    saveBeneficiary,
  }) =>
    authenticatedRequest('/safehaven/transfers/external', {
      method: 'POST',
      body: JSON.stringify({
        name_enquiry_reference: nameEnquiryReference,
        debit_account_number: debitAccountNumber,
        beneficiary_bank_code: bankCode,
        beneficiary_account_number: accountNumber,
        amount,
        narration,
        payment_reference: paymentReference,
        save_beneficiary: saveBeneficiary,
      }),
    }),

  verifyIdentity: ({number}) =>
    authenticatedRequest('/safehaven/identity/verify', {
      method: 'POST',
      body: JSON.stringify({type: 'BVN', number, async: false}),
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

  // Optional filters: activityType ('POINTS' | 'WALLET'), programId, customerId,
  // startDate / endDate (ISO dates)
  getActivities: (
    merchantId,
    {limit = 50, offset = 0, activityType, programId, customerId, startDate, endDate} = {},
  ) => {
    const params = [`limit=${limit}`, `offset=${offset}`];
    if (activityType) params.push(`activity_type=${activityType}`);
    if (programId) params.push(`program_id=${encodeURIComponent(programId)}`);
    if (customerId) params.push(`customer_id=${encodeURIComponent(customerId)}`);
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    return merchantRequest(merchantId, `/merchant/activities?${params.join('&')}`, {method: 'GET'});
  },

  // Send exactly one identifier
  lookupCustomer: (merchantId, {email, phoneNumber, customerId, merchantCustomerId}) => {
    const params = [];
    if (merchantCustomerId) params.push(`merchant_customer_id=${encodeURIComponent(merchantCustomerId)}`);
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

  getProgramRedemptionPolicy: (merchantId, programId) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/redemption-policy`, {method: 'GET'}),

  // PREPAID sends funding_amount; POSTPAID must not
  createProgram: (merchantId, program) =>
    merchantRequest(merchantId, '/merchant/programs', {
      method: 'POST',
      body: JSON.stringify({
        name: program.name,
        billing_type: program.billingType,
        ...(program.billingType === 'PREPAID' ? {funding_amount: program.fundingAmount} : {}),
        earning_type: 'FIXED_RATE',
        points_per_currency_unit: program.pointsPerCurrencyUnit,
        point_value: program.pointValue,
        maximum_redemption_percentage: program.maxRedemptionPercentage,
        redeemable_merchant_ids: program.redeemableMerchantIds,
        expiration_type: 'NEVER',
        redemption_mode: 'PRIVATE',
      }),
    }),

  closeProgram: (merchantId, programId) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/close`, {method: 'POST'}),

  settleProgram: (merchantId, programId) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/settle`, {method: 'POST'}),

  // Creates the customer if no one matches the identifier.
  // TODO: confirm the body field names with the backend; these mirror the lookup params.
  awardByIdentifier: (merchantId, programId, {identifier, points, reason}) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/award`, {
      method: 'POST',
      body: JSON.stringify({...identifier, points, reason}),
    }),

  // Partial reversal sends `points`; a full reversal omits it.
  // TODO: confirm whether the endpoint accepts `reason`.
  reverseAward: (merchantId, programId, ledgerEntryId, {points, reason}) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/awards/${ledgerEntryId}/reverse`, {
      method: 'POST',
      body: JSON.stringify({...(points != null ? {points} : {}), ...(reason ? {reason} : {})}),
    }),

  // TODO: confirm the giveaway body with the backend — the README only names the route.
  createGiveaway: (merchantId, {programId, name, pointsPerClaim, maxClaims}) =>
    merchantRequest(merchantId, '/merchant/giveaways', {
      method: 'POST',
      body: JSON.stringify({
        program_id: programId,
        name,
        points_per_claim: pointsPerClaim,
        max_claims: maxClaims,
      }),
    }),

  getGiveawayStatus: (merchantId, giveawayId) =>
    merchantRequest(merchantId, `/merchant/giveaways/${giveawayId}/status`, {method: 'GET'}),

  closeGiveaway: (merchantId, giveawayId) =>
    merchantRequest(merchantId, `/merchant/giveaways/${giveawayId}/close`, {method: 'POST'}),

  getPromos: merchantId => merchantRequest(merchantId, '/merchant/promos', {method: 'GET'}),

  // TODO: confirm promo fields with the backend; only status ACTIVE is documented.
  createPromo: (merchantId, {title, description, status}) =>
    merchantRequest(merchantId, '/merchant/promos', {
      method: 'POST',
      body: JSON.stringify({title, description, status}),
    }),

  updatePromo: (merchantId, promoId, changes) =>
    merchantRequest(merchantId, `/merchant/promos/${promoId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    }),

  deletePromo: (merchantId, promoId) =>
    merchantRequest(merchantId, `/merchant/promos/${promoId}`, {method: 'DELETE'}),

  // TODO: confirm the fund-wallet body with the backend.
  fundWallet: (merchantId, {amount}) =>
    merchantRequest(merchantId, '/merchant/wallet/fund', {
      method: 'POST',
      body: JSON.stringify({amount}),
    }),

  verifyCompany: (merchantId, {registrationNumber, companyName}) =>
    merchantRequest(merchantId, '/merchant/verification/company', {
      method: 'POST',
      body: JSON.stringify({
        registration_type: 'CAC',
        registration_number: registrationNumber,
        company_name: companyName,
      }),
    }),

  getAccountBalance: merchantId =>
    merchantRequest(merchantId, '/safehaven/merchant/account-balance', {method: 'GET'}),

  awardPoints: (merchantId, programId, customerId, {points, reason}) =>
    merchantRequest(merchantId, `/merchant/programs/${programId}/customers/${customerId}/award`, {
      method: 'POST',
      body: JSON.stringify({points, reason}),
    }),
};

export default {
  auth: authAPI,
  customer: customerAPI,
  safeHaven: safeHavenAPI,
  merchant: merchantAPI,
};
