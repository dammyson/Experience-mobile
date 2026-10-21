import React, {useCallback, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabView from 'react-native-bottom-tabs';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import Home from '../screens/home/Home';
import Explore from '../screens/explore/Explore';
import Wallet from '../screens/wallet/Wallet';
import Rewards from '../screens/rewards/Rewards';
import Overview from '../screens/merchant/Overview';
import Programs from '../screens/programs/Programs';
import Customers from '../screens/merchant/Customers';
import MerchantActivity from '../screens/activity/MerchantActivity';
import Business from '../screens/merchant/Business';
import Profile from '../screens/profile/Profile';
import CustomTabBar from '../components/navigation/CustomTabBar';
import {isIOS26Plus} from '../utilities/platform';
import {colors, fonts} from '../theme/tokens';
import {TabProvider, useTabContext} from './TabContext';

const Tab = createBottomTabNavigator();

const sf = (name, focused = `${name}.fill`) => ({
  focusedIcon: {sfSymbol: focused},
  unfocusedIcon: {sfSymbol: name},
});

// Tab sets per role. `native` holds the iOS 26 tab bar icons; the legacy bar
// maps route names to icons in CustomTabBar.
const CUSTOMER_TABS = [
  {key: 'Home', title: 'Home', component: Home, native: sf('house')},
  {key: 'Explore', title: 'Explore', component: Explore, native: sf('safari')},
  {key: 'Rewards', title: 'Rewards', component: Rewards, native: sf('gift')},
  {key: 'Wallet', title: 'Wallet', component: Wallet, native: sf('wallet.pass')},
  {key: 'Profile', title: 'Profile', component: Profile, native: sf('person.crop.circle')},
];

const MERCHANT_TABS = [
  {key: 'Overview', title: 'Overview', component: Overview, native: sf('square.grid.2x2')},
  {key: 'Programs', title: 'Programs', component: Programs, native: sf('list.bullet', 'list.bullet')},
  {key: 'Customers', title: 'Customers', component: Customers, native: sf('person.2')},
  {key: 'Activity', title: 'Activity', component: MerchantActivity, native: sf('waveform.path.ecg', 'waveform.path.ecg')},
  {key: 'Business', title: 'Business', component: Business, native: sf('storefront')},
];

const NATIVE_ROUTES = {
  customer: CUSTOMER_TABS.map(({key, title, native}) => ({key, title, ...native})),
  merchant: MERCHANT_TABS.map(({key, title, native}) => ({key, title, ...native})),
};

const useRoleTabs = () => {
  const userType = useSelector(state => state.auth.userType);
  return userType === 'merchant' ? 'merchant' : 'customer';
};

// ─── iOS 26+ native glass tab bar via react-native-bottom-tabs (UITabBar) ───

const TAB_LABEL_STYLE = {fontFamily: fonts.semiBold, fontSize: 11};

const NativeTabsContent = ({tabs, routes}) => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const {tabIndex, setTabIndex, switchTab} = useTabContext();

  // goToTab() from a stack screen passes {tab, at}
  const {tab: requestedTab, at: requestedAt} = params ?? {};
  useEffect(() => {
    if (requestedTab) {
      switchTab(requestedTab);
    }
  }, [requestedTab, requestedAt, switchTab]);

  const renderScene = useCallback(
    ({route}) => {
      const tab = tabs.find(t => t.key === route.key);
      return tab ? <tab.component navigation={navigation} /> : null;
    },
    [navigation, tabs],
  );

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <TabView
        navigationState={{index: tabIndex, routes}}
        onIndexChange={setTabIndex}
        renderScene={renderScene}
        tabBarActiveTintColor={colors.link}
        tabBarInactiveTintColor={colors.tabInactive}
        tabLabelStyle={TAB_LABEL_STYLE}
        hapticFeedbackEnabled
        scrollEdgeAppearance="default"
        getLazy={() => true}
      />
    </>
  );
};

const NativeTabsView = () => {
  const role = useRoleTabs();
  const tabs = role === 'merchant' ? MERCHANT_TABS : CUSTOMER_TABS;
  const routes = NATIVE_ROUTES[role];
  return (
    <TabProvider key={role} routes={routes}>
      <NativeTabsContent tabs={tabs} routes={routes} />
    </TabProvider>
  );
};

// ─── Legacy tab bar (Android + iOS < 26): flat bar from the redesign ───

const renderTabBar = props => <CustomTabBar {...props} />;

const LegacyTabsView = () => {
  const role = useRoleTabs();
  const tabs = role === 'merchant' ? MERCHANT_TABS : CUSTOMER_TABS;
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <Tab.Navigator key={role} tabBar={renderTabBar} screenOptions={{headerShown: false}}>
        {tabs.map(tab => (
          <Tab.Screen key={tab.key} name={tab.key} component={tab.component} />
        ))}
      </Tab.Navigator>
    </>
  );
};

// ─── Root: pick the right tab bar based on platform / OS version ───

const TabsNavigation = () => (isIOS26Plus ? <NativeTabsView /> : <LegacyTabsView />);

export default TabsNavigation;
