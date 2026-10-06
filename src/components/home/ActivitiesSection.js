import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';

const MOCK_ACTIVITIES = [
  {
    id: '1',
    merchant: 'Air Peace Airline Rewards',
    points: '-20 points',
    status: 'Redeemed',
    epv: 'EPV -₦100',
    isEarned: false,
  },
  {
    id: '2',
    merchant: 'Nile Pharmacy',
    points: '+100 points',
    status: 'Earned',
    epv: 'EPV +₦500',
    isEarned: true,
  },
  {
    id: '3',
    merchant: 'Travel Lodge London City Center',
    points: '+10 points',
    status: 'Earned',
    epv: 'EPV +₦0.50',
    isEarned: true,
  },
  {
    id: '4',
    merchant: 'Springfield Bible Club',
    points: '-50 points',
    status: 'Redeemed',
    epv: 'EPV -₦250',
    isEarned: false,
  },
];

const ActivityItem = ({item, isFirst}) => (
  <View style={[styles.activityItem, !isFirst && styles.activityItemBorder]}>
    <View style={styles.activityLeft}>
      <Text style={styles.merchantName} numberOfLines={1}>
        {item.merchant}
      </Text>
      <Text style={styles.pointsText}>{item.points}</Text>
    </View>
    <View style={styles.activityRight}>
      <Text
        style={[
          styles.statusText,
          item.isEarned ? styles.statusEarned : styles.statusRedeemed,
        ]}>
        {item.status}
      </Text>
      <Text style={styles.epvText}>{item.epv}</Text>
    </View>
  </View>
);

const ActivitiesSection = ({activities = MOCK_ACTIVITIES, onSeeAll}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Activities</Text>

      <View style={styles.activitiesList}>
        {activities.map((item, index) => (
          <ActivityItem key={item.id} item={item} isFirst={index === 0} />
        ))}
      </View>

      {/* See all at the bottom */}
      {onSeeAll && (
        <TouchableOpacity
          style={styles.seeAllContainer}
          onPress={onSeeAll}
          activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: theme.WHITE,
    marginBottom: 8,
    marginTop: 7,
  },
  activitiesList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    height: 76,
  },
  activityItemBorder: {
    borderTopWidth: 0.5,
    borderTopColor: '#424242',
  },
  activityLeft: {
    flex: 1,
    gap: -2,
    paddingTop: 8,
  },
  merchantName: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    lineHeight: 27,
    color: theme.WHITE,
  },
  pointsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    lineHeight: 26,
    color: theme.WHITE,
  },
  activityRight: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 24,
  },
  statusEarned: {
    color: theme.SUCCESS_COLOR,
  },
  statusRedeemed: {
    color: theme.WHITE,
  },
  epvText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    lineHeight: 24,
    color: theme.WHITE,
  },
  seeAllContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#424242',
  },
  seeAllText: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    lineHeight: 27,
    color: '#00D9C0',
  },
});

export default ActivitiesSection;
