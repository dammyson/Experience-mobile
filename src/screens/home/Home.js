import React from 'react';
import {ScrollView, StatusBar, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import BalanceSection from '../../components/home/BalanceSection';
import PromoSection from '../../components/home/PromoSection';
import RecentActivitySection from '../../components/home/RecentActivitySection';

const Home = () => {
  const navigation = useNavigation();

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Cooper"
          subtitle="Ready to start your today"
          greeting
          showNotification
          showCard
          onTitlePress={() => {}}
          onNotification={() => {}}
          onCard={() => {}}
        />
        <BalanceSection balance="$3,890.99" />
        <PromoSection onSeeAll={() => navigation.navigate('Rewards')} />
        <RecentActivitySection onSeeAll={() => navigation.navigate('Activity')} />
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  // Extra bottom padding so content clears the floating tab bar
  content: {
    paddingBottom: 110,
  },
});

export default Home;
