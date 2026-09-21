import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import BackIcon from '../../components/icons/BackIcon';
import {AppInput} from '../../components/ui';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const ChangePin = () => {
  const navigation = useNavigation();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (newPin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    setError('');
    // TODO: dispatch save PIN action
  };

  const isValid = newPin.length === 6 && confirmPin.length === 6;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Header — padding: 20px 16px, row, gap: 8 */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change PIN</Text>
          </View>

          {/* Form Fields — padding: 24px 16px, gap: 24px */}
          <View style={styles.formContainer}>

            <AppInput
              label="Enter New PIN"
              value={newPin}
              onChangeText={v => { if (/^\d*$/.test(v) && v.length <= 6) setNewPin(v); }}
              placeholder="Enter new PIN"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />

            <AppInput
              label="Confirm New PIN"
              value={confirmPin}
              onChangeText={v => { if (/^\d*$/.test(v) && v.length <= 6) setConfirmPin(v); }}
              placeholder="Confirm new PIN"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />

            {/* PIN requirements — Text/Text lg/Medium, Gray/gy500 */}
            <Text style={styles.requirement}>
              PIN must be 6 digits · Do not use repeated numbers
            </Text>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA — fixed at bottom, padding: 16px */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, !isValid && styles.ctaDisabled]}
          onPress={handleSave}
          disabled={!isValid}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Save new PIN</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},

  // Header — row, alignItems: center, gap: 8, padding: 20px 16px
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
  // Header title — Display/Display sm/SemiBold
  headerTitle: {
    ...textStyles.displaySm,
    color: theme.TEXT_PRIMARY,
  },

  // Form — padding: 24px 16px, gap: 24px
  formContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },

  // PIN requirement — Text/Text lg/Medium, Gray/gy500
  requirement: {
    ...textStyles.textLg,
    color: theme.TEXT_TERTIARY,
  },

  errorText: {
    ...textStyles.textSm,
    color: theme.ERROR_COLOR,
    textAlign: 'center',
  },

  // Bottom container — padding: 16px
  bottomContainer: {
    padding: spacing.base,
    paddingBottom: 24,
  },
  // CTA — Brand/br500 rgba(152,96,240,0.52), borderRadius 20px, padding 12px 20px
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
});

export default ChangePin;
