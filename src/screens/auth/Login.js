import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {AppInput, PasswordInput, PrimaryButton, ChoiceGrid} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {login} from '../../actions/authActions';
import {colors, type} from '../../theme/tokens';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {loading, error, isAuthenticated} = useSelector(state => state.auth);

  const [role, setRole] = useState(route.params?.role || 'customer');
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);

  const isMerchant = role === 'merchant';
  const emailValid = EMAIL_PATTERN.test(email.trim());

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({index: 0, routes: [{name: 'TabsNavigation'}]});
    }
  }, [isAuthenticated, navigation]);

  // Drop a stale server error once the user edits the form
  const clearError = () => {
    if (error) {
      dispatch({type: 'AUTH_CLEAR_ERROR'});
    }
  };

  const handleLogin = async () => {
    setTried(true);
    if (!emailValid || !password) {
      return;
    }
    try {
      await dispatch(login(email.trim(), password, role));
    } catch (e) {
      // Shown from state.auth.error
    }
  };

  const roleOptions = [
    {
      id: 'customer',
      label: 'Customer',
      icon: <Icon name="profile" size={24} color={colors.text} />,
    },
    {
      id: 'merchant',
      label: 'Merchant',
      icon: <Icon name="business" size={24} color={colors.text} />,
    },
  ];

  return (
    <FormLayout
      title="Sign in"
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.serverError} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton
            title={isMerchant ? 'Sign in to business' : 'Sign in'}
            onPress={handleLogin}
            loading={loading}
          />
          <Text style={styles.footerText}>
            New to Arena?{' '}
            <Text
              style={styles.link}
              accessibilityRole="link"
              onPress={() => navigation.navigate(isMerchant ? 'MerchantRegister' : 'SignUp')}>
              {isMerchant ? 'Register your business' : 'Create an account'}
            </Text>
          </Text>
        </>
      }>
      <ChoiceGrid
        prompt="Choose account type"
        options={roleOptions}
        value={role}
        onChange={id => {
          setRole(id);
          clearError();
        }}
      />

      <View style={styles.fields}>
        <AppInput
          label="Email address"
          value={email}
          onChangeText={value => {
            setEmail(value);
            clearError();
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          error={tried && !emailValid ? 'Enter a valid email address.' : undefined}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={value => {
            setPassword(value);
            clearError();
          }}
          placeholder="Your password"
          textContentType="password"
          error={tried && !password ? 'Enter your password.' : undefined}
        />
      </View>

      <TouchableOpacity
        style={styles.forgot}
        onPress={() => navigation.navigate('ForgotPassword', {email: emailValid ? email.trim() : ''})}
        accessibilityRole="link"
        hitSlop={{top: 8, bottom: 8, left: 12, right: 0}}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 22,
    gap: 18,
  },
  fields: {
    marginTop: 6,
    gap: 18,
  },
  forgot: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
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

export default Login;
