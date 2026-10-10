import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../theme/colors';

const EmptyRewardsIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Path
      d="M25 8.33203V11.6654M25 18.332V21.6654M25 28.332V31.6654M8.33333 8.33203H31.6667C32.5507 8.33203 33.3986 8.68322 34.0237 9.30834C34.6488 9.93346 35 10.7813 35 11.6654V16.6654C34.1159 16.6654 33.2681 17.0166 32.643 17.6417C32.0179 18.2668 31.6667 19.1146 31.6667 19.9987C31.6667 20.8828 32.0179 21.7306 32.643 22.3557C33.2681 22.9808 34.1159 23.332 35 23.332V28.332C35 29.2161 34.6488 30.0639 34.0237 30.6891C33.3986 31.3142 32.5507 31.6654 31.6667 31.6654H8.33333C7.44928 31.6654 6.60143 31.3142 5.97631 30.6891C5.35119 30.0639 5 29.2161 5 28.332V23.332C5.88405 23.332 6.7319 22.9808 7.35702 22.3557C7.98214 21.7306 8.33333 20.8828 8.33333 19.9987C8.33333 19.1146 7.98214 18.2668 7.35702 17.6417C6.7319 17.0166 5.88405 16.6654 5 16.6654V11.6654C5 10.7813 5.35119 9.93346 5.97631 9.30834C6.60143 8.68322 7.44928 8.33203 8.33333 8.33203Z"
      stroke="#F2F2F2"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProgressBar = ({current, total}) => {
  const progress = Math.min((current / total) * 100, 100);

  return (
    <View style={styles.progressContainer}>
      <LinearGradient
        colors={['#885DF5', '#6B7CFE']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={[styles.progressFill, {width: `${progress}%`}]}
      />
      <View
        style={[styles.progressEmpty, {width: `${100 - progress}%`}]}
      />
    </View>
  );
};

const RewardCard = ({item, onRedeem}) => {
  const isComplete = item.currentPoints >= item.targetPoints;

  return (
    <View style={styles.rewardCard}>
      <View style={styles.rewardContent}>
        <View style={styles.rewardInfo}>
          {/* Merchant logo */}
          <View style={styles.logoContainer}>
            {item.logo ? (
              <Image source={item.logo} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}
          </View>

          <View style={styles.rewardTextContainer}>
            <Text style={styles.merchantName}>{item.merchant}</Text>
            <Text style={styles.progressText}>
              {item.currentPoints}/{item.targetPoints} {item.rewardText}
            </Text>
            <ProgressBar current={item.currentPoints} total={item.targetPoints} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.redeemButton, isComplete && styles.redeemButtonActive]}
          onPress={() => onRedeem?.(item)}
          activeOpacity={0.85}>
          <Text
            style={[
              styles.redeemButtonText,
              isComplete && styles.redeemButtonTextActive,
            ]}>
            Redeem
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <EmptyRewardsIcon />
    <Text style={styles.emptyText}>No rewards available</Text>
    <Text style={styles.emptySubtext}>Earn points to unlock rewards</Text>
  </View>
);

const RewardsSection = ({rewards = [], onRedeem, onSeeAll}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        {onSeeAll && rewards.length > 0 && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
      {rewards.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.rewardsList}>
          {rewards.map(item => (
            <RewardCard key={item.id} item={item} onRedeem={onRedeem} />
          ))}
        </View>
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
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: theme.WHITE,
  },
  seeAllText: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    lineHeight: 27,
    color: '#00D9C0',
  },
  rewardsList: {
    gap: 8,
  },
  rewardCard: {
    backgroundColor: '#6715EA',
    borderRadius: 20,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 9,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.WHITE,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: theme.WHITE,
  },
  rewardTextContainer: {
    flex: 1,
  },
  merchantName: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    lineHeight: 27,
    color: theme.WHITE,
  },
  progressText: {
    fontFamily: 'Inter-Light',
    fontSize: 10,
    lineHeight: 26,
    color: theme.WHITE,
  },
  progressContainer: {
    flexDirection: 'row',
    height: 7,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: 7,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  progressEmpty: {
    height: 7,
    backgroundColor: 'rgba(57, 36, 92, 0.66)',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  redeemButton: {
    backgroundColor: '#00D9C0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 0,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  redeemButtonActive: {
    backgroundColor: '#00D9C0',
  },
  redeemButtonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    lineHeight: 24,
    color: '#1B1B1E',
  },
  redeemButtonTextActive: {
    color: '#1B1B1E',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    paddingHorizontal: 16,
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

export default RewardsSection;
