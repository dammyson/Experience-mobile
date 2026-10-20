import React from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import store from './src/store';
import Route from './src/navigations/app-stack';

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Route />
        <FlashMessage position="top" />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
