import React, {useCallback, useEffect} from 'react';
import {ScrollView, StatusBar, StyleSheet, RefreshControl} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import HomeHeader from '../../components/home/HomeHeader';
import BalanceCards from '../../components/home/BalanceCards';
import ViewQRButton from '../../components/home/ViewQRButton';
import ActivitiesSection from '../../components/home/ActivitiesSection';
import RewardsSection from '../../components/home/RewardsSection';
import QuickActionsSection, {QuickActionIcons} from '../../components/home/QuickActionsSection';
import OffersSection from '../../components/home/OffersSection';
import {useTabContext} from '../../navigations/TabContext';
import {getDashboard} from '../../actions/customerActions';
import {
  getMerchantWallet,
  getMerchantPrograms,
  getRecentMerchantActivities,
} from '../../actions/merchantActions';
import {mapMerchantActivityForHome} from '../../utilities/merchantActivity';

const formatSigned = (value, prefix = '') => {
  const num = Number(value) || 0;
  const sign = num > 0 ? '+' : num < 0 ? '-' : '';
  return `${sign}${prefix}${Math.abs(num)}`;
};

const mapActivity = item => {
  const isEarned = (item.points_delta ?? 0) > 0;
  return {
    id: item.id,
    merchant: item.merchant_name || 'Transaction',
    points: `${formatSigned(item.points_delta)} points`,
    status: isEarned ? 'Earned' : 'Redeemed',
    epv: `EPV ${formatSigned(item.points_value, '₦')}`,
    isEarned,
  };
};

const Home = () => {
  const {switchTab} = useTabContext();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user, userType} = useSelector(state => state.auth);
  const {dashboard, dashboardLoading} = useSelector(state => state.customer);
  const {wallet, programs, recentActivities, walletLoading, programsLoading, recentActivitiesLoading} =
    useSelector(state => state.merchant);

  const isMerchant = userType === 'merchant';
  const merchantId = user?.merchant_ids?.[0];

  const loadData = useCallback((forceRefresh = false) => {
    if (isMerchant) {
      if (merchantId) {
        dispatch(getMerchantWallet(merchantId, forceRefresh));
        dispatch(getMerchantPrograms(merchantId, forceRefresh));
        dispatch(getRecentMerchantActivities(merchantId, forceRefresh)).catch(() => {});
      }
    } else {
      dispatch(getDashboard(forceRefresh));
    }
  }, [dispatch, isMerchant, merchantId]);

  useEffect(() => {
    loadData(); // Uses cache on initial load
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true); // Force refresh bypasses cache
  };

  const refreshing = isMerchant
    ? walletLoading || programsLoading || recentActivitiesLoading
    : dashboardLoading;

  const firstName = user?.first_name || 'User';
  const programList = programs?.programs || [];
  const points = isMerchant
    ? programList.length
    : dashboard?.wallet_summary?.total_points ?? 0;
  const estimatedValue = isMerchant
    ? wallet?.available_balance ?? 0
    : dashboard?.wallet_summary?.estimated_reward_value ?? 0;

  const handleViewQR = () => {
    navigation.navigate('MyQRCode');
  };

  const handleRedeem = () => {
    switchTab('Rewards');
  };

  const handleOfferDetails = () => {
    switchTab('Rewards');
  };

  const handleSeeAllActivities = () => {
    switchTab('Activity');
  };

  const handleSeeAllRewards = () => {
    switchTab('Rewards');
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }>
        <HomeHeader
          name={firstName}
          onProfile={() => switchTab('Profile')}
          onNotification={() => {}}
          onWallet={() => {}}
        />

        <BalanceCards
          points={String(points)}
          estimatedValue={String(estimatedValue)}
          pointsLabel={isMerchant ? 'Programs' : 'Points'}
          pointsSubLabel={isMerchant ? 'Total Programs' : 'Current Balance'}
          valueLabel={isMerchant ? 'Wallet Balance' : 'Est. Point Value'}
          valueSubLabel={isMerchant ? 'Available Balance' : 'Available to Redeem'}
          onPointsPress={isMerchant ? () => navigation.navigate('Programs') : undefined}
        />

        <ViewQRButton onPress={handleViewQR} />

        <ActivitiesSection
          activities={
            isMerchant
              ? recentActivities.slice(0, 3).map(mapMerchantActivityForHome)
              : (dashboard?.recent_activity || []).slice(0, 3).map(mapActivity)
          }
          onSeeAll={handleSeeAllActivities}
        />

        {isMerchant ? (
          <QuickActionsSection
            actions={[
              {
                key: 'order',
                label: 'Create Order',
                icon: QuickActionIcons.cart,
                onPress: () => navigation.navigate('CreateOrder'),
              },
              {
                key: 'programs',
                label: 'Programs',
                icon: QuickActionIcons.gift,
                onPress: () => navigation.navigate('Programs'),
              },
              {
                key: 'activity',
                label: 'Activity',
                icon: QuickActionIcons.list,
                onPress: handleSeeAllActivities,
              },
            ]}
          />
        ) : (
          <>
            <QuickActionsSection
              actions={[
                {
                  key: 'points',
                  label: 'Points',
                  icon: QuickActionIcons.star,
                  onPress: () => navigation.navigate('MyPoints'),
                },
                {
                  key: 'eligibility',
                  label: 'Check Eligibility',
                  icon: QuickActionIcons.check,
                  onPress: () => navigation.navigate('CheckEligibility'),
                },
                {
                  key: 'purchases',
                  label: 'Purchases',
                  icon: QuickActionIcons.receipt,
                  onPress: () => navigation.navigate('Purchases'),
                },
              ]}
            />

            <RewardsSection
              rewards={dashboard?.available_rewards || []}
              onRedeem={handleRedeem}
              onSeeAll={handleSeeAllRewards}
            />
          </>
        )}

        <OffersSection
          offers={dashboard?.offers || []}
          onDetails={handleOfferDetails}
        />
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 110,
  },
});

export default Home;
