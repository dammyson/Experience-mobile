import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import SectionHeader from './SectionHeader';
import {theme} from '../../theme/colors';

const STATUS_COLORS = {
  Success: theme.SUCCESS_COLOR,
  Pending: theme.WARNING_COLOR,
  Failed:  theme.ERROR_COLOR,
};

// Fallback avatar with initials when no image provided
const AvatarFallback = ({initials, color}) => (
  <View style={[styles.avatar, {backgroundColor: color}]}>
    <Text style={styles.avatarInitials}>{initials}</Text>
  </View>
);

const ActivityItem = ({item}) => {
  const statusColor = STATUS_COLORS[item.status] ?? theme.TEXT_TERTIARY;

  return (
    <View style={styles.item}>
      {/* Left: avatar + text */}
      <View style={styles.itemLeft}>
        {item.avatar ? (
          <Image source={item.avatar} style={styles.avatar} />
        ) : (
          <AvatarFallback initials={item.initials ?? '?'} color={item.avatarColor ?? theme.SURFACE_ELEVATED} />
        )}
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={[styles.itemStatus, {color: statusColor}]}>{item.status}</Text>
        </View>
      </View>

      {/* Right: amount */}
      <Text style={styles.itemAmount}>{item.amount}</Text>
    </View>
  );
};

const MOCK_ACTIVITIES = [
  {id: '1', title: 'Transfer to Andi',   status: 'Success', amount: '$34', initials: 'A',  avatarColor: '#3D2A6E'},
  {id: '2', title: 'Top Up to Klarna',   status: 'Success', amount: '$90', initials: 'K.', avatarColor: '#E8B4B8'},
  {id: '3', title: 'Top Up to Dana',     status: 'Pending', amount: '$27', initials: 'D',  avatarColor: '#1E3A5F'},
  {id: '4', title: 'Transfer to John',   status: 'Failed',  amount: '$27', initials: 'J',  avatarColor: '#4A4A4A'},
];

const RecentActivitySection = ({activities = MOCK_ACTIVITIES, onSeeAll}) => (
  <View style={styles.container}>
    <SectionHeader title="Recent Activity" onSeeAll={onSeeAll} />
    <View style={styles.list}>
      {activities.map(item => (
        <ActivityItem key={item.id} item={item} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  list: {
    gap: 15,
  },
  // Activity item — row, space-between, alignItems center
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  // Avatar — 44×44, borderRadius 200
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.WHITE,
  },
  // Text column — gap 4, width 105
  itemText: {
    gap: 4,
  },
  itemTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: theme.TEXT_PRIMARY,
  },
  itemStatus: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  // Amount — Text/Text lg/SemiBold
  itemAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
  },
});

export default RecentActivitySection;
