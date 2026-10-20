import React from 'react';
import {StyleSheet} from 'react-native';
import AppInput from './AppInput';
import Icon from '../icons/Icon';
import {colors, type} from '../../theme/tokens';

/**
 * Search input — rounded pill shape, search icon on the left.
 *
 * Props: same as AppInput minus label (search bars don't have labels).
 */
const SearchInput = ({placeholder = 'Search...', containerStyle, ...props}) => (
  <AppInput
    placeholder={placeholder}
    leftElement={<Icon name="search" size={18} color={colors.textMuted} />}
    containerStyle={[styles.container, containerStyle]}
    boxStyle={styles.box}
    inputStyle={styles.input}
    accessibilityLabel={placeholder}
    returnKeyType="search"
    autoCorrect={false}
    autoCapitalize="none"
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  box: {
    height: 46,
  },
  input: {
    ...type.body,
    fontFamily: type.input.fontFamily,
  },
});

export default SearchInput;
