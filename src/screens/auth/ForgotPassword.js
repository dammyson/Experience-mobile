import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import BackIcon from '../../components/icons/BackIcon';
import {AppInput} from '../../components/ui';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';
import {authAPI} from '../../services/api';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) return;

    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword({email});
      navigation.navigate('VerifyOTP', {email});
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.instruction}>
              Enter your email and we'll send you an OTP to reset your password.
            </Text>

            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPin')}>
              <Text style={styles.pinLink}>Forgot PIN instead?</Text>
            </TouchableOpacity>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, (!email || loading) && styles.ctaDisabled]}
          onPress={handleSend}
          disabled={!email || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme.WHITE} />
          ) : (
            <Text style={styles.ctaText}>Send Reset Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    paddingTop: 64,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...textStyles.displaySm, color: theme.TEXT_PRIMARY },
  formContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  instruction: { ...textStyles.textXl, color: theme.WHITE },
  pinLink: { ...textStyles.textSm, color: theme.PRIMARY_COLOR },
  errorText: {
    ...textStyles.textSm,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
  },
  bottomContainer: { padding: spacing.base, paddingBottom: 24 },
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { ...textStyles.textLgBold, color: theme.WHITE },
});

export default ForgotPassword;
