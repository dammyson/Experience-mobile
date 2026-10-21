import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

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
  const minHeight = numberOfLines * 20 + 24;

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
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={textInputProps.accessibilityLabel || label}
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

      {!!error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
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
    ...type.label,
    color: colors.textSecondary,
  },
  counter: {
    ...type.caption,
    color: colors.textMuted,
  },
  inputBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    color: colors.text,
    padding: 0,
  },
  errorText: {
    ...type.captionStrong,
    color: colors.danger,
  },
});

export default TextArea;
