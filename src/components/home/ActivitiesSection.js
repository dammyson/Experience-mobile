import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme/colors';

const EmptyActivityIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Path
      d="M30.975 9.78487L33.425 7.08956C33.6432 6.8435 33.7558 6.52133 33.7381 6.19288C33.7204 5.86443 33.574 5.55618 33.3306 5.33496C33.0871 5.11374 32.7663 4.99739 32.4377 5.01112C32.1091 5.02485 31.7991 5.16756 31.575 5.40831L29.125 8.10206C26.1419 5.811 22.4066 4.72496 18.6601 5.05942C14.9136 5.39387 11.4297 7.12438 8.89963 9.90762C6.36952 12.6909 4.97805 16.3235 5.00126 20.0848C5.02448 23.8461 6.46069 27.4612 9.02497 30.213L6.57497 32.9083C6.46226 33.0294 6.3747 33.1716 6.31737 33.3268C6.26004 33.4819 6.23407 33.6469 6.24098 33.8122C6.24788 33.9775 6.28752 34.1397 6.35759 34.2896C6.42767 34.4394 6.52679 34.5738 6.6492 34.6851C6.77162 34.7963 6.91489 34.8822 7.07073 34.9377C7.22657 34.9931 7.39186 35.0171 7.55704 35.0082C7.72221 34.9993 7.88398 34.9578 8.03297 34.8859C8.18195 34.814 8.31519 34.7133 8.42497 34.5896L10.875 31.8958C13.8581 34.1869 17.5934 35.2729 21.3398 34.9385C25.0863 34.604 28.5702 32.8735 31.1003 30.0903C33.6304 27.307 35.0219 23.6744 34.9987 19.9131C34.9755 16.1518 33.5392 12.5367 30.975 9.78487ZM7.49997 19.9989C7.50136 17.6848 8.14512 15.4165 9.35955 13.4466C10.574 11.4767 12.3114 9.88264 14.3783 8.8419C16.4452 7.80115 18.7605 7.35461 21.0662 7.552C23.3719 7.74939 25.5775 8.58296 27.4375 9.95987L10.7187 28.3552C8.6459 26.0658 7.49862 23.0873 7.49997 19.9989ZM20 32.4989C17.3203 32.5018 14.7116 31.6386 12.5625 30.038L29.2812 11.6427C30.8987 13.4371 31.9612 15.662 32.34 18.048C32.7188 20.4339 32.3977 22.8785 31.4155 25.0857C30.4333 27.2929 28.8321 29.1679 26.806 30.4836C24.7799 31.7994 22.4158 32.4994 20 32.4989Z"
      fill="#F2F2F2"
    />
  </Svg>
);

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

const EmptyState = () => (
  <View style={styles.emptyState}>
    <EmptyActivityIcon />
    <Text style={styles.emptyText}>No recent activity</Text>
    <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
  </View>
);

const ActivitiesSection = ({activities = [], onSeeAll}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Activities</Text>

      {activities.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.activitiesList}>
          {activities.map((item, index) => (
            <ActivityItem key={item.id} item={item} isFirst={index === 0} />
          ))}
        </View>
      )}

      {onSeeAll && activities.length > 0 && (
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
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_SECONDARY,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
  },
});

export default ActivitiesSection;
