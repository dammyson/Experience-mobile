import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from '../icons/Icon';
import {colors, type, layout} from '../../theme/tokens';

/**
 * Screen header from the redesign: back chevron (44×44) + left-aligned title,
 * with an optional right slot.
 *
 * Props:
 *   title       string
 *   onBack      () => void — shows the back chevron when set
 *   backLabel   string — accessibility label for the back button (default "Back")
 *   root        boolean — tab root: larger title, no back arrow
 *   centered    boolean — centred title, no back arrow (status screens)
 *   stepLabel   string — e.g. "Step 2 of 3", shown on the right
 *   right       ReactNode — custom right slot (overrides stepLabel)
 */
const ScreenHeader = ({title, onBack, backLabel = 'Back', root, centered, stepLabel, right}) => {
  const insets = useSafeAreaInsets();
  const showBack = !!onBack && !root && !centered;

  return (
    <View
      style={[
        styles.container,
        {paddingTop: Math.max(insets.top + 8, 24)},
        (root || !showBack) && styles.containerPadded,
      ]}>
      <View style={[styles.row, centered && styles.rowCentered]}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            activeOpacity={0.7}>
            <Icon name="back" size={22} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <Text
          style={[root ? type.tabTitle : type.screenTitle, styles.title, centered && styles.titleCentered]}
          numberOfLines={1}
          accessibilityRole="header">
          {title}
        </Text>
        {!centered &&
          (right ?? (!!stepLabel && <Text style={styles.stepLabel}>{stepLabel}</Text>))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
  },
  containerPadded: {
    paddingHorizontal: layout.screenPadding,
  },
  row: {
    minHeight: layout.headerRow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  backBtn: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.text,
  },
  titleCentered: {
    flex: 0,
    textAlign: 'center',
  },
  stepLabel: {
    ...type.captionStrong,
    color: colors.textSecondary,
    paddingRight: 8,
  },
});

export default ScreenHeader;
