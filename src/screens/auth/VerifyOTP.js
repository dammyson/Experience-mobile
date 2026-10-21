import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import OTPInput from '../../components/ui/OTPInput';
import {PrimaryButton} from '../../components/ui';
import {authAPI} from '../../services/api';
import {colors, type} from '../../theme/tokens';

const RESEND_SECONDS = 60;

const formatCountdown = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Step 2 of 3 of the reset flow
const VerifyOTP = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email} = route.params ?? {};

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const timerRef = useRef(null);
  const resendInFlight = useRef(false);

  const startCountdown = () => {
    setCountdown(RESEND_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleVerify = async () => {
    setError('');
    try {
      await authAPI.verifyOtp({email, otp});
      navigation.navigate('ResetPassword', {email, otp});
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendInFlight.current) {
      return;
    }
    resendInFlight.current = true;
    setOtp('');
    setError('');
    setResending(true);
    try {
      await authAPI.forgotPassword({email});
      startCountdown();
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      resendInFlight.current = false;
      setResending(false);
    }
  };

  const canResend = countdown === 0 && !resending;

  return (
    <FormLayout
      title="Enter code"
      onBack={() => navigation.goBack()}
      step={{current: 2, total: 3}}
      contentStyle={styles.content}
      footer={<PrimaryButton title="Verify code" onPress={handleVerify} disabled={otp.length < 6} />}>
      <Text style={styles.instruction}>
        Enter the 6-digit code sent to <Text style={styles.email}>{email}</Text>
      </Text>

      <OTPInput
        value={otp}
        onChange={value => {
          setOtp(value);
          setError('');
        }}
      />

      {!!error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <View style={styles.resendRow}>
        <Text style={styles.resendPrompt}>
          Didn't get it?{' '}
          <Text
            style={[styles.resendLink, !canResend && styles.resendWaiting]}
            onPress={canResend ? handleResend : undefined}
            accessibilityRole="button"
            accessibilityState={{disabled: !canResend}}>
            {resending ? 'Sending…' : countdown > 0 ? `Resend in ${formatCountdown(countdown)}` : 'Resend code'}
          </Text>
        </Text>
      </View>
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
  email: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.text,
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
  },
  resendRow: {
    minHeight: 24,
    justifyContent: 'center',
  },
  resendPrompt: {
    ...type.label,
    color: colors.textMuted,
  },
  resendLink: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
  resendWaiting: {
    color: colors.textMuted,
  },
});

export default VerifyOTP;
