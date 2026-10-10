import React, {useEffect} from 'react';
import {ScrollView, StatusBar, StyleSheet, RefreshControl} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import HomeHeader from '../../components/home/HomeHeader';
import BalanceCards from '../../components/home/BalanceCards';
import ViewQRButton from '../../components/home/ViewQRButton';
import ActivitiesSection from '../../components/home/ActivitiesSection';
import RewardsSection from '../../components/home/RewardsSection';
import OffersSection from '../../components/home/OffersSection';
import {useTabContext} from '../../navigations/TabContext';
import {getDashboard} from '../../actions/customerActions';

const Home = () => {
  const {switchTab} = useTabContext();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const {dashboard, dashboardLoading} = useSelector(state => state.customer);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getDashboard());
  };

  const firstName = user?.first_name || 'User';
  const points = dashboard?.wallet_summary?.total_points ?? 0;
  const estimatedValue = dashboard?.wallet_summary?.estimated_reward_value ?? 0;

  const handleViewQR = () => {
    switchTab('ScanQR');
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
            refreshing={dashboardLoading}
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

        <BalanceCards points={String(points)} estimatedValue={String(estimatedValue)} />

        <ViewQRButton onPress={handleViewQR} />

        <ActivitiesSection
          activities={dashboard?.recent_activity || []}
          onSeeAll={handleSeeAllActivities}
        />

        <RewardsSection
          rewards={dashboard?.available_rewards || []}
          onRedeem={handleRedeem}
          onSeeAll={handleSeeAllRewards}
        />

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
