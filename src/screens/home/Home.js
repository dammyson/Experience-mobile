import React from 'react';
import {ScrollView, StatusBar, StyleSheet} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import HomeHeader from '../../components/home/HomeHeader';
import BalanceCards from '../../components/home/BalanceCards';
import ViewQRButton from '../../components/home/ViewQRButton';
import ActivitiesSection from '../../components/home/ActivitiesSection';
import RewardsSection from '../../components/home/RewardsSection';
import OffersSection from '../../components/home/OffersSection';
import {useTabContext} from '../../navigations/TabContext';

const Home = () => {
  const {switchTab} = useTabContext();

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
        showsVerticalScrollIndicator={false}>
        <HomeHeader
          name="Sarah"
          onProfile={() => switchTab('Profile')}
          onNotification={() => {}}
          onWallet={() => {}}
        />

        <BalanceCards points="1750" estimatedValue="950" />

        <ViewQRButton onPress={handleViewQR} />

        <ActivitiesSection onSeeAll={handleSeeAllActivities} />

        <RewardsSection onRedeem={handleRedeem} onSeeAll={handleSeeAllRewards} />

        <OffersSection onDetails={handleOfferDetails} />
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
