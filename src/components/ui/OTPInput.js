import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {colors, fonts, radii} from '../../theme/tokens';

const CELL_COUNT = 6;

const OTPInput = ({value, onChange}) => {
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({value, setValue: onChange});

  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChange}
      cellCount={CELL_COUNT}
      rootStyle={styles.root}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete="sms-otp"
      accessibilityLabel="One-time code"
      renderCell={({index, symbol, isFocused}) => (
        <View
          key={index}
          accessibilityLabel={`Digit ${index + 1}`}
          style={[styles.cell, symbol && styles.cellFilled, isFocused && styles.cellFocused]}
          onLayout={getCellOnLayoutHandler(index)}>
          <Text style={styles.cellText}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: colors.sheetHandle,
  },
  cellFocused: {
    borderColor: colors.primaryBorder,
  },
  cellText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
});

export default OTPInput;
