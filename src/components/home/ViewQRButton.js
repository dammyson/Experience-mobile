import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';

const ViewQRButton = ({onPress}) => (
  <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.buttonText}>View QR</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 42,
    backgroundColor: '#00D9C0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#1B1B1E',
  },
});

export default ViewQRButton;
