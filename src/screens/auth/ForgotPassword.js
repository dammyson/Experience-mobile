import React, {useState} from 'react';
import {Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import {AppInput, PrimaryButton} from '../../components/ui';
import {authAPI} from '../../services/api';
import {colors, type} from '../../theme/tokens';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 1 of 3 of the reset flow: ForgotPassword → VerifyOTP → ResetPassword
const ForgotPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [email, setEmail] = useState(route.params?.email || '');
  const [error, setError] = useState('');

  const emailValid = EMAIL_PATTERN.test(email.trim());

  const handleSend = async () => {
    setError('');
    try {
      await authAPI.forgotPassword({email: email.trim()});
      navigation.navigate('VerifyOTP', {email: email.trim()});
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    }
  };

  return (
    <FormLayout
      title="Forgot password"
      onBack={() => navigation.goBack()}
      step={{current: 1, total: 3}}
      contentStyle={styles.content}
      footer={<PrimaryButton title="Send code" onPress={handleSend} disabled={!emailValid} />}>
      <Text style={styles.instruction}>
        Enter the email on your account. If it exists, we'll send a 6-digit code.
      </Text>

      <AppInput
        label="Email address"
        value={email}
        onChangeText={value => {
          setEmail(value);
          setError('');
        }}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        error={error || undefined}
      />
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 22,
  },
  instruction: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});

export default ForgotPassword;
