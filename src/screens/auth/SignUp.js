import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormLayout from '../../components/layout/FormLayout';
import {AppInput, PasswordInput, PrimaryButton} from '../../components/ui';
import PasswordRules, {isStrongPassword} from '../../components/ui/PasswordRules';
import PhoneField from '../../components/ui/PhoneField';
import {toNigerianPhone, isNigerianPhone} from '../../utilities/format';
import {authAPI} from '../../services/api';
import {colors, type} from '../../theme/tokens';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({index: 0, routes: [{name: 'TabsNavigation'}]});
    }
  }, [isAuthenticated, navigation]);

  const set = field => value => {
    setError('');
    setForm(prev => ({...prev, [field]: value}));
  };

  const emailValid = EMAIL_PATTERN.test(form.email.trim());
  const phoneValid = isNigerianPhone(form.phoneNumber);
  const isValid =
    !!form.firstName.trim() &&
    !!form.lastName.trim() &&
    emailValid &&
    phoneValid &&
    isStrongPassword(form.password);

  const handleSignUp = async () => {
    if (!isValid) {
      return;
    }
    setError('');

    try {
      const response = await authAPI.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: toNigerianPhone(form.phoneNumber),
        password: form.password,
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
    }
  };

  return (
    <FormLayout
      title="Create account"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.serverError} accessibilityRole="alert">
              {error}
            </Text>
          )}
          {/* TODO: link Terms and Privacy Policy once their URLs exist */}
          <Text style={styles.legal}>
            By continuing you agree to the Terms and Privacy Policy.
          </Text>
          <PrimaryButton title="Create account" onPress={handleSignUp} disabled={!isValid} />
          <Text style={styles.footerText}>
            Have a business?{' '}
            <Text
              style={styles.link}
              accessibilityRole="link"
              onPress={() => navigation.navigate('MerchantRegister')}>
              Register it instead
            </Text>
          </Text>
        </>
      }>
      <Text style={styles.intro}>Start collecting points from your favourite places.</Text>

      <View style={styles.nameRow}>
        <AppInput
          label="First name"
          value={form.firstName}
          onChangeText={set('firstName')}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          containerStyle={styles.nameField}
        />
        <AppInput
          label="Last name"
          value={form.lastName}
          onChangeText={set('lastName')}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          containerStyle={styles.nameField}
        />
      </View>

      <AppInput
        label="Email address"
        value={form.email}
        onChangeText={set('email')}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        error={form.email && !emailValid ? 'Enter a valid email address.' : undefined}
      />

      <PhoneField value={form.phoneNumber} onChangeText={set('phoneNumber')} />

      <PasswordInput
        label="Password"
        value={form.password}
        onChangeText={set('password')}
        textContentType="newPassword"
      />
      <PasswordRules password={form.password} />
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  intro: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: {
    flex: 1,
  },
  legal: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  link: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
  footerText: {
    ...type.label,
    color: colors.textMuted,
    textAlign: 'center',
  },
  serverError: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default SignUp;
