import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from '../icons/Icon';
import {colors, type} from '../../theme/tokens';

const RULES = [
  {id: 'length', label: '8+ characters', test: pw => pw.length >= 8},
  {id: 'case', label: 'Upper & lower case', test: pw => /[a-z]/.test(pw) && /[A-Z]/.test(pw)},
  {id: 'number', label: 'A number', test: pw => /\d/.test(pw)},
  {id: 'symbol', label: 'A symbol', test: pw => /[^A-Za-z0-9]/.test(pw)},
];

export const isStrongPassword = password => RULES.every(rule => rule.test(password || ''));

/**
 * Two-column checklist of password rules; met rules turn mint.
 *
 * Props:
 *   password  string
 */
const PasswordRules = ({password = ''}) => (
  <View style={styles.grid} accessibilityLabel="Password rules">
    {RULES.map(rule => {
      const met = rule.test(password);
      const color = met ? colors.successText : colors.textMuted;
      return (
        <View
          key={rule.id}
          style={styles.item}
          accessible
          accessibilityLabel={`${rule.label}, ${met ? 'met' : 'not met'}`}>
          <Icon name={met ? 'check' : 'dot'} size={12} color={color} strokeWidth={2.4} />
          <Text style={[styles.label, {color}]}>{rule.label}</Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  item: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...type.caption,
  },
});

export default PasswordRules;
