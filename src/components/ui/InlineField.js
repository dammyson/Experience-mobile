import React, {forwardRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Label on the left (fixed column) + input on the right. A focused or valid
 * input gets the primary border, an error gets the danger border.
 *
 * Props:
 *   label        string — e.g. "Amount:"
 *   labelWidth   number (default 100; design uses 76–112)
 *   error        string — shown under the input
 *   valid        boolean — keep the primary border when not focused
 *   strong       boolean — semibold value text (amounts)
 *   children     ReactNode — replaces the TextInput (e.g. a picker button)
 *   inputStyle   TextStyle
 *   + all standard TextInput props
 */
const InlineField = forwardRef(
  ({label, labelWidth = 100, error, valid, strong, children, inputStyle, ...inputProps}, ref) => {
    const [focused, setFocused] = useState(false);
    const highlighted = !error && (focused || valid);

    return (
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <Text style={[styles.label, {width: labelWidth}]}>{label}</Text>
          <View style={styles.field}>
            {children ?? (
              <TextInput
                ref={ref}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={label.replace(/:$/, '')}
                {...inputProps}
                onFocus={e => {
                  setFocused(true);
                  inputProps.onFocus?.(e);
                }}
                onBlur={e => {
                  setFocused(false);
                  inputProps.onBlur?.(e);
                }}
                style={[
                  styles.input,
                  strong && styles.inputStrong,
                  highlighted && styles.inputHighlighted,
                  !!error && styles.inputError,
                  inputStyle,
                ]}
              />
            )}
          </View>
        </View>
        {!!error && (
          <Text style={[styles.error, {marginLeft: labelWidth + 10}]} accessibilityRole="alert">
            {error}
          </Text>
        )}
      </View>
    );
  },
);

/** Shared box style so custom children (pickers) match the input */
export const inlineFieldBox = {
  height: 44,
  borderRadius: radii.input,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surface,
  paddingHorizontal: 14,
  justifyContent: 'center',
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  field: {
    flex: 1,
  },
  input: {
    ...inlineFieldBox,
    ...type.body,
    fontFamily: type.input.fontFamily,
    color: colors.text,
    paddingVertical: 0,
  },
  inputStrong: {
    ...type.amount,
    fontSize: 14,
  },
  inputHighlighted: {
    borderColor: colors.primary,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
  },
});

export default InlineField;
