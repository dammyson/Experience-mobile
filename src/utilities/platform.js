import {Platform} from 'react-native';

export const isIOS = Platform.OS === 'ios';

// iOS 26 is where Liquid Glass (UIGlassEffect) lands.
// @callstack/liquid-glass's isLiquidGlassSupported returns false on the
// simulator even when the effect is available — trust the OS version directly.
export const isIOS26Plus =
  isIOS && parseInt(Platform.Version, 10) >= 26;

export const canUseGlass = isIOS26Plus;
