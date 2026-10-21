import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {formatPts, formatNaira, formatEstimate} from '../../utilities/format';
import {colors, type, radii} from '../../theme/tokens';

// Display rules from README "Points vs money". Pass `style` for size/weight.

/** Lavender, "pts" suffix: 4,200 pts */
export const PointsText = ({value, signed, style, color = colors.points, ...rest}) => (
  <Text style={[styles.base, {color}, style]} {...rest}>
    {formatPts(value, {signed})}
  </Text>
);

/** White, ₦ prefix, 2 decimals: ₦184,250.00 */
export const MoneyText = ({value, signed, currency, style, color = colors.text, ...rest}) => (
  <Text style={[styles.base, {color}, style]} {...rest}>
    {formatNaira(value, {signed, currency})}
  </Text>
);

/** Mint, "≈": ≈ ₦2,100 */
export const EstimateText = ({value, currency, style, ...rest}) => (
  <Text style={[styles.base, styles.estimate, style]} {...rest}>
    {formatEstimate(value, {currency})}
  </Text>
);

/** Lavender pill: [4,200 pts] */
export const PointsChip = ({value, signed, style}) => (
  <View style={[styles.chip, style]}>
    <PointsText value={value} signed={signed} style={styles.chipText} />
  </View>
);

const styles = StyleSheet.create({
  base: {
    ...type.amount,
  },
  estimate: {
    color: colors.success,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.pointsBg,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
