import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Dark tile with an icon (or initials badge) and a label; selected tiles use the
 * primary fill and border.
 *
 * Props:
 *   label     string
 *   icon      ReactNode — receives no props; pass a coloured <Icon /> yourself
 *   initials  string — shown in a small badge instead of an icon
 *   hint      string — optional second line
 *   selected  boolean
 *   highlighted boolean — primary styling without the selected state (action tiles)
 *   onPress   () => void
 *   height    number (default 96)
 *   role      'radio' | 'button' (default 'radio')
 *   disabled  boolean
 */
export const ChoiceTile = ({
  label,
  icon,
  initials,
  hint,
  selected = false,
  highlighted = false,
  onPress,
  height = 96,
  role = 'radio',
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    accessibilityRole={role}
    accessibilityState={role === 'radio' ? {checked: selected, disabled} : {selected, disabled}}
    accessibilityLabel={hint ? `${label}, ${hint}` : label}
    style={[styles.tile, {height}, (selected || highlighted) && styles.selected, disabled && styles.disabled]}>
    {!!initials && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{initials}</Text>
      </View>
    )}
    {icon}
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
    {!!hint && (
      <Text style={[styles.hint, (selected || highlighted) && styles.hintSelected]} numberOfLines={1}>
        {hint}
      </Text>
    )}
  </TouchableOpacity>
);

/**
 * Grid of ChoiceTiles with a centred prompt ("Choose merchant") above.
 *
 * Props:
 *   prompt    string
 *   columns   2 | 3 (default 2)
 *   options   [{id, label, icon?, initials?, hint?, disabled?}]
 *   value     selected id
 *   onChange  (id) => void
 *   tileHeight number
 */
const ChoiceGrid = ({prompt, columns = 2, options, value, onChange, tileHeight}) => (
  <View style={styles.group}>
    {!!prompt && <Text style={styles.prompt}>{prompt}</Text>}
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={prompt}>
      {options.map(option => (
        <View key={option.id} style={columns === 3 ? styles.col3 : styles.col2}>
          <ChoiceTile
            {...option}
            height={tileHeight}
            selected={option.id === value}
            onPress={() => onChange(option.id)}
          />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  group: {
    gap: 12,
  },
  prompt: {
    ...type.bodyStrong,
    color: '#D9D9E3',
    textAlign: 'center',
  },
  col2: {
    width: '48.4%',
  },
  col3: {
    width: '31.5%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  tile: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderTile,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 6,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryBorder,
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...type.captionStrong,
    color: colors.text,
  },
  label: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.text,
  },
  hint: {
    ...type.caption,
    color: colors.textMuted,
  },
  hintSelected: {
    color: colors.textOnBrand,
  },
});

export default ChoiceGrid;
