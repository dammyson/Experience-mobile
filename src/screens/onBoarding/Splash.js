import React, {useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../theme/colors';
import {fontFamily, fontSize} from '../../theme/typography';

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.replace('TabsNavigation');
      } else {
        navigation.replace('Login');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />
      {/* Purple glow background */}
      <View style={styles.glow} />
      <Text style={styles.logo}>Arena</Text>
      <Text style={styles.tagline}>Unified Loyalty Network</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.PRIMARY_DARK,
    opacity: 0.25,
    top: '25%',
    alignSelf: 'center',
    // blur via shadow
    shadowColor: theme.PRIMARY_DARK,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 120,
  },
  logo: {
    fontFamily: fontFamily.extraBold,
    fontSize: 48,
    color: theme.PRIMARY_TEXT_COLOR,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: theme.SECONDARY_TEXT_COLOR,
    marginTop: 8,
    letterSpacing: 1,
  },
});

export default Splash;
