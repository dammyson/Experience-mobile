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

const TRANSACTIONS_PAGE_SIZE = 100;
const MAX_TRANSACTION_PAGES = 50;

// The endpoint is paginated; `data` may be the list itself or an object
// wrapping it (e.g. {transactions, total, limit, offset}).
const extractTransactions = data =>
  Array.isArray(data) ? data : data?.transactions || data?.items || data?.results || [];

// Fetches every page so the Activity tab can show the full history
export const getTransactions = () => async dispatch => {
  dispatch({type: 'TRANSACTIONS_LOADING'});
  try {
    const all = [];
    for (let pageIndex = 0; pageIndex < MAX_TRANSACTION_PAGES; pageIndex++) {
      const response = await customerAPI.getTransactions({
        limit: TRANSACTIONS_PAGE_SIZE,
        offset: all.length,
      });
      const page = extractTransactions(response.data);
      // Stop on a short page, or if the server ignored the offset and repeated a page
      if (page.length === 0 || all.some(tx => tx.id === page[0]?.id)) {
        break;
      }
      all.push(...page);
      const total = response.data?.total;
      if (page.length < TRANSACTIONS_PAGE_SIZE || (total != null && all.length >= total)) {
        break;
      }
    }
    dispatch({type: 'TRANSACTIONS_SUCCESS', payload: all});
    return all;
  } catch (error) {
    dispatch({type: 'TRANSACTIONS_ERROR', payload: error?.message || 'Failed to fetch transactions'});
    throw error;
  }
};
