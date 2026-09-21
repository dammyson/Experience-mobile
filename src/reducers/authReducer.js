const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {...state, loading: true, error: null};
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'AUTH_ERROR':
      return {...state, loading: false, error: action.payload};
    case 'AUTH_LOGOUT':
      return {...initialState};
    default:
      return state;
  }
};

export default authReducer;
