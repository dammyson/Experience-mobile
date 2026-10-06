import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../theme/colors';

const MERCHANT_IMAGES = {
  kai: require('../../assets/images/apple.jpg'),
  royal: require('../../assets/images/travel.jpg'),
  somalens: require('../../assets/images/home.jpg'),
};

const MOCK_REWARDS = [
  {
    id: '1',
    merchant: 'Kai Collective Clothing',
    currentPoints: 15,
    targetPoints: 100,
    rewardText: 'points to redeem $5',
    logo: MERCHANT_IMAGES.kai,
  },
  {
    id: '2',
    merchant: 'Royal Hotel Ikeja',
    currentPoints: 45,
    targetPoints: 100,
    rewardText: 'points to redeem $5',
    logo: MERCHANT_IMAGES.royal,
  },
  {
    id: '3',
    merchant: 'Somalens',
    currentPoints: 100,
    targetPoints: 100,
    rewardText: 'points redeemed',
    logo: MERCHANT_IMAGES.somalens,
  },
];

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

const RewardsSection = ({rewards = MOCK_REWARDS, onRedeem, onSeeAll}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.rewardsList}>
        {rewards.map(item => (
          <RewardCard key={item.id} item={item} onRedeem={onRedeem} />
        ))}
      </View>
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
});

export default RewardsSection;
