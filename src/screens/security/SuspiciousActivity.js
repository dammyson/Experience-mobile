import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const SuspiciousActivity = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    device = 'iPhone 14 Pro',
    location = 'Jakarta, Indonesia',
    time = '09 Dec 2025 - 02:14 AM',
  } = route.params || {};

  const handleThisWasMe = () => {
    // TODO: dispatch confirm activity action
    navigation.goBack();
  };

  const handleSecureAccount = () => {
    // TODO: dispatch secure account action (logout all, force PIN change)
    navigation.navigate('ChangePin');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />

      {/* Glow blob */}
      <View style={styles.glowBlob} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header — row, gap: 8, padding: 20px 16px */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suspicious Activity</Text>
        </View>

        {/* Main Container — alignItems: center, gap: 76px, padding: 24px 16px */}
        <View style={styles.mainContainer}>

          {/* Alert Message — Text/Text xl/Medium, centered, white */}
          <Text style={styles.alertMessage}>
            {'We detected unusual activity\non your account.'}
          </Text>

          {/* Device info block — gap: 17px */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoRow}>
              <Text style={styles.infoKey}>Device: </Text>
              {device}
            </Text>
            <Text style={styles.infoRow}>
              <Text style={styles.infoKey}>Location: </Text>
              {location}
            </Text>
            <Text style={styles.infoRow}>
              <Text style={styles.infoKey}>Time: </Text>
              {time}
            </Text>
          </View>

          {/* Action block — gap: 64px */}
          <View style={styles.actionBlock}>
            {/* Action prompt — Text/Text xl/Medium, white, fill */}
            <Text style={styles.actionPrompt}>What would you like to do?</Text>

            {/* Buttons — gap: 24px */}
            <View style={styles.buttonsContainer}>
              {/* "This Was Me" — secondary glass: rgba(242,242,242,0.24) */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleThisWasMe}
                activeOpacity={0.85}>
                <Text style={styles.buttonText}>This Was Me</Text>
              </TouchableOpacity>

              {/* "Secure My Account" — Brand/br500 glass: rgba(152,96,240,0.52) */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSecureAccount}
                activeOpacity={0.85}>
                <Text style={styles.buttonText}>Secure My Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
  },

  // Glow blob
  glowBlob: {
    position: 'absolute',
    width: 386,
    height: 338,
    borderRadius: 300,
    backgroundColor: theme.PRIMARY_DARK,
    top: -112,
    right: -80,
    opacity: 0.6,
    shadowColor: theme.PRIMARY_DARK,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 136,
  },

  // Header
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
  backIcon: {
    fontSize: 28,
    color: theme.TEXT_PRIMARY,
    lineHeight: 32,
  },
  // Display/Display sm/SemiBold
  headerTitle: {
    ...textStyles.displaySm,
    color: theme.TEXT_PRIMARY,
  },

  // Main container — alignItems: center, gap: 76px, padding: 24px 16px
  mainContainer: {
    alignItems: 'center',
    gap: 76,
    padding: spacing.xl,
    paddingHorizontal: spacing.base,
  },

  // Alert message — Text/Text xl/Medium (18px), centered, white
  alertMessage: {
    ...textStyles.textXl,
    color: theme.WHITE,
    textAlign: 'center',
  },

  // Device info block — column, gap: 17px, fill width
  infoBlock: {
    alignSelf: 'stretch',
    gap: 17,
  },
  // Text/Text lg/Medium (16px), Gray/gy900
  infoRow: {
    ...textStyles.textLg,
    color: theme.TEXT_PRIMARY,
  },
  infoKey: {
    ...textStyles.textLg,
    color: theme.TEXT_SECONDARY,
  },

  // Action block — column, gap: 64px, fill width
  actionBlock: {
    alignSelf: 'stretch',
    gap: spacing['5xl'],
  },
  // Action prompt — Text/Text xl/Medium, white, fill
  actionPrompt: {
    ...textStyles.textXl,
    color: theme.WHITE,
  },

  // Buttons — column, gap: 24px
  buttonsContainer: {
    gap: spacing.xl,
  },

  // Secondary button — rgba(242,242,242,0.24), borderRadius 20px
  secondaryButton: {
    backgroundColor: theme.PRIMARY_SURFACE,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },

  // Primary button — Brand/br500 rgba(152,96,240,0.52), borderRadius 20px
  primaryButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },

  // Text/Text lg/Bold, white
  buttonText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
});

export default SuspiciousActivity;
