import {customerAPI} from '../services/api';

export const getDashboard = () => async dispatch => {
  dispatch({type: 'DASHBOARD_LOADING'});
  try {
    const response = await customerAPI.getDashboard();
    dispatch({type: 'DASHBOARD_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'DASHBOARD_ERROR', payload: error?.message || 'Failed to fetch dashboard'});
    throw error;
  }
};

export const getTransactions = () => async dispatch => {
  dispatch({type: 'TRANSACTIONS_LOADING'});
  try {
    const response = await customerAPI.getTransactions();
    dispatch({type: 'TRANSACTIONS_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'TRANSACTIONS_ERROR', payload: error?.message || 'Failed to fetch transactions'});
    throw error;
  }
};
