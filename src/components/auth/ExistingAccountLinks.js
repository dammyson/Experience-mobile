import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {colors, type} from '../../theme/tokens';

/**
 * Ways out of sign-up when the account already has a password. Resets the
 * stack so the password typed during sign-up is dropped with the form.
 *
 * Props:
 *   reason      string — the API's message; a phone conflict doesn't prefill the email
 *   email       string
 *   showForgot  boolean (default true)
 */
const ExistingAccountLinks = ({reason, email, showForgot = true}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const prefill = /phone/i.test(reason ?? '') ? '' : email;
  const login = {name: 'Login', params: {email: prefill}};

  const leaveTo = routes => {
    dispatch({type: 'AUTH_CLEAR_ERROR'});
    navigation.reset({index: routes.length - 1, routes});
  };

  return (
    <View style={styles.row}>
      <Text style={styles.link} accessibilityRole="link" onPress={() => leaveTo([login])}>
        Log in
      </Text>
      {showForgot && (
        <Text
          style={styles.link}
          accessibilityRole="link"
          onPress={() => leaveTo([login, {name: 'ForgotPassword', params: {email: prefill}}])}>
          Forgot password?
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  link: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
});

export default ExistingAccountLinks;
