import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {layout} from '../../theme/tokens';

/**
 * Pins the primary CTA (or a ButtonPair) to the bottom of the screen with the
 * redesign's 16 / 20 / 36 padding. Place it after the ScrollView, not inside.
 *
 * Props:
 *   children  ReactNode
 *   inTabs    boolean — screen sits above the tab bar, so skip the home-indicator padding
 *   style     extra style
 */
const BottomBar = ({children, inTabs, style}) => {
  const insets = useSafeAreaInsets();
  const paddingBottom = inTabs
    ? layout.bottomBar.paddingTop
    : Math.max(layout.bottomBar.paddingBottom, insets.bottom + 12);

  return <View style={[styles.bar, {paddingBottom}, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  bar: {
    paddingTop: layout.bottomBar.paddingTop,
    paddingHorizontal: layout.bottomBar.paddingHorizontal,
    gap: 12,
  },
});

export default BottomBar;
