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

export const getMerchantActivities = (merchantId, {limit = 50, offset = 0} = {}) => async dispatch => {
  dispatch({type: 'MERCHANT_ACTIVITIES_LOADING'});
  try {
    const response = await merchantAPI.getActivities(merchantId, {limit, offset});
    dispatch({type: 'MERCHANT_ACTIVITIES_SUCCESS', payload: response.data, append: offset > 0});
    return response.data;
  } catch (error) {
    dispatch({type: 'MERCHANT_ACTIVITIES_ERROR', payload: error?.message || 'Failed to fetch activities'});
    throw error;
  }
};
