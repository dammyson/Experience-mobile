import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import AppInput from './AppInput';
import {theme} from '../../theme/colors';
import {radius} from '../../theme/spacing';

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Circle cx={8} cy={8} r={5.5} stroke={theme.TEXT_TERTIARY} strokeWidth={1.5} />
    <Path
      d="M12.5 12.5L16 16"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Search input — rounded pill shape, search icon on the left.
 *
 * Props: same as AppInput minus label (search bars don't have labels).
 */
const SearchInput = ({placeholder = 'Search...', containerStyle, ...props}) => (
  <AppInput
    placeholder={placeholder}
    leftElement={<SearchIcon />}
    containerStyle={[styles.container, containerStyle]}
    inputStyle={styles.input}
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
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
});

export default SearchInput;
