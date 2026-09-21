import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BellIcon from '../icons/BellIcon';
import CardIcon from '../icons/CardIcon';
import { theme } from '../../theme/colors';

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

const HomeHeader = ({ name = 'Cooper', onNotification, onCard }) => (
  <View style={styles.container}>
    {/* Greeting */}
    <View style={styles.greetingContainer}>
      <TouchableOpacity style={styles.greetingRow} activeOpacity={0.8}>
        <Text style={styles.greetingName}>Hi, {name}</Text>
        <ChevronIcon />
      </TouchableOpacity>
      <Text style={styles.greetingSub}>Ready to start your today</Text>
    </View>

    {/* Right actions */}
    <View style={styles.actions}>
      {/* Notification bell — the red dot sits top-right of the container */}
      <TouchableOpacity
        style={styles.bellBtn}
        onPress={onNotification}
        activeOpacity={0.8}
      >
        <BellIcon color={theme.TEXT_PRIMARY} size={22} />
        <View style={styles.notifDot} />
      </TouchableOpacity>

      {/* My Card */}
      <TouchableOpacity
        style={styles.cardBtn}
        onPress={onCard}
        activeOpacity={0.8}
      >
        <View style={styles.cardIconBox}>
          <CardIcon color={theme.BACKGROUND_COLOR} size={20} />
        </View>
        <Text style={styles.cardText}>My Card</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
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
  greetingSub: {
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
  // Bell — 44×44 circle, rgba(255,255,255,0.16)
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Red dot sits top-right corner of the bell button, outside the icon
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 5,
    backgroundColor: theme.ERROR_BADGE,
  },
  // My Card — row, gap 8, padding 8px 12px 8px 8px, rgba(255,255,255,0.12), borderRadius 20
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
  // Card icon box — 36×36, Gray/gy900 fill, borderRadius 16
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

export default HomeHeader;
