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
import {AppInput} from '../../components/ui';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

const SignUp = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    pin: '',
  });
  const [error, setError] = useState('');

  const set = field => value => setForm(prev => ({...prev, [field]: value}));

  const handleNext = () => {
    const {fullName, phoneNumber, email, pin} = form;
    if (!fullName || !phoneNumber || !email || !pin) {
      setError('Please fill in all fields');
      return;
    }
    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    setError('');
    // Navigate to Identity Verification
    navigation.navigate('IdentityVerification', {
      userData: form,
    });
  };

  const isValid =
    form.fullName &&
    form.phoneNumber &&
    form.email &&
    form.pin.length === 6;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}>
              <BackIcon size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign Up Account</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AppInput
              label="Full Name"
              value={form.fullName}
              onChangeText={set('fullName')}
              placeholder="Enter Full Name"
              autoCapitalize="words"
            />

            <AppInput
              label="Phone Number"
              value={form.phoneNumber}
              onChangeText={set('phoneNumber')}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
              maxLength={15}
            />

            <AppInput
              label="Email"
              value={form.email}
              onChangeText={set('email')}
              placeholder="Enter Email Adress"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppInput
              label="Create PIN"
              value={form.pin}
              onChangeText={set('pin')}
              placeholder="Enter 6 digit PIN"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
            />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.ctaButton, !isValid && styles.ctaDisabled]}
            onPress={handleNext}
            disabled={!isValid}
            activeOpacity={0.85}>
            <Text style={styles.ctaText}>Next: Identity Verification</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  form: {
    gap: 20,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
    paddingVertical: 16,
    paddingBottom: 40,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  ctaButton: {
    backgroundColor: '#6715EA',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.WHITE,
  },
});

export default SignUp;
