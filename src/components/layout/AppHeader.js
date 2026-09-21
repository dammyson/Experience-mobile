import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import BellIcon from '../icons/BellIcon';
import CardIcon from '../icons/CardIcon';
import BackIcon from '../icons/BackIcon';
import {theme} from '../../theme/colors';

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M4 6l4 4 4-4"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * AppHeader — general-purpose header used across all screens.
 *
 * Props:
 *   title        {string}   — main text. In greeting mode renders "Hi, {title}".
 *   subtitle     {string}   — optional line below the title.
 *   greeting     {boolean}  — show "Hi, {title}" + chevron instead of plain title.
 *   showBack     {boolean}  — show back arrow on the left.
 *   showNotification {boolean} — show bell icon with unread dot on the right.
 *   showCard     {boolean}  — show "My Card" pill button on the right.
 *   hasNotification  {boolean} — controls the red dot on the bell (default true).
 *   onBack       {function}
 *   onNotification {function}
 *   onCard       {function}
 *   onTitlePress {function} — tap on greeting row (e.g. account switcher).
 *   rightElement {ReactNode} — fully custom right-side content (overrides bell/card).
 */
const AppHeader = ({
  title,
  subtitle,
  greeting = false,
  showBack = false,
  showNotification = false,
  showCard = false,
  hasNotification = true,
  onBack,
  onNotification,
  onCard,
  onTitlePress,
  rightElement,
}) => {
  const hasRight = rightElement !== undefined || showNotification || showCard;

  return (
    <View style={styles.container}>
      {/* ── Left side ── */}
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            activeOpacity={0.8}>
            <BackIcon />
          </TouchableOpacity>
        )}

        {greeting ? (
          <View style={styles.greetingContainer}>
            <TouchableOpacity
              style={styles.greetingRow}
              onPress={onTitlePress}
              activeOpacity={onTitlePress ? 0.8 : 1}>
              <Text style={styles.greetingName}>Hi, {title}</Text>
              {onTitlePress && <ChevronIcon />}
            </TouchableOpacity>
            {!!subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        ) : (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {!!subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        )}
      </View>

      {/* ── Right side ── */}
      {hasRight && (
        <View style={styles.actions}>
          {rightElement !== undefined ? (
            rightElement
          ) : (
            <>
              {showNotification && (
                <TouchableOpacity
                  style={styles.bellBtn}
                  onPress={onNotification}
                  activeOpacity={0.8}>
                  <BellIcon color={theme.TEXT_PRIMARY} size={22} />
                  {hasNotification && <View style={styles.notifDot} />}
                </TouchableOpacity>
              )}

              {showCard && (
                <TouchableOpacity
                  style={styles.cardBtn}
                  onPress={onCard}
                  activeOpacity={0.8}>
                  <View style={styles.cardIconBox}>
                    <CardIcon color={theme.BACKGROUND_COLOR} size={20} />
                  </View>
                  <Text style={styles.cardText}>My Card</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    lineHeight: 26,
    color: theme.TEXT_PRIMARY,
  },
  greetingContainer: {
    gap: 6,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 20,
    lineHeight: 26,
    color: theme.TEXT_PRIMARY,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: theme.TEXT_PRIMARY,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.ERROR_BADGE,
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: theme.TEXT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
  },
});

export default AppHeader;
