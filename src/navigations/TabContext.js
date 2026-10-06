import React, {createContext, useContext, useState, useCallback} from 'react';

const TabContext = createContext(null);

export const TAB_INDEXES = {
  Home: 0,
  Activity: 1,
  ScanQR: 2,
  Rewards: 3,
  Profile: 4,
};

export const TabProvider = ({children}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const switchTab = useCallback((tabName) => {
    const index = TAB_INDEXES[tabName];
    if (index !== undefined) {
      setTabIndex(index);
    }
  }, []);

  return (
    <TabContext.Provider value={{tabIndex, setTabIndex, switchTab}}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    return {tabIndex: 0, setTabIndex: () => {}, switchTab: () => {}};
  }
  return context;
};
