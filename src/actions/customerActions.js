import {customerAPI} from '../services/api';
import cache, {CACHE_KEYS} from '../services/cache';

export const getDashboard = (forceRefresh = false) => async dispatch => {
  dispatch({type: 'DASHBOARD_LOADING'});

  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await cache.get(CACHE_KEYS.DASHBOARD);
      if (cached) {
        dispatch({type: 'DASHBOARD_SUCCESS', payload: cached});
        return cached;
      }
    }

    const response = await customerAPI.getDashboard();

    // Cache the response
    await cache.set(CACHE_KEYS.DASHBOARD, response.data);

    dispatch({type: 'DASHBOARD_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'DASHBOARD_ERROR', payload: error?.message || 'Failed to fetch dashboard'});
    throw error;
  }
};

export const getTransactions = (forceRefresh = false) => async dispatch => {
  dispatch({type: 'TRANSACTIONS_LOADING'});

  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await cache.get(CACHE_KEYS.TRANSACTIONS);
      if (cached) {
        dispatch({type: 'TRANSACTIONS_SUCCESS', payload: cached});
        return cached;
      }
    }

    const response = await customerAPI.getTransactions();

    // Cache the response
    await cache.set(CACHE_KEYS.TRANSACTIONS, response.data);

    dispatch({type: 'TRANSACTIONS_SUCCESS', payload: response.data});
    return response.data;
  } catch (error) {
    dispatch({type: 'TRANSACTIONS_ERROR', payload: error?.message || 'Failed to fetch transactions'});
    throw error;
  }
};

// Invalidate caches after mutations
export const invalidateDashboardCache = () => async () => {
  await cache.invalidateMultiple([CACHE_KEYS.DASHBOARD, CACHE_KEYS.TRANSACTIONS]);
};
