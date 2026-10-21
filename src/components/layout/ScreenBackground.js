import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, gradients} from '../../theme/tokens';

/**
 * Shared background for all app screens: the app background plus the
 * violet header glow (bgGlow) fixed behind the top 240px.
 */
const ScreenBackground = ({children, style}) => (
  <View style={[styles.root, style]}>
    <LinearGradient
      colors={gradients.bgGlow.colors}
      locations={gradients.bgGlow.locations}
      style={styles.glow}
      pointerEvents="none"
    />
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: gradients.bgGlow.height,
  },
});

export default ScreenBackground;
