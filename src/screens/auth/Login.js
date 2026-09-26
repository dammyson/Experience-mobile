import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import { AppInput, PasswordInput } from '../../components/ui';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { login } from '../../actions/authActions';

const { height } = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'TabsNavigation' }] });
    }
  }, [isAuthenticated, navigation]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    dispatch(login(email, password));
  };

  return (
    <ScreenBackground>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.BACKGROUND_COLOR}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.header}>
            <Text style={styles.logoText}>Arena</Text>
            <Text style={styles.tagline}>Unified Loyalty Network</Text>
          </View>

          {/* Screen title block — matching Display/Display sm/SemiBold */}
          <Text style={styles.screenTitle}>Sign In</Text>

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={{ height: 20 }} />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />

          {/* Forgot */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot PIN / Password?</Text>
          </TouchableOpacity>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA button — Brand/br500 glass fill, borderRadius 20 */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.base, // 16px — matches Figma screen padding
    paddingBottom: spacing.xl,
  },

  // Header / logo
  header: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: spacing.xl,
  },
  logoText: {
    ...textStyles.displaySm,
    fontSize: 40,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: theme.TEXT_WHITE,
    letterSpacing: 2,
  },
  tagline: {
    ...textStyles.textMd,
    color: theme.TEXT_TERTIARY,
    marginTop: 4,
    letterSpacing: 1,
  },

  // Screen title — Display/Display sm/SemiBold
  screenTitle: {
    ...textStyles.displaySm,
    color: theme.TEXT_PRIMARY,
    marginBottom: spacing.xl,
  },

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: 10,
  },
  forgotText: {
    ...textStyles.textSm,
    color: theme.PRIMARY_COLOR,
  },

  // Error
  errorText: {
    ...textStyles.textSm,
    color: theme.ERROR_COLOR,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  // CTA button — Brand/br500 rgba(152,96,240,0.52), borderRadius 20px, padding 12px 20px
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl, // 20px — exact from Figma
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  // Button label — Text/Text lg/Bold
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.DIVIDER_COLOR,
  },
  dividerText: {
    ...textStyles.textSm,
    color: theme.TEXT_MUTED,
    marginHorizontal: spacing.sm,
  },

  // Sign up
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupPrompt: {
    ...textStyles.textLg,
    color: theme.TEXT_TERTIARY,
  },
  signupLink: {
    ...textStyles.textLgBold,
    color: theme.PRIMARY_COLOR,
  },
});

export default Login;
