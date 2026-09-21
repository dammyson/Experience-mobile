import React from 'react';
import {Provider} from 'react-redux';
import FlashMessage from 'react-native-flash-message';
import store from './src/store';
import Route from './src/navigations/app-stack';

const App = () => {
  return (
    <Provider store={store}>
      <Route />
      <FlashMessage position="top" />
    </Provider>
  );
};

export default App;
