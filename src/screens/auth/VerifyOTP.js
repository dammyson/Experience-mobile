import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import BackIcon from '../../components/icons/BackIcon';
import OTPInput from '../../components/ui/OTPInput';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const RESEND_SECONDS = 60;

const VerifyOTP = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email} = route.params ?? {};

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

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

  const handleVerify = () => {
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setError('');
    // TODO: dispatch verify OTP action
    navigation.navigate('ResetPassword', {email, otp});
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtp('');
    setError('');
    // TODO: dispatch resend OTP action
    startCountdown();
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : 'your email';

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Email</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.textBlock}>
            <Text style={styles.instruction}>Enter the 6-digit code sent to</Text>
            <Text style={styles.email}>{maskedEmail}</Text>
          </View>

          <OTPInput value={otp} onChange={setOtp} />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
              <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.ctaButton, otp.length < 6 && styles.ctaDisabled]}
            onPress={handleVerify}
            disabled={otp.length < 6}
            activeOpacity={0.85}>
            <Text style={styles.ctaText}>Verify Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.base,
    paddingTop: 64,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  backBtn: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {...textStyles.displaySm, color: theme.TEXT_PRIMARY},
  body: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: 48,
    gap: 32,
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  instruction: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
  },
  email: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendPrompt: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  resendLink: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR,
  },
  resendDisabled: {
    color: theme.TEXT_MUTED,
  },
  bottomContainer: {
    padding: spacing.base,
    paddingBottom: 40,
  },
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaDisabled: {opacity: 0.5},
  ctaText: {...textStyles.textLgBold, color: theme.WHITE},
});

export default VerifyOTP;
