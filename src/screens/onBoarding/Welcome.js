import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {Path, G, Defs, ClipPath, Rect} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

const {height} = Dimensions.get('window');

const AppleIcon = () => (
  <Svg width={20} height={24} viewBox="0 0 20 24" fill="none">
    <Path
      d="M19.0781 18.4219C18.7812 19.1719 18.4219 19.8594 18 20.4844C17.4219 21.3281 16.9531 21.9219 16.5938 22.2656C16.0312 22.8281 15.4219 23.1094 14.7656 23.1094C14.2969 23.1094 13.7344 22.9688 13.0781 22.6875C12.4219 22.4062 11.8125 22.2656 11.25 22.2656C10.6719 22.2656 10.0469 22.4062 9.375 22.6875C8.70312 22.9688 8.15625 23.1094 7.73438 23.1094C7.07812 23.1094 6.45312 22.8281 5.85938 22.2656C5.46875 21.9062 4.98438 21.2969 4.40625 20.4375C3.78125 19.5156 3.26562 18.4531 2.85938 17.25C2.42188 15.9531 2.20312 14.7031 2.20312 13.5C2.20312 12.1406 2.48438 10.9688 3.04688 9.98438C3.48438 9.21875 4.07812 8.60938 4.82812 8.15625C5.57812 7.70312 6.39062 7.47656 7.26562 7.47656C7.76562 7.47656 8.40625 7.64062 9.1875 7.96875C9.96875 8.29688 10.4844 8.46875 10.7344 8.46875C10.9219 8.46875 11.4844 8.26562 12.4219 7.85938C13.3125 7.48438 14.0625 7.32812 14.6719 7.39062C16.3281 7.53125 17.5781 8.21875 18.4219 9.45312C16.9375 10.3594 16.2031 11.6094 16.2188 13.2031C16.2344 14.4531 16.6875 15.4844 17.5781 16.2969C18.0156 16.7188 18.5 17.0469 19.0312 17.2812C18.9062 17.6719 18.7812 18.0469 18.6562 18.4219H19.0781ZM14.7812 0.9375C14.7812 1.92188 14.4219 2.84375 13.7031 3.70312C12.8438 4.71875 11.7969 5.29688 10.6562 5.20312C10.6406 5.07812 10.6328 4.94531 10.6328 4.80469C10.6328 3.85938 11.0469 2.85938 11.7812 2.01562C12.1484 1.58594 12.6172 1.23438 13.1875 0.960938C13.7578 0.6875 14.2969 0.539062 14.8047 0.515625C14.8203 0.65625 14.8281 0.796875 14.8281 0.9375H14.7812Z"
      fill="#000000"
    />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <G clipPath="url(#clip0)">
      <Path
        d="M19.8055 10.2305C19.8055 9.55039 19.7499 8.86711 19.6319 8.19824H10.2002V12.0488H15.6016C15.3774 13.2905 14.6573 14.3893 13.6027 15.0873V17.586H16.8253C18.7178 15.8443 19.8055 13.2723 19.8055 10.2305Z"
        fill="#4285F4"
      />
      <Path
        d="M10.2002 20.0003C12.897 20.0003 15.1716 19.1148 16.8286 17.5858L13.606 15.0871C12.7096 15.6975 11.5522 16.0428 10.2035 16.0428C7.59474 16.0428 5.38272 14.2828 4.58904 11.9165H1.26367V14.4923C2.96127 17.8691 6.41892 20.0003 10.2002 20.0003Z"
        fill="#34A853"
      />
      <Path
        d="M4.58565 11.9163C4.16676 10.6746 4.16676 9.32947 4.58565 8.0878V5.51196H1.26361C-0.154389 8.33749 -0.154389 11.6666 1.26361 14.4921L4.58565 11.9163Z"
        fill="#FBBC04"
      />
      <Path
        d="M10.2002 3.95756C11.6259 3.93552 13.0035 4.47198 14.036 5.45656L16.8912 2.60129C15.0833 0.904232 12.6838 -0.0292021 10.2002 -0.000260528C6.41892 -0.000260528 2.96127 2.13094 1.26367 5.51171L4.58571 8.08755C5.37606 5.71794 7.59141 3.95756 10.2002 3.95756Z"
        fill="#EA4335"
      />
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect width="20" height="20" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const Welcome = () => {
  const navigation = useNavigation();

  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple Sign In');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In
    console.log('Google Sign In');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Gradient Decoration */}
      <View style={styles.gradientContainer}>
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#8B5CF6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradient}
        />
      </View>

      <View style={styles.container}>
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to VAULTA</Text>
          <Text style={styles.subtitle}>
            A secure, fast digital wallet that is always under your control.
          </Text>

          {/* Sign In Buttons */}
          <TouchableOpacity
            style={styles.appleBtn}
            onPress={handleAppleSignIn}
            activeOpacity={0.8}>
            <AppleIcon />
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}>
            <GoogleIcon />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms and Conditions</Text>. Learn how we use
            your data in our <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* Support */}
          <View style={styles.supportRow}>
            <Text style={styles.supportText}>Trouble logging in? </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.supportLink}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 400,
    height: height * 0.6,
    transform: [{rotate: '-15deg'}],
    opacity: 0.3,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    color: theme.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: theme.TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 32,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 16,
    marginBottom: 12,
  },
  appleBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 16,
    marginBottom: 24,
  },
  googleBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signUpText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_SECONDARY,
  },
  signUpLink: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#8B5CF6',
  },
  terms: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  termsLink: {
    color: theme.TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  supportText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  supportLink: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#8B5CF6',
  },
});

export default Welcome;
