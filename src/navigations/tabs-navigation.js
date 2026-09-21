import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from '../screens/home/Home';
import Activity from '../screens/activity/Activity';
import ScanQR from '../screens/scanqr/ScanQR';
import Rewards from '../screens/rewards/Rewards';
import Profile from '../screens/profile/Profile';
import CustomTabBar from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();

const TabsNavigation = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}>
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Activity" component={Activity} />
    <Tab.Screen name="ScanQR" component={ScanQR} />
    <Tab.Screen name="Rewards" component={Rewards} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

export default TabsNavigation;
