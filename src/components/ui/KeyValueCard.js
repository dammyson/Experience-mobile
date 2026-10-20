import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Key–value rows: muted key on the left, value on the right.
 *
 * Row shape: {label, value, color?, total?, divider?}
 *   total    — bold label + bold value (e.g. "Balance after")
 *   divider  — renders a 1px line instead of a row
 *
 * Props:
 *   rows      Row[]
 *   variant   'card' (12px, muted keys, inside a card) | 'plain' (13px, secondary keys, no card)
 */
export const KeyValueList = ({rows, variant = 'card'}) => {
  const plain = variant === 'plain';
  return (
    <View style={styles.list}>
      {rows.filter(Boolean).map((row, i) => {
        if (row.divider) {
          return <View key={`divider-${i}`} style={styles.divider} />;
        }
        return (
          <View key={row.label} style={styles.row} accessible accessibilityLabel={`${row.label}, ${row.value}`}>
            <Text
              style={[
                plain ? styles.keyPlain : styles.key,
                row.total && styles.keyTotal,
              ]}>
              {row.label}
            </Text>
            <Text
              style={[
                plain ? styles.valuePlain : styles.value,
                row.total && styles.valueTotal,
                !!row.color && {color: row.color},
              ]}
              numberOfLines={2}>
              {row.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

/**
 * Props:
 *   title   string — section heading above the card
 *   rows    Row[]
 *   style   extra card style
 */
const KeyValueCard = ({title, rows, style}) => (
  <View style={styles.section}>
    {!!title && (
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    )}
    <View style={[styles.card, style]}>
      <KeyValueList rows={rows} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  title: {
    ...type.sectionHeadingSm,
    color: colors.text,
  },
  card: {
    padding: 16,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  key: {
    ...type.label,
    color: colors.textMuted,
  },
  keyPlain: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
  },
  keyTotal: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.text,
  },
  value: {
    ...type.label,
    ...type.tabular,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  valuePlain: {
    ...type.amount,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  valueTotal: {
    fontFamily: type.balance.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderCard,
  },
});

export default KeyValueCard;
