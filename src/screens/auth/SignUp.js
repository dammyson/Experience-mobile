import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {AppInput, PasswordInput} from '../../components/ui';
import BackIcon from '../../components/icons/BackIcon';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const {height} = Dimensions.get('window');

const SignUp = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const set = field => value => setForm(prev => ({...prev, [field]: value}));

  const handleSignUp = () => {
    const {firstName, lastName, email, phone, password, confirmPassword} = form;
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    // TODO: dispatch signup action
  };

  const isValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.password &&
    form.confirmPassword;

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
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <BackIcon />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoBlock}>
            <Text style={styles.logoText}>Arena</Text>
            <Text style={styles.tagline}>Unified Loyalty Network</Text>
          </View>

          <Text style={styles.screenTitle}>Create Account</Text>

          {/* Name row */}
          <View style={styles.row}>
            <View style={styles.half}>
              <AppInput
                label="First Name"
                value={form.firstName}
                onChangeText={set('firstName')}
                placeholder="First name"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.half}>
              <AppInput
                label="Last Name"
                value={form.lastName}
                onChangeText={set('lastName')}
                placeholder="Last name"
                autoCapitalize="words"
              />
            </View>
          </View>

          <AppInput
            label="Email"
            value={form.email}
            onChangeText={set('email')}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppInput
            label="Phone Number"
            value={form.phone}
            onChangeText={set('phone')}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            maxLength={15}
          />

          <PasswordInput
            label="Password"
            value={form.password}
            onChangeText={set('password')}
            placeholder="Create a password"
          />

          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            placeholder="Confirm your password"
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.ctaButton, !isValid && styles.ctaDisabled]}
            onPress={handleSignUp}
            disabled={!isValid}
            activeOpacity={0.85}>
            <Text style={styles.ctaText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    paddingTop: 60,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  logoText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 36,
    color: theme.TEXT_WHITE,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    marginTop: 4,
    letterSpacing: 1,
  },
  screenTitle: {
    ...textStyles.displaySm,
    color: theme.TEXT_PRIMARY,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginPrompt: {
    ...textStyles.textLg,
    color: theme.TEXT_TERTIARY,
  },
  loginLink: {
    ...textStyles.textLgBold,
    color: theme.PRIMARY_COLOR,
  },
});

export default SignUp;
