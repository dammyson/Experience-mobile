import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {AppInput, PasswordInput, PrimaryButton} from '../../components/ui';
import PasswordRules, {isStrongPassword} from '../../components/ui/PasswordRules';
import PhoneField from '../../components/ui/PhoneField';
import ExistingAccountLinks from '../../components/auth/ExistingAccountLinks';
import {toNigerianPhone, isNigerianPhone} from '../../utilities/format';
import {authAPI} from '../../services/api';
import {completeRegistration} from '../../actions/authActions';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [accountExists, setAccountExists] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({index: 0, routes: [{name: 'TabsNavigation'}]});
    }
  }, [isAuthenticated, navigation]);

  const set = field => value => {
    setError('');
    setFieldErrors({});
    setAccountExists(false);
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
    setFieldErrors({});
    setAccountExists(false);

    const details = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: toNigerianPhone(form.phoneNumber),
      password: form.password,
    };

    try {
      const response = await authAPI.register(details);

      // A merchant already registered this customer: there are no tokens yet
      if (response.data?.verification_required) {
        navigation.navigate('VerifyRegistration', {details, channel: response.data.channel});
        return;
      }

      // useEffect will handle navigation
      await dispatch(completeRegistration(response.data));
    } catch (err) {
      if (err.status === 422 && Object.keys(err.fieldErrors ?? {}).length) {
        setFieldErrors(err.fieldErrors);
        return;
      }
      setAccountExists(err.status === 409);
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
          {accountExists && <ExistingAccountLinks reason={error} email={form.email.trim()} />}
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
          maxLength={80}
          error={fieldErrors.first_name}
          containerStyle={styles.nameField}
        />
        <AppInput
          label="Last name"
          value={form.lastName}
          onChangeText={set('lastName')}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          maxLength={80}
          error={fieldErrors.last_name}
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
        error={form.email && !emailValid ? 'Enter a valid email address.' : fieldErrors.email}
      />

      <PhoneField
        value={form.phoneNumber}
        onChangeText={set('phoneNumber')}
        error={fieldErrors.phone_number && 'Enter a Nigerian number starting with +234.'}
      />

      <PasswordInput
        label="Password"
        value={form.password}
        onChangeText={set('password')}
        textContentType="newPassword"
        maxLength={128}
        error={fieldErrors.password}
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
