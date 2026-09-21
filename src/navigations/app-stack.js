import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Onboarding
import Splash from '../screens/onBoarding/Splash';

// Auth
import Login from '../screens/auth/Login';
import SignUp from '../screens/auth/SignUp';
import ForgotPassword from '../screens/auth/ForgotPassword';
import VerifyOTP from '../screens/auth/VerifyOTP';
import ResetPassword from '../screens/auth/ResetPassword';
import ForgotPin from '../screens/auth/ForgotPin';
import ChangePin from '../screens/auth/ChangePin';

// Security
import SuspiciousActivity from '../screens/security/SuspiciousActivity';
import LogoutAllDevices from '../screens/security/LogoutAllDevices';

// Main app
import TabsNavigation from './tabs-navigation';
import NavigationService from './NavigationService';

const Stack = createStackNavigator();

const Route = () => {
  return (
    <NavigationContainer ref={ref => NavigationService.setTopLevelNavigator(ref)}>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          cardStyle: {backgroundColor: '#0B0B0E'},
        }}
        initialRouteName="Splash">

        {/* Onboarding */}
        <Stack.Screen name="Splash" component={Splash} />

        {/* Auth */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="ForgotPin" component={ForgotPin} />
        <Stack.Screen name="ChangePin" component={ChangePin} />

        {/* Security */}
        <Stack.Screen name="SuspiciousActivity" component={SuspiciousActivity} />
        <Stack.Screen
          name="LogoutAllDevices"
          component={LogoutAllDevices}
          options={{gestureEnabled: false}}
        />

        {/* Main App */}
        <Stack.Screen
          name="TabsNavigation"
          component={TabsNavigation}
          options={{gestureEnabled: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Route;
