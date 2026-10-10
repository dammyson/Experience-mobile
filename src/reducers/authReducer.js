const initialState = {
  user: null,
  profile: null,
  verifications: [],
  bankAccounts: [],
  token: null,
  isAuthenticated: false,
  loading: false,
  profileLoading: false,
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
    case 'REGISTER_SUCCESS':
      return {...state, loading: false, error: null};
    case 'PROFILE_LOADING':
      return {...state, profileLoading: true, error: null};
    case 'PROFILE_SUCCESS':
      return {
        ...state,
        profileLoading: false,
        user: action.payload.user,
        profile: action.payload.profile,
        verifications: action.payload.verifications || [],
        bankAccounts: action.payload.bank_accounts || [],
      };
    case 'PROFILE_ERROR':
      return {...state, profileLoading: false, error: action.payload};
    case 'AUTH_LOGOUT':
      return {...initialState};
    case 'AUTH_CLEAR_ERROR':
      return {...state, error: null};
    default:
      return state;
  }
};

export default authReducer;
