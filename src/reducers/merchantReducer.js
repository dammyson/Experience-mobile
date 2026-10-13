const initialState = {
  wallet: null,
  profile: null,
  programs: null,
  activities: [],
  activitiesTotal: 0,
  walletLoading: false,
  profileLoading: false,
  programsLoading: false,
  activitiesLoading: false,
  error: null,
};

const merchantReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'MERCHANT_WALLET_LOADING':
      return {...state, walletLoading: true, error: null};
    case 'MERCHANT_WALLET_SUCCESS':
      return {...state, walletLoading: false, wallet: action.payload};
    case 'MERCHANT_WALLET_ERROR':
      return {...state, walletLoading: false, error: action.payload};
    case 'MERCHANT_PROFILE_LOADING':
      return {...state, profileLoading: true, error: null};
    case 'MERCHANT_PROFILE_SUCCESS':
      return {...state, profileLoading: false, profile: action.payload};
    case 'MERCHANT_PROFILE_ERROR':
      return {...state, profileLoading: false, error: action.payload};
    case 'MERCHANT_PROGRAMS_LOADING':
      return {...state, programsLoading: true, error: null};
    case 'MERCHANT_PROGRAMS_SUCCESS':
      return {...state, programsLoading: false, programs: action.payload};
    case 'MERCHANT_PROGRAMS_ERROR':
      return {...state, programsLoading: false, error: action.payload};
    case 'MERCHANT_ACTIVITIES_LOADING':
      return {...state, activitiesLoading: true, error: null};
    case 'MERCHANT_ACTIVITIES_SUCCESS': {
      const incoming = action.payload?.activities || [];
      return {
        ...state,
        activitiesLoading: false,
        activities: action.append ? [...state.activities, ...incoming] : incoming,
        activitiesTotal: action.payload?.total ?? incoming.length,
      };
    }
    case 'MERCHANT_ACTIVITIES_ERROR':
      return {...state, activitiesLoading: false, error: action.payload};
    case 'AUTH_LOGOUT':
      return {...initialState};
    default:
      return state;
  }
};

export default merchantReducer;
