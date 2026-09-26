import React, {useState, useCallback} from 'react';
import {StatusBar} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabView from 'react-native-bottom-tabs';
import {useNavigation} from '@react-navigation/native';

import Home from '../screens/home/Home';
import Activity from '../screens/activity/Activity';
import ScanQR from '../screens/scanqr/ScanQR';
import Rewards from '../screens/rewards/Rewards';
import Profile from '../screens/profile/Profile';
import CustomTabBar from '../components/navigation/CustomTabBar';
import {isIOS26Plus} from '../utilities/platform';
import {theme} from '../theme/colors';

const Tab = createBottomTabNavigator();

// ─── iOS 26+ native glass tab bar via react-native-bottom-tabs (UITabBar) ───

const TAB_ICONS = {
  home:     require('../assets/tab-icons/tab-home.png'),
  activity: require('../assets/tab-icons/tab-activity.png'),
  scanqr:   require('../assets/tab-icons/tab-scan-qr.png'),
  rewards:  require('../assets/tab-icons/tab-rewards.png'),
};

const NATIVE_ROUTES = [
  {key: 'Home',     title: 'Home',     focusedIcon: TAB_ICONS.home,     unfocusedIcon: TAB_ICONS.home},
  {key: 'Activity', title: 'Activity', focusedIcon: TAB_ICONS.activity,  unfocusedIcon: TAB_ICONS.activity},
  {key: 'ScanQR',   title: 'Scan QR',  focusedIcon: TAB_ICONS.scanqr,   unfocusedIcon: TAB_ICONS.scanqr},
  {key: 'Rewards',  title: 'Rewards',  focusedIcon: TAB_ICONS.rewards,   unfocusedIcon: TAB_ICONS.rewards},
  {key: 'Profile',  title: 'Profile',  focusedIcon: {sfSymbol: 'person.crop.circle.fill'}, unfocusedIcon: {sfSymbol: 'person.crop.circle'}},
];

const NativeTabsView = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);

  const renderScene = useCallback(({route}) => {
    switch (route.key) {
      case 'Home':     return <Home navigation={navigation} />;
      case 'Activity': return <Activity navigation={navigation} />;
      case 'ScanQR':   return <ScanQR navigation={navigation} />;
      case 'Rewards':  return <Rewards navigation={navigation} />;
      case 'Profile':  return <Profile navigation={navigation} />;
      default:         return null;
    }
  }, [navigation]);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <TabView
        navigationState={{index, routes: NATIVE_ROUTES}}
        onIndexChange={setIndex}
        renderScene={renderScene}
        tabBarActiveTintColor={theme.PRIMARY_COLOR}
        hapticFeedbackEnabled
        scrollEdgeAppearance="default"
        getLazy={() => true}
      />
    </>
  );
};

// ─── Legacy tab bar (Android + iOS < 26): keeps the existing dark pill design ───

const LegacyTabsView = () => (
  <>
    <StatusBar barStyle="light-content" backgroundColor={theme.BACKGROUND_COLOR} />
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home"     component={Home} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="ScanQR"   component={ScanQR} />
      <Tab.Screen name="Rewards"  component={Rewards} />
      <Tab.Screen name="Profile"  component={Profile} />
    </Tab.Navigator>
  </>
);

// ─── Root: pick the right tab bar based on platform / OS version ───

const TabsNavigation = () =>
  isIOS26Plus ? <NativeTabsView /> : <LegacyTabsView />;

export default TabsNavigation;
