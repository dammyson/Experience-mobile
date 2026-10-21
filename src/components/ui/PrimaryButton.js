import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View, StyleSheet} from 'react-native';
import {colors, type, radii, layout} from '../../theme/tokens';

const VARIANTS = {
  primary: {bg: colors.primary, fg: colors.white, border: colors.primary},
  secondary: {bg: colors.surfaceRaised, fg: colors.text, border: colors.border},
  danger: {bg: colors.dangerButton, fg: colors.white, border: colors.dangerButton},
};

const HEIGHTS = {cta: layout.ctaHeight, pair: 50, md: 46, sm: 38};

/**
 * Full-width button. Guards against duplicate submits: if `onPress` returns a
 * promise, further presses are ignored and a spinner shows until it settles.
 *
 * Props:
 *   title     string
 *   onPress   () => void | Promise
 *   variant   'primary' | 'secondary' | 'danger' (default 'primary')
 *   size      'cta' (52) | 'pair' (50) | 'md' (46) | 'sm' (38) (default 'cta')
 *   disabled  boolean
 *   loading   boolean — external busy state (e.g. a Redux flag)
 *   icon      ReactNode — shown before the title
 *   accessibilityLabel string
 *   style     extra container style
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'cta',
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  style,
}) => {
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const busy = loading || pending;
  const inactive = disabled || busy;

  const handlePress = useCallback(async () => {
    if (inactive || inFlight.current || !onPress) {
      return;
    }
    const result = onPress();
    if (result && typeof result.then === 'function') {
      inFlight.current = true;
      setPending(true);
      try {
        await result;
      } catch (e) {
        // The caller handles errors; this only tracks the busy state
      } finally {
        inFlight.current = false;
        if (mounted.current) {
          setPending(false);
        }
      }
    }
  }, [inactive, onPress]);

  const palette = VARIANTS[variant];
  const isDisabledPrimary = disabled && !busy && variant === 'primary';
  const bg = isDisabledPrimary ? colors.primaryDisabled : palette.bg;
  const fg = isDisabledPrimary ? colors.primaryDisabledText : palette.fg;
  const border = isDisabledPrimary ? colors.primaryDisabled : palette.border;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{disabled: inactive, busy}}
      style={[
        styles.base,
        {height: HEIGHTS[size], backgroundColor: bg, borderColor: border},
        disabled && variant !== 'primary' && styles.dimmed,
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[size === 'cta' ? type.button : type.bodyStrong, {color: fg}]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const PrimaryButton = props => <Button variant="primary" {...props} />;

export const SecondaryButton = props => <Button variant="secondary" {...props} />;

export const DangerButton = props => <Button variant="danger" {...props} />;

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: radii.cta,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dimmed: {
    opacity: 0.5,
  },
});

export default PrimaryButton;
