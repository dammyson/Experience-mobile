import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, layout} from '../../theme/tokens';

/**
 * N equal 4px bars; the first `current` are filled.
 *
 * Props:
 *   total    number
 *   current  number (1-based)
 *   style    extra container style
 */
const StepProgress = ({total, current, style}) => (
  <View
    style={[styles.row, style]}
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel={`Step ${current} of ${total}`}
    accessibilityValue={{min: 1, max: total, now: current}}>
    {Array.from({length: total}, (_, i) => (
      <View key={i} style={[styles.bar, i < current && styles.filled]} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 12,
    paddingHorizontal: layout.screenPadding,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderCard,
  },
  filled: {
    backgroundColor: colors.primary,
  },
});

export default StepProgress;
