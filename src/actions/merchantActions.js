import {merchantAPI} from '../services/api';
import cache, {CACHE_KEYS} from '../services/cache';
import {isCompanyVerified, hasMerchantWallet} from '../utilities/merchantData';

// Skip the call until the loaded profile shows a verified company with a wallet
export const getMerchantWallet = (merchantId, forceRefresh = false) => async (dispatch, getState) => {
  const {profile} = getState().merchant;
  if (!isCompanyVerified(profile) || !hasMerchantWallet(profile)) {
    return null;
  }
  dispatch({type: 'MERCHANT_WALLET_LOADING'});
  try {
    const cacheKey = `${CACHE_KEYS.WALLET}_merchant_${merchantId}`;
    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        dispatch({type: 'MERCHANT_WALLET_SUCCESS', payload: cached});
        return cached;
      }
    }

    const response = await merchantAPI.getWallet(merchantId);
    await cache.set(cacheKey, response.data);
    dispatch({type: 'MERCHANT_WALLET_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_WALLET_ERROR', payload: error?.message || 'Failed to fetch wallet'});
    throw error;
  }
};

export const getMerchantProfile = (merchantId, forceRefresh = false) => async dispatch => {
  dispatch({type: 'MERCHANT_PROFILE_LOADING'});
  try {
    const cacheKey = `${CACHE_KEYS.PROFILE}_merchant_${merchantId}`;
    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        dispatch({type: 'MERCHANT_PROFILE_SUCCESS', payload: cached});
        return cached;
      }
    }

    const response = await merchantAPI.getProfile(merchantId);
    await cache.set(cacheKey, response.data);
    dispatch({type: 'MERCHANT_PROFILE_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_PROFILE_ERROR', payload: error?.message || 'Failed to fetch profile'});
    throw error;
  }
};

export const getMerchantPrograms = (merchantId, forceRefresh = false) => async dispatch => {
  dispatch({type: 'MERCHANT_PROGRAMS_LOADING'});
  try {
    const cacheKey = `merchant_programs_${merchantId}`;
    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        dispatch({type: 'MERCHANT_PROGRAMS_SUCCESS', payload: cached});
        return cached;
      }
    }

    const response = await merchantAPI.getPrograms(merchantId);
    await cache.set(cacheKey, response.data);
    dispatch({type: 'MERCHANT_PROGRAMS_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_PROGRAMS_ERROR', payload: error?.message || 'Failed to fetch programs'});
    throw error;
  }
};

const ACTIVITIES_PAGE_SIZE = 100;

// Latest few activities for the home screen
export const getRecentMerchantActivities = (merchantId, forceRefresh = false) => async dispatch => {
  dispatch({type: 'MERCHANT_RECENT_ACTIVITIES_LOADING'});
  try {
    const cacheKey = `merchant_recent_activities_${merchantId}`;
    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        dispatch({type: 'MERCHANT_RECENT_ACTIVITIES_SUCCESS', payload: cached});
        return cached;
      }
    }

    const response = await merchantAPI.getActivities(merchantId, {limit: 3, offset: 0});
    const activities = response.data?.activities || [];
    await cache.set(cacheKey, activities);
    dispatch({type: 'MERCHANT_RECENT_ACTIVITIES_SUCCESS', payload: activities});
    return response.data;
  } catch (error) {
    dispatch({
      type: 'MERCHANT_RECENT_ACTIVITIES_ERROR',
      payload: error?.message || 'Failed to fetch activities',
    });
    throw error;
  }
};

// Every activity, fetched page by page until `total` is reached
export const getMerchantActivities = merchantId => async dispatch => {
  dispatch({type: 'MERCHANT_ACTIVITIES_LOADING'});
  try {
    const all = [];
    let total = Infinity;
    while (all.length < total) {
      const response = await merchantAPI.getActivities(merchantId, {
        limit: ACTIVITIES_PAGE_SIZE,
        offset: all.length,
      });
      const page = response.data?.activities || [];
      all.push(...page);
      total = response.data?.total ?? all.length;
      if (page.length === 0) {
        break;
      }
    }
    dispatch({type: 'MERCHANT_ACTIVITIES_SUCCESS', payload: all});
    return all;
  } catch (error) {
    dispatch({type: 'MERCHANT_ACTIVITIES_ERROR', payload: error?.message || 'Failed to fetch activities'});
    throw error;
  }
};
