import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet, StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {loadUserFromStorage} from '../../actions/authActions';
import {theme} from '../../theme/colors';

const Splash = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const token = await AsyncStorage.getItem('token');

      if (token) {
        // Load user data into Redux store
        dispatch(loadUserFromStorage());
        navigation.replace('TabsNavigation');
      } else if (hasSeenOnboarding) {
        navigation.replace('Welcome');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation, dispatch]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/arena_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>ARENA</Text>
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
  logo: {
    width: 39,
    height: 50,
  },
  logoText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 40,
    color: theme.TEXT_PRIMARY,
    letterSpacing: 2,
    marginTop: 10,
  },
});

export default Splash;
