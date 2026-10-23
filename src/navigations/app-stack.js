import React, {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {colors} from '../theme/tokens';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
  },
};

// Onboarding
import Splash from '../screens/onBoarding/Splash';
import Onboarding from '../screens/onBoarding/Onboarding';
import Welcome from '../screens/onBoarding/Welcome';

// Auth
import Login from '../screens/auth/Login';
import SignUp from '../screens/auth/SignUp';
import MerchantRegister from '../screens/auth/MerchantRegister';
import MerchantVerification from '../screens/auth/MerchantVerification';
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
import ProgramDetails from '../screens/programs/ProgramDetails';
import AwardPoints from '../screens/programs/AwardPoints';
import CreateProgram from '../screens/programs/CreateProgram';
import ReverseAward from '../screens/programs/ReverseAward';
import MerchantActivity from '../screens/activity/MerchantActivity';
import Promotions from '../screens/merchant/Promotions';
import PromoForm from '../screens/merchant/PromoForm';
import CreateGiveaway from '../screens/merchant/CreateGiveaway';
import Giveaway from '../screens/merchant/Giveaway';

// Customer
import MyPoints from '../screens/customer/MyPoints';
import CheckEligibility from '../screens/customer/CheckEligibility';
import MerchantEligibility from '../screens/customer/MerchantEligibility';
import Purchases from '../screens/customer/Purchases';
import PayPurchase from '../screens/customer/PayPurchase';
import SelectPurchase from '../screens/customer/SelectPurchase';
import PayWithPoints from '../screens/customer/PayWithPoints';
import SendPoints from '../screens/customer/SendPoints';

// Bank transfer
import Transfer from '../screens/transfer/Transfer';
import TransferStatus from '../screens/transfer/TransferStatus';
import VerifyIdentity from '../screens/auth/VerifyIdentity';

// Orders
import CreateOrder from '../screens/orders/CreateOrder';

// QR code
import MyQRCode from '../screens/qrcode/MyQRCode';

// Main app
import TabsNavigation from './tabs-navigation';
import NavigationService from './NavigationService';
import {setSessionExpiredHandler} from '../services/api';
import {logout} from '../actions/authActions';

const Stack = createStackNavigator();

const Route = () => {
  const dispatch = useDispatch();
  const handlingExpiry = useRef(false);

  // Several requests can fail at once when the session expires; handle it once
  useEffect(() => {
    setSessionExpiredHandler(async () => {
      if (handlingExpiry.current) {
        return;
      }
      handlingExpiry.current = true;
      await dispatch(logout());
      NavigationService.reset('Login');
      showMessage({message: 'Your session has expired. Sign in again to carry on.', type: 'warning'});
      setTimeout(() => {
        handlingExpiry.current = false;
      }, 3000);
    });
    return () => setSessionExpiredHandler(null);
  }, [dispatch]);

  return (
    <NavigationContainer ref={ref => NavigationService.setTopLevelNavigator(ref)} theme={AppTheme}>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          cardStyle: {backgroundColor: colors.bg},
        }}
        initialRouteName="Splash">

        {/* Onboarding */}
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Welcome" component={Welcome} />

        {/* Auth */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="MerchantRegister" component={MerchantRegister} />
        <Stack.Screen
          name="MerchantVerification"
          component={MerchantVerification}
          options={{gestureEnabled: false}}
        />
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
        {/* "Programs" is a merchant tab, so there's no stack route with that name */}
        <Stack.Screen name="ProgramDetails" component={ProgramDetails} />
        <Stack.Screen name="AwardPoints" component={AwardPoints} />
        <Stack.Screen name="CreateProgram" component={CreateProgram} />
        <Stack.Screen name="ReverseAward" component={ReverseAward} />
        <Stack.Screen name="CustomerActivity" component={MerchantActivity} />
        <Stack.Screen name="Promotions" component={Promotions} />
        <Stack.Screen name="PromoForm" component={PromoForm} />
        <Stack.Screen name="CreateGiveaway" component={CreateGiveaway} />
        <Stack.Screen name="Giveaway" component={Giveaway} />

        {/* Customer */}
        <Stack.Screen name="MyPoints" component={MyPoints} />
        <Stack.Screen name="CheckEligibility" component={CheckEligibility} />
        <Stack.Screen name="MerchantEligibility" component={MerchantEligibility} />
        <Stack.Screen name="Purchases" component={Purchases} />
        <Stack.Screen name="PayPurchase" component={PayPurchase} />
        <Stack.Screen name="SelectPurchase" component={SelectPurchase} />
        <Stack.Screen name="PayWithPoints" component={PayWithPoints} />
        <Stack.Screen name="SendPoints" component={SendPoints} />

        {/* Bank transfer */}
        <Stack.Screen name="VerifyIdentity" component={VerifyIdentity} />
        <Stack.Screen name="Transfer" component={Transfer} />
        <Stack.Screen
          name="TransferStatus"
          component={TransferStatus}
          options={{gestureEnabled: false}}
        />

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
