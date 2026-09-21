import React from 'react';
import {Text, StyleSheet} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {theme} from '../../theme/colors';

const ScanQR = () => (
  <ScreenBackground style={styles.center}>
    <Text style={styles.text}>Scan QR</Text>
  </ScreenBackground>
);

const styles = StyleSheet.create({
  center: {alignItems: 'center', justifyContent: 'center'},
  text: {fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 20, color: theme.TEXT_PRIMARY},
});

export default ScanQR;
