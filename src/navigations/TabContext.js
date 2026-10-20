import React, {createContext, useContext, useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';

const TabContext = createContext(null);

/**
 * Holds the selected tab for the native (iOS 26+) tab view.
 *
 * Props:
 *   routes  [{key}] — the role's tab routes, in order
 */
export const TabProvider = ({routes, children}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const switchTab = useCallback(
    tabName => {
      const index = routes.findIndex(route => route.key === tabName);
      if (index !== -1) {
        setTabIndex(index);
      }
    },
    [routes],
  );

  const value = useMemo(() => ({tabIndex, setTabIndex, switchTab}), [tabIndex, switchTab]);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

/**
 * `switchTab(name)` works under both tab bars: the native tab view uses the
 * context; the legacy React Navigation tabs navigate to the tab route.
 */
export const useTabContext = () => {
  const context = useContext(TabContext);
  const navigation = useNavigation();
  const fallback = useMemo(
    () => ({tabIndex: 0, setTabIndex: () => {}, switchTab: tabName => navigation.navigate(tabName)}),
    [navigation],
  );
  return context ?? fallback;
};
