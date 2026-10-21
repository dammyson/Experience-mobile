import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import {PasswordInput, PrimaryButton, StatusIcon} from '../../components/ui';
import PasswordRules, {isStrongPassword} from '../../components/ui/PasswordRules';
import {authAPI} from '../../services/api';
import {colors, type} from '../../theme/tokens';

// Step 3 of 3 of the reset flow, then the "All set" state
const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email, otp} = route.params ?? {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isValid = isStrongPassword(password) && password === confirmPassword;

  const handleReset = async () => {
    setError('');
    try {
      await authAPI.resetPassword({email, otp, newPassword: password});
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    }
  };

  // The code is spent once the password changes, so don't allow swiping back
  useEffect(() => {
    if (success) {
      navigation.setOptions({gestureEnabled: false});
    }
  }, [success, navigation]);

  const backToSignIn = () => navigation.reset({index: 0, routes: [{name: 'Login', params: {email}}]});

  if (success) {
    return (
      <FormLayout
        title="All set"
        step={{current: 3, total: 3, label: ''}}
        contentStyle={styles.successContent}
        footer={<PrimaryButton title="Back to sign in" onPress={backToSignIn} />}>
        <View style={styles.success} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <StatusIcon status="success" />
          <Text style={styles.successTitle}>Password updated</Text>
          <Text style={styles.successBody}>Sign in with your new password.</Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="New password"
      onBack={() => navigation.goBack()}
      step={{current: 3, total: 3}}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton title="Reset password" onPress={handleReset} disabled={!isValid} />
        </>
      }>
      <Text style={styles.instruction}>Choose a new password you haven't used before.</Text>

      <PasswordInput
        label="New password"
        value={password}
        onChangeText={value => {
          setPassword(value);
          setError('');
        }}
        textContentType="newPassword"
      />
      <PasswordRules password={password} />

      <PasswordInput
        label="Confirm password"
        value={confirmPassword}
        onChangeText={value => {
          setConfirmPassword(value);
          setError('');
        }}
        textContentType="newPassword"
        error={mismatch ? "Passwords don't match." : undefined}
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
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  successContent: {
    justifyContent: 'center',
    paddingBottom: 80,
  },
  success: {
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    ...type.statusTitle,
    color: colors.text,
  },
  successBody: {
    ...type.label,
    color: colors.textSecondary,
  },
});

export default ResetPassword;
