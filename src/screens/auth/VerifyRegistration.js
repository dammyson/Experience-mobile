import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import OTPInput from '../../components/ui/OTPInput';
import {PrimaryButton} from '../../components/ui';
import ExistingAccountLinks from '../../components/auth/ExistingAccountLinks';
import {authAPI} from '../../services/api';
import {completeRegistration} from '../../actions/authActions';
import {colors, type} from '../../theme/tokens';

const RESEND_SECONDS = 60;
const BAD_CODE_MESSAGE = 'That code is wrong or has expired. Try again or request a new one.';

const formatCountdown = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Sign-up for a customer a merchant already registered. `details` holds the
// sign-up form, password included, and only ever lives in the route params:
// the stack isn't persisted and the route goes away when the flow ends. SignUp
// is still mounted underneath and moves to the app once AUTH_SUCCESS lands.
const VerifyRegistration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {details} = route.params;

  const [channel, setChannel] = useState(route.params.channel);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  // Set after a 409: which ways out to offer. {showForgot: boolean}
  const [conflict, setConflict] = useState(null);
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

  const clearErrors = () => {
    setError('');
    setConflict(null);
  };

  const handleVerify = async () => {
    clearErrors();
    try {
      const response = await authAPI.verifyRegistration({...details, otp});
      await dispatch(completeRegistration(response.data));
    } catch (err) {
      if (err.status === 400) {
        setError(BAD_CODE_MESSAGE);
        return;
      }
      if (err.status === 409) {
        setConflict({showForgot: false});
      }
      setError(err.message || "We couldn't verify that code. Please try again.");
    }
  };

  // Registering again sends a new code and cancels the old one. The account may
  // have changed since the first attempt, so any step 1 reply can come back.
  const handleResend = async () => {
    if (countdown > 0 || resendInFlight.current) {
      return;
    }
    resendInFlight.current = true;
    setOtp('');
    clearErrors();
    setResending(true);
    try {
      const response = await authAPI.register(details);
      if (response.data?.verification_required) {
        setChannel(response.data.channel);
        startCountdown();
      } else {
        await dispatch(completeRegistration(response.data));
      }
    } catch (err) {
      if (err.status === 409) {
        setConflict({showForgot: true});
      }
      setError(err.message || 'Failed to resend code.');
    } finally {
      resendInFlight.current = false;
      setResending(false);
    }
  };

  const canResend = countdown === 0 && !resending;
  const isPhone = channel === 'phone';

  return (
    <FormLayout
      title={isPhone ? 'Verify your phone' : 'Verify your email'}
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={<PrimaryButton title="Verify" onPress={handleVerify} disabled={!/^\d{6}$/.test(otp)} />}>
      <Text style={styles.instruction}>
        Enter the 6-digit code sent to your {isPhone ? 'phone' : 'email'}{' '}
        <Text style={styles.contact}>{isPhone ? details.phoneNumber : details.email}</Text>
      </Text>

      <OTPInput
        value={otp}
        onChange={value => {
          setOtp(value);
          clearErrors();
        }}
      />

      {!!error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {!!conflict && (
        <ExistingAccountLinks reason={error} email={details.email} showForgot={conflict.showForgot} />
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
  contact: {
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

export default VerifyRegistration;
