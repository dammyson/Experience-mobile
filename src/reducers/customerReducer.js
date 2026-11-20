const initialState = {
  dashboard: null,
  transactions: [],
  dashboardLoading: false,
  transactionsLoading: false,
  error: null,
  // Bumped when the customer adds or removes a favourite, so screens that
  // fetched the favourites list can refetch it
  favoritesVersion: 0,
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'DASHBOARD_LOADING':
      return {...state, dashboardLoading: true, error: null};
    case 'DASHBOARD_SUCCESS':
      return {...state, dashboardLoading: false, dashboard: action.payload};
    case 'DASHBOARD_ERROR':
      return {...state, dashboardLoading: false, error: action.payload};
    case 'TRANSACTIONS_LOADING':
      return {...state, transactionsLoading: true, error: null};
    case 'TRANSACTIONS_SUCCESS':
      return {...state, transactionsLoading: false, transactions: action.payload};
    case 'TRANSACTIONS_ERROR':
      return {...state, transactionsLoading: false, error: action.payload};
    case 'FAVORITES_CHANGED':
      return {...state, favoritesVersion: state.favoritesVersion + 1};
    case 'AUTH_LOGOUT':
      return {...initialState};
    default:
      return state;
  }
};

export default customerReducer;
