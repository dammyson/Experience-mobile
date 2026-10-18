import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {AppInput, PasswordInput} from '../../components/ui';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {authAPI} from '../../services/api';

const SignUp = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector(state => state.auth);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({index: 0, routes: [{name: 'TabsNavigation'}]});
    }
  }, [isAuthenticated, navigation]);

  const set = field => value => setForm(prev => ({...prev, [field]: value}));

  const handleSignUp = async () => {
    const {firstName, lastName, phoneNumber, email, password, confirmPassword} = form;

    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      const {user, token, refresh_token} = response.data;

      // Store auth data
      await AsyncStorage.setItem('token', token);
      if (refresh_token) {
        await AsyncStorage.setItem('refreshToken', refresh_token);
      }
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('userType', 'customer');
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      // Update Redux state - useEffect will handle navigation
      dispatch({type: 'AUTH_SUCCESS', payload: {user, token, userType: 'customer'}});
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const isValid =
    form.firstName &&
    form.lastName &&
    form.phoneNumber &&
    form.email &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}>
              <BackIcon size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign Up Account</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AppInput
              label="First Name"
              value={form.firstName}
              onChangeText={set('firstName')}
              placeholder="Enter First Name"
              autoCapitalize="words"
            />

            <AppInput
              label="Last Name"
              value={form.lastName}
              onChangeText={set('lastName')}
              placeholder="Enter Last Name"
              autoCapitalize="words"
            />

            <AppInput
              label="Phone Number"
              value={form.phoneNumber}
              onChangeText={set('phoneNumber')}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
              maxLength={15}
            />

            <AppInput
              label="Email"
              value={form.email}
              onChangeText={set('email')}
              placeholder="Enter Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <PasswordInput
              label="Password"
              value={form.password}
              onChangeText={set('password')}
              placeholder="Enter Password (min 8 characters)"
            />

            <PasswordInput
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              placeholder="Re-enter Password"
            />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.ctaButton, (!isValid || loading) && styles.ctaDisabled]}
            onPress={handleSignUp}
            disabled={!isValid || loading}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color={theme.WHITE} />
            ) : (
              <Text style={styles.ctaText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  form: {
    gap: 20,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
    paddingVertical: 16,
    paddingBottom: 40,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  ctaButton: {
    backgroundColor: '#6715EA',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.WHITE,
  },
});

export default SignUp;
