import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Pill toggle: outline when off, primary when on.
 *
 * Props:
 *   label     string
 *   selected  boolean
 *   onPress   () => void
 *   size      'sm' (32) | 'md' (38) (default 'sm')
 *   filled    boolean — use the surface fill when off (quick-amount chips)
 *   style     extra style (e.g. {flex: 1} in an equal-width row)
 */
export const Chip = ({label, selected = false, onPress, size = 'sm', filled = false, style}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{selected}}
    hitSlop={size === 'md' ? {top: 3, bottom: 3} : {top: 6, bottom: 6}}
    style={[
      styles.chip,
      size === 'md' && styles.chipMd,
      filled && styles.filled,
      selected && styles.selected,
      style,
    ]}>
    <Text style={[styles.label, size === 'md' && styles.labelMd]}>{label}</Text>
  </TouchableOpacity>
);

/**
 * Row of single-select chips.
 *
 * Props:
 *   options    [{id, label}]
 *   value      selected id
 *   onChange   (id) => void
 *   equal      boolean — equal-width chips filling the row (quick amounts)
 *   scrollable boolean — horizontal scroll for long lists
 *   size, filled — passed to each Chip
 *   accessibilityLabel string — names the group
 */
const ChipGroup = ({options, value, onChange, equal, scrollable, size, filled, accessibilityLabel}) => {
  const chips = options.map(option => (
    <Chip
      key={option.id}
      label={option.label}
      selected={option.id === value}
      onPress={() => onChange(option.id)}
      size={size}
      filled={filled}
      style={equal && styles.equal}
    />
  ));

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel={accessibilityLabel}>
        {chips}
      </ScrollView>
    );
  }
  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel}>
      {chips}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipMd: {
    height: 38,
  },
  filled: {
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryBorder,
  },
  equal: {
    flex: 1,
    paddingHorizontal: 4,
  },
  label: {
    ...type.captionStrong,
    color: colors.text,
  },
  labelMd: {
    fontSize: 12,
  },
});

export default ChipGroup;
