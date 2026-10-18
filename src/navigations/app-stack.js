import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0B0B0E',
  },
};

// Onboarding
import Splash from '../screens/onBoarding/Splash';
import Onboarding from '../screens/onBoarding/Onboarding';
import Welcome from '../screens/onBoarding/Welcome';

// Auth
import Login from '../screens/auth/Login';
import SignUp from '../screens/auth/SignUp';
import ForgotPassword from '../screens/auth/ForgotPassword';
import VerifyOTP from '../screens/auth/VerifyOTP';
import ResetPassword from '../screens/auth/ResetPassword';
import ForgotPin from '../screens/auth/ForgotPin';
import ChangePin from '../screens/auth/ChangePin';
import IdentityVerification from '../screens/auth/IdentityVerification';
import IdentityVerificationSelfie from '../screens/auth/IdentityVerificationSelfie';
import VerificationComplete from '../screens/auth/VerificationComplete';

// Security
import SuspiciousActivity from '../screens/security/SuspiciousActivity';
import LogoutAllDevices from '../screens/security/LogoutAllDevices';

// Transaction
import TransactionDetails from '../screens/transaction/TransactionDetails';
import PaymentStatus from '../screens/transaction/PaymentStatus';

// Support
import FAQ from '../screens/support/FAQ';

// Payment
import CardsAndBanks from '../screens/payment/CardsAndBanks';

// Merchant
import Programs from '../screens/programs/Programs';
import ProgramDetails from '../screens/programs/ProgramDetails';
import AwardPoints from '../screens/programs/AwardPoints';

// Customer
import MyPoints from '../screens/customer/MyPoints';
import CheckEligibility from '../screens/customer/CheckEligibility';
import MerchantEligibility from '../screens/customer/MerchantEligibility';
import Purchases from '../screens/customer/Purchases';
import PayPurchase from '../screens/customer/PayPurchase';

// Orders
import CreateOrder from '../screens/orders/CreateOrder';

// QR code
import MyQRCode from '../screens/qrcode/MyQRCode';

// Main app
import TabsNavigation from './tabs-navigation';
import NavigationService from './NavigationService';

const Stack = createStackNavigator();

const Route = () => {
  return (
    <NavigationContainer ref={ref => NavigationService.setTopLevelNavigator(ref)} theme={AppTheme}>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          cardStyle: {backgroundColor: '#0B0B0E'},
        }}
        initialRouteName="Splash">

        {/* Onboarding */}
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Welcome" component={Welcome} />

        {/* Auth */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="ForgotPin" component={ForgotPin} />
        <Stack.Screen name="ChangePin" component={ChangePin} />
        <Stack.Screen name="IdentityVerification" component={IdentityVerification} />
        <Stack.Screen name="IdentityVerificationSelfie" component={IdentityVerificationSelfie} />
        <Stack.Screen name="VerificationComplete" component={VerificationComplete} />

        {/* Security */}
        <Stack.Screen name="SuspiciousActivity" component={SuspiciousActivity} />
        <Stack.Screen
          name="LogoutAllDevices"
          component={LogoutAllDevices}
          options={{gestureEnabled: false}}
        />

        {/* Transaction */}
        <Stack.Screen name="TransactionDetails" component={TransactionDetails} />
        <Stack.Screen name="PaymentStatus" component={PaymentStatus} />

        {/* Support */}
        <Stack.Screen name="FAQ" component={FAQ} />

        {/* Payment */}
        <Stack.Screen name="CardsAndBanks" component={CardsAndBanks} />

        {/* Merchant */}
        <Stack.Screen name="Programs" component={Programs} />
        <Stack.Screen name="ProgramDetails" component={ProgramDetails} />
        <Stack.Screen name="AwardPoints" component={AwardPoints} />

        {/* Customer */}
        <Stack.Screen name="MyPoints" component={MyPoints} />
        <Stack.Screen name="CheckEligibility" component={CheckEligibility} />
        <Stack.Screen name="MerchantEligibility" component={MerchantEligibility} />
        <Stack.Screen name="Purchases" component={Purchases} />
        <Stack.Screen name="PayPurchase" component={PayPurchase} />

        {/* Orders */}
        <Stack.Screen name="CreateOrder" component={CreateOrder} />

        {/* QR code */}
        <Stack.Screen name="MyQRCode" component={MyQRCode} />

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
