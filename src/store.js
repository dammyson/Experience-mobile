import {createStore, applyMiddleware} from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './reducers';

const middlewares = [thunk];

if (__DEV__) {
  const {createLogger} = require('redux-logger');
  middlewares.push(createLogger({collapsed: true}));
}

const store = createStore(rootReducer, applyMiddleware(...middlewares));

export default store;
