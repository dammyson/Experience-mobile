import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Dashed box with a title and a one-line hint.
 *
 * Props:
 *   title    string
 *   hint     string
 *   action   {label, onPress} — optional small primary button
 *   align    'center' | 'left' (default 'center')
 *   style    extra style
 */
const EmptyState = ({title, hint, action, align = 'center', style}) => {
  const left = align === 'left';
  return (
    <View style={[styles.box, left && styles.boxLeft, style]} accessible={!action} accessibilityLabel={`${title}. ${hint || ''}`}>
      <Text style={[styles.title, left && styles.textLeft]}>{title}</Text>
      {!!hint && <Text style={[styles.hint, left && styles.textLeft]}>{hint}</Text>}
      {!!action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={styles.action}
          accessibilityRole="button"
          activeOpacity={0.85}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    alignItems: 'center',
    gap: 4,
  },
  boxLeft: {
    alignItems: 'flex-start',
    paddingVertical: 16,
    gap: 8,
  },
  title: {
    ...type.bodyStrong,
    color: colors.text,
    textAlign: 'center',
  },
  hint: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  action: {
    marginTop: 4,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  actionText: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.white,
  },
});

export default EmptyState;
