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
import BackIcon from '../../components/icons/BackIcon';
import {PasswordInput} from '../../components/ui';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const ResetPassword = () => {
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    // TODO: dispatch reset password action
    setSuccess(true);
  };

  if (success) {
    return (
      <ScreenBackground>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successSub}>Your password has been updated successfully.</Text>
          <TouchableOpacity
            style={[styles.ctaButton, styles.successCtaButton]}
            onPress={() => navigation.reset({index: 0, routes: [{name: 'Login'}]})}
            activeOpacity={0.85}>
            <Text style={styles.ctaText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  const isValid = password.length >= 8 && confirmPassword.length >= 8;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
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
            <Text style={styles.headerTitle}>Reset Password</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.instruction}>
              Create a new password. It must be at least 8 characters.
            </Text>

            <PasswordInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, !isValid && styles.ctaDisabled]}
          onPress={handleReset}
          disabled={!isValid}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
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
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  instruction: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_TERTIARY,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
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
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    gap: 16,
  },
  successIcon: {
    fontSize: 64,
    color: theme.SUCCESS_COLOR,
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 28,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  successCtaButton: {
    alignSelf: 'stretch',
  },
});

export default ResetPassword;
