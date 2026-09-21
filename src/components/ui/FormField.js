import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';
import {radius} from '../../theme/spacing';

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  maxLength,
  rightElement,
}) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <TextInput
          style={[styles.input, rightElement && styles.inputWithRight]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.TEXT_TERTIARY}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement}
      </View>
    </View>
  );
};

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
    paddingVertical: 10,
    height: 52,
  },
  inputBoxFocused: {
    borderColor: theme.INPUT_ACTIVE_BORDER,
    backgroundColor: 'rgba(152, 96, 240, 0.08)',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  inputWithRight: {
    marginRight: 8,
  },
});

export default FormField;
