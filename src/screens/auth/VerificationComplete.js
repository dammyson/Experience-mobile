import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

// Success Checkmark Icon
const SuccessIcon = () => (
  <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
    <Circle
      cx={40}
      cy={40}
      r={36}
      stroke="#20BB59"
      strokeWidth={4}
      fill="none"
    />
    <Path
      d="M25 40L35 50L55 30"
      stroke="#20BB59"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const VerificationComplete = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userData = route.params?.userData;

  const handleSetPhotoProfile = async () => {
    // In a real app, this would save the user data and navigate to set profile photo
    // For now, we'll simulate account creation and go to the main app
    try {
      // Save mock token to simulate login
      await AsyncStorage.setItem('token', 'mock-token');
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{name: 'TabsNavigation'}],
      });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
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
          <SuccessIcon />
        </View>

        <Text style={styles.title}>Verification Complete</Text>
        <Text style={styles.description}>
          You can now set up your account profile.
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleSetPhotoProfile}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Next: Set Photo Profile</Text>
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
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: theme.TEXT_PRIMARY,
    marginBottom: 12,
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

export default VerificationComplete;
