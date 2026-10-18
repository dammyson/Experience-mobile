import {combineReducers} from 'redux';
import authReducer from './authReducer';
import customerReducer from './customerReducer';
import merchantReducer from './merchantReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  merchant: merchantReducer,
});

export default rootReducer;
