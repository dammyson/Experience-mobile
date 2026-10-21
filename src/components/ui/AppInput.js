import React, {useState, forwardRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Base input — label + single-line TextInput.
 * All other input variants are built on top of this.
 *
 * Props:
 *   label          string
 *   error          string
 *   leftElement    ReactNode  — rendered before the text input
 *   rightElement   ReactNode  — rendered after the text input
 *   containerStyle ViewStyle
 *   boxStyle       ViewStyle  — the bordered input box
 *   inputStyle     TextStyle
 *   + all standard TextInput props
 */
const AppInput = forwardRef(({
  label,
  error,
  leftElement,
  rightElement,
  containerStyle,
  boxStyle,
  inputStyle,
  ...textInputProps
}, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.group, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputBox,
        focused && styles.inputBoxFocused,
        !!error && styles.inputBoxError,
        boxStyle,
      ]}>
        {leftElement && <View style={styles.leftSlot}>{leftElement}</View>}

        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={textInputProps.accessibilityLabel || label}
          onFocus={e => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />

        {rightElement && <View style={styles.rightSlot}>{rightElement}</View>}
      </View>

      {!!error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  inputBoxFocused: {
    borderColor: colors.primary,
  },
  inputBoxError: {
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  input: {
    ...type.input,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
  },
  leftSlot: {
    justifyContent: 'center',
  },
  rightSlot: {
    justifyContent: 'center',
  },
  errorText: {
    ...type.captionStrong,
    color: colors.danger,
  },
});

export default AppInput;
