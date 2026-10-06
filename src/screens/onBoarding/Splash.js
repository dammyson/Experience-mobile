import React, {useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {theme} from '../../theme/colors';

const VaultaLogo = () => (
  <Svg width={48} height={56} viewBox="0 0 48 56" fill="none">
    <Defs>
      <LinearGradient id="shieldGrad" x1="0" y1="0" x2="48" y2="56" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#8B5CF6" />
        <Stop offset="1" stopColor="#6366F1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M24 0L0 10V26C0 40.4 10.2 53.6 24 56C37.8 53.6 48 40.4 48 26V10L24 0Z"
      fill="url(#shieldGrad)"
    />
    <Path
      d="M20 28L24 32L32 22"
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const token = await AsyncStorage.getItem('token');

      if (token) {
        navigation.replace('TabsNavigation');
      } else if (hasSeenOnboarding) {
        navigation.replace('Welcome');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <VaultaLogo />
          <Text style={styles.logoText}>VAULTA</Text>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 36,
    color: theme.TEXT_PRIMARY,
    letterSpacing: 2,
  },
});

export default Splash;
