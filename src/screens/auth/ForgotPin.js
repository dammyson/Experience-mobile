import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import BackIcon from '../../components/icons/BackIcon';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const METHODS = [
  {id: 'sms', label: 'SMS OTP'},
  {id: 'email', label: 'Email OTP'},
  {id: 'biometric', label: 'Biometric (if available)'},
];

const ForgotPin = () => {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState('sms');

  const handleSend = () => {
    // TODO: dispatch forgot PIN / send verification action
    navigation.navigate('VerifyOtp', {method: selectedMethod});
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header — row, alignItems: center, gap: 8, padding: 20px 16px */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot PIN</Text>
        </View>

        {/* Verification Container — padding: 24px 0, gap: 42px */}
        <View style={styles.verificationContainer}>

          {/* Instructions — Text/Text xl/Medium, centered, white */}
          <Text style={styles.instruction}>
            {'Verify your identity to reset\n your security PIN.'}
          </Text>

          {/* Method Container — padding: 0 16px, gap: 16px */}
          <View style={styles.methodContainer}>

            {/* Method Label — Display/Display xs/SemiBold, white */}
            <Text style={styles.methodLabel}>Verification Method:</Text>

            {/* Radio options — gap: 12px */}
            <View style={styles.radioGroup}>
              {METHODS.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.radioRow}
                  onPress={() => setSelectedMethod(m.id)}
                  activeOpacity={0.7}>
                  {/* Radio circle — 16×16, stroke: Neutral/ne40 (#A8A8A8), strokeWidth: 2 */}
                  <View style={[styles.radioCircle, selectedMethod === m.id && styles.radioCircleSelected]}>
                    {selectedMethod === m.id && <View style={styles.radioDot} />}
                  </View>
                  {/* Label — Label/l14/Medium, Gray/gy900 (#F2F2F2) */}
                  <Text style={styles.radioLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA — fixed, padding: 16px */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleSend}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Send Verification Code</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  // Header — row, gap: 8, padding: 20px 16px
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
  headerTitle: {
    ...textStyles.displaySm,
    color: theme.TEXT_PRIMARY,
  },

  // Verification Container — alignItems: center, gap: 42px, padding: 24px 0
  verificationContainer: {
    alignItems: 'center',
    gap: 42,
    paddingVertical: spacing.xl,
  },

  // Instructions — Text/Text xl/Medium (Plus Jakarta Sans 500, 18px), centered, white
  instruction: {
    ...textStyles.textXl,
    color: theme.WHITE,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
  },

  // Method Container — alignSelf stretch, gap: 16px, padding: 0 16px
  methodContainer: {
    alignSelf: 'stretch',
    gap: spacing.base,
    paddingHorizontal: spacing.base,
  },

  // Method Label — Display/Display xs/SemiBold (20px), white, fill width
  methodLabel: {
    ...textStyles.displayXs,
    color: theme.WHITE,
  },

  // Radio group — gap: 12px
  radioGroup: {
    gap: 12,
  },

  // Radio row — row, alignItems: center, gap: 8, fill width
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },

  // Radio circle — 16×16, border 2px Neutral/ne40 (#A8A8A8)
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.NEUTRAL_40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.PRIMARY_COLOR,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.PRIMARY_COLOR,
  },

  // Radio label — Label/l14/Medium, Gray/gy900 (#F2F2F2)
  radioLabel: {
    ...textStyles.label14,
    fontFamily: undefined,   // system font fallback for SF Pro
    fontSize: 14,
    lineHeight: 21,
    color: theme.TEXT_PRIMARY,
  },

  // Bottom
  bottomContainer: {
    padding: spacing.base,
    paddingBottom: 24,
  },
  // CTA — Brand/br500 glass, borderRadius 20px
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
});

export default ForgotPin;
