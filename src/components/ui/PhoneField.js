import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppInput from './AppInput';
import {isNigerianPhone} from '../../utilities/format';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Phone number with a fixed +234 prefix box. Convert the value with
 * toNigerianPhone() before sending it.
 *
 * Props:
 *   label         string (default "Phone number")
 *   value         string
 *   onChangeText  (value) => void
 */
const PhoneField = ({label = 'Phone number', value, onChangeText}) => {
  const invalid = !!value && !isNigerianPhone(value);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View style={styles.prefix} accessible accessibilityLabel="Country code plus 2 3 4">
          <Text style={styles.prefixText}>+234</Text>
        </View>
        <AppInput
          value={value}
          onChangeText={onChangeText}
          placeholder="803 000 0000"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={14}
          accessibilityLabel={label}
          containerStyle={styles.field}
        />
      </View>
      {invalid && (
        <Text style={styles.error} accessibilityRole="alert">
          Enter the 10 digits after +234.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  prefix: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  prefixText: {
    ...type.bodyStrong,
    color: colors.text,
  },
  field: {
    flex: 1,
  },
  error: {
    ...type.captionStrong,
    color: colors.danger,
  },
});

export default PhoneField;
