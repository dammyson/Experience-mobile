import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';
import {radius} from '../../theme/spacing';

/**
 * Multi-line textarea with label, character counter, and error state.
 *
 * Props:
 *   label          string
 *   error          string
 *   maxLength      number
 *   numberOfLines  number   (default 4)
 *   containerStyle ViewStyle
 *   + all standard TextInput props
 */
const TextArea = ({
  label,
  error,
  maxLength,
  numberOfLines = 4,
  containerStyle,
  value = '',
  ...textInputProps
}) => {
  const [focused, setFocused] = useState(false);
  const minHeight = numberOfLines * 24 + 20;

  return (
    <View style={[styles.group, containerStyle]}>
      {!!label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {maxLength != null && (
            <Text style={styles.counter}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}

      <View style={[
        styles.inputBox,
        focused && styles.inputBoxFocused,
        !!error && styles.inputBoxError,
        {minHeight},
      ]}>
        <TextInput
          style={[styles.input, {minHeight: minHeight - 24}]}
          value={value}
          placeholderTextColor={theme.TEXT_TERTIARY}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
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
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: theme.TEXT_SECONDARY,
  },
  counter: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.TEXT_MUTED,
  },
  inputBox: {
    backgroundColor: theme.INPUT_BACKGROUND,
    borderWidth: 1,
    borderColor: theme.INPUT_BORDER,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputBoxFocused: {
    borderColor: theme.INPUT_ACTIVE_BORDER,
    backgroundColor: 'rgba(152, 96, 240, 0.08)',
  },
  inputBoxError: {
    borderColor: theme.ERROR_COLOR,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
    padding: 0,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.ERROR_COLOR,
  },
});

export default TextArea;
