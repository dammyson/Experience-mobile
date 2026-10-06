import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

// ID Card with Person Icon
const VerificationIcon = () => (
  <Svg width={100} height={80} viewBox="0 0 100 80" fill="none">
    {/* Person head */}
    <Circle
      cx={35}
      cy={20}
      r={10}
      stroke="#8B5CF6"
      strokeWidth={2.5}
      fill="none"
    />
    {/* Person body */}
    <Path
      d="M20 55C20 42 27 35 35 35C43 35 50 42 50 55"
      stroke="#8B5CF6"
      strokeWidth={2.5}
      strokeLinecap="round"
      fill="none"
    />
    {/* ID Card */}
    <Rect
      x={45}
      y={25}
      width={50}
      height={35}
      rx={6}
      stroke="#8B5CF6"
      strokeWidth={2.5}
      fill="none"
    />
    {/* Card lines */}
    <Path
      d="M55 38H85M55 46H75"
      stroke="#8B5CF6"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const IdentityVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userData = route.params?.userData;

  const handleTakePhoto = () => {
    navigation.navigate('IdentityVerificationSelfie', {userData});
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <BackIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <VerificationIcon />
        </View>

        <Text style={styles.description}>
          Verify your identity to ensure the security of transactions and full access to all Vaulta features.
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleTakePhoto}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: 80,
  },
  iconContainer: {
    width: 140,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  description: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: theme.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  ctaButton: {
    backgroundColor: '#6715EA',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.WHITE,
  },
});

export default IdentityVerification;
