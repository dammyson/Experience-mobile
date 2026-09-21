import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const {width} = Dimensions.get('window');

// Success icon — Success/sc300 (#20BB59), 80×80
const SuccessIcon = () => (
  <View style={styles.iconWrapper}>
    <Text style={styles.iconText}>✓</Text>
  </View>
);

const LogoutAllDevices = () => {
  const navigation = useNavigation();

  const handleNext = () => {
    // TODO: navigate to Set Photo Profile or next onboarding step
    navigation.navigate('TabsNavigation');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />

      {/* Glow blob — Brand/br300, blur(136px), top-right */}
      <View style={styles.glowBlob} />

      {/* Header — row, gap: 68px (wider gap from Figma), padding: 20px 16px */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logout All Device</Text>
      </View>

      {/* Success Message Container — column, alignItems: center, gap: 16px */}
      {/* positioned at y: 215, centered horizontally */}
      <View style={styles.successContainer}>

        {/* Success icon — 80×80, Success/sc300 #20BB59 */}
        <SuccessIcon />

        {/* Text Container — column, alignItems: center, gap: 16px */}
        <View style={styles.textContainer}>
          {/* Title — Display/Display sm/SemiBold, centered, Gray/gy900 */}
          <Text style={styles.successTitle}>Logout Success</Text>

          {/* Description — Text/Text xl/Medium, centered, Gray/gy900 */}
          <Text style={styles.successDescription}>
            {'✔ All devices have been logged out\nYour account is now secure'}
          </Text>
        </View>
      </View>

      {/* Bottom CTA — padding: 16px, fixed at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Next: Set Photo Profile</Text>
        </TouchableOpacity>
      </View>
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

  // Header — row, gap: 68px (from Figma), padding: 20px 16px
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 68,
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

  // Success container — column, alignItems: center, gap: 16px
  // Figma: x: 68.5, y: 215 → centered, ~215px from top of frame
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: spacing.base,
  },

  // Icon wrapper — 80×80, Success/sc300 #20BB59
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.SUCCESS_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 40,
    color: theme.WHITE,
    fontWeight: '700',
  },

  // Text container — column, alignItems: center, gap: 16px, fill width
  textContainer: {
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },

  // Title — Display/Display sm/SemiBold (24px), centered, Gray/gy900
  successTitle: {
    ...textStyles.displaySm,
    textAlign: 'center',
    color: theme.TEXT_PRIMARY,
  },

  // Description — Text/Text xl/Medium (18px), centered, Gray/gy900
  successDescription: {
    ...textStyles.textXl,
    textAlign: 'center',
    color: theme.TEXT_PRIMARY,
  },

  // Bottom container — padding: 16px
  bottomContainer: {
    padding: spacing.base,
    paddingBottom: 24,
    backgroundColor: theme.BACKGROUND_COLOR,
  },

  // CTA — Brand/br500 rgba(152,96,240,0.52), borderRadius 20px, padding 12px 20px
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  // Text/Text lg/Bold, white
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
});

export default LogoutAllDevices;
