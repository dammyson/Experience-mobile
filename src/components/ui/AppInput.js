import React, {useState, forwardRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';
import {radius} from '../../theme/spacing';

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
 *   inputStyle     TextStyle
 *   + all standard TextInput props
 */
const AppInput = forwardRef(({
  label,
  error,
  leftElement,
  rightElement,
  containerStyle,
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
      ]}>
        {leftElement && <View style={styles.leftSlot}>{leftElement}</View>}

        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          placeholderTextColor={theme.TEXT_TERTIARY}
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

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: theme.TEXT_SECONDARY,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.INPUT_BACKGROUND,
    borderWidth: 1,
    borderColor: theme.INPUT_BORDER,
    borderRadius: radius['2xl'],
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputBoxFocused: {
    borderColor: theme.INPUT_ACTIVE_BORDER,
    backgroundColor: 'rgba(152, 96, 240, 0.08)',
  },
  inputBoxError: {
    borderColor: theme.ERROR_COLOR,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  leftSlot: {
    justifyContent: 'center',
  },
  rightSlot: {
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.ERROR_COLOR,
  },
});

export default AppInput;
