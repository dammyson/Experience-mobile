import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import AppInput from './AppInput';
import {colors, type} from '../../theme/tokens';

/**
 * Password input with built-in show/hide toggle.
 *
 * Props: same as AppInput (label, error, containerStyle, etc.)
 * — secureTextEntry is managed internally.
 */
const PasswordInput = (props) => {
  const [visible, setVisible] = useState(false);

  return (
    <AppInput
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      rightElement={
        <TouchableOpacity
          onPress={() => setVisible(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.toggle}>{visible ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  toggle: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.link,
  },
});

export default PasswordInput;
