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
} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import BackIcon from '../../components/icons/BackIcon';
import {AppInput} from '../../components/ui';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing} from '../../theme/spacing';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // TODO: dispatch forgot password action
    navigation.navigate('VerifyOTP', {email});
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
              Enter your email and we'll send you a reset link.
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, !email && styles.ctaDisabled]}
          onPress={handleSend}
          disabled={!email}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Send Reset Link</Text>
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
