import {merchantAPI} from '../services/api';

export const getMerchantWallet = merchantId => async dispatch => {
  dispatch({type: 'MERCHANT_WALLET_LOADING'});
  try {
    const response = await merchantAPI.getWallet(merchantId);
    dispatch({type: 'MERCHANT_WALLET_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_WALLET_ERROR', payload: error?.message || 'Failed to fetch wallet'});
    throw error;
  }
};

export const getMerchantProfile = merchantId => async dispatch => {
  dispatch({type: 'MERCHANT_PROFILE_LOADING'});
  try {
    const response = await merchantAPI.getProfile(merchantId);
    dispatch({type: 'MERCHANT_PROFILE_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_PROFILE_ERROR', payload: error?.message || 'Failed to fetch profile'});
    throw error;
  }
};

export const getMerchantPrograms = merchantId => async dispatch => {
  dispatch({type: 'MERCHANT_PROGRAMS_LOADING'});
  try {
    const response = await merchantAPI.getPrograms(merchantId);
    dispatch({type: 'MERCHANT_PROGRAMS_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_PROGRAMS_ERROR', payload: error?.message || 'Failed to fetch programs'});
    throw error;
  }
};

const ACTIVITIES_PAGE_SIZE = 100;

// Latest few activities for the home screen
export const getRecentMerchantActivities = (merchantId, limit = 3) => async dispatch => {
  dispatch({type: 'MERCHANT_RECENT_ACTIVITIES_LOADING'});
  try {
    const response = await merchantAPI.getActivities(merchantId, {limit, offset: 0});
    dispatch({type: 'MERCHANT_RECENT_ACTIVITIES_SUCCESS', payload: response.data?.activities || []});
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
