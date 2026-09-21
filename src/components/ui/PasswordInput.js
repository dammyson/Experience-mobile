import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import AppInput from './AppInput';

const EyeIcon = ({visible}) => (
  <Text style={styles.eye}>{visible ? '🙈' : '👁'}</Text>
);

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
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <EyeIcon visible={visible} />
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  eye: {fontSize: 16},
});

export default PasswordInput;
