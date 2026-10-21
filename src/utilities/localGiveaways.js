import AsyncStorage from '@react-native-async-storage/async-storage';

// README gap 5: there's no endpoint to list giveaways, so the app remembers the
// ones created on this device. Remove this once a list route exists.

const key = merchantId => `@giveaways_${merchantId}`;

export const getLocalGiveaways = async merchantId => {
  try {
    const stored = await AsyncStorage.getItem(key(merchantId));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalGiveaway = async (merchantId, giveaway) => {
  const list = await getLocalGiveaways(merchantId);
  const next = [giveaway, ...list.filter(g => g.id !== giveaway.id)];
  try {
    await AsyncStorage.setItem(key(merchantId), JSON.stringify(next));
  } catch (e) {
    // Losing the local list only hides the shortcut; the giveaway still exists
  }
};
