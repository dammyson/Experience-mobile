import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {theme} from '../../theme/colors';

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
      renderCell={({index, symbol, isFocused}) => (
        <View
          key={index}
          style={[styles.cell, isFocused && styles.cellFocused, symbol && styles.cellFilled]}
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
    gap: 10,
  },
  cell: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: theme.INPUT_BORDER,
    borderRadius: 16,
    backgroundColor: theme.INPUT_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFocused: {
    borderColor: theme.INPUT_ACTIVE_BORDER,
    backgroundColor: 'rgba(152, 96, 240, 0.08)',
  },
  cellFilled: {
    borderColor: theme.PRIMARY_COLOR,
  },
  cellText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
});

export default OTPInput;
