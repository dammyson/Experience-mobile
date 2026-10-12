import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const memoryCache = new Map();

const getCacheKey = (key) => `${CACHE_PREFIX}${key}`;

export const cache = {
  async get(key) {
    const cacheKey = getCacheKey(key);

    // Check memory first
    if (memoryCache.has(cacheKey)) {
      const {data, expiry} = memoryCache.get(cacheKey);
      if (Date.now() < expiry) {
        return data;
      }
      memoryCache.delete(cacheKey);
    }

    // Check AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(cacheKey);
      if (stored) {
        const {data, expiry} = JSON.parse(stored);
        if (Date.now() < expiry) {
          // Restore to memory
          memoryCache.set(cacheKey, {data, expiry});
          return data;
        }
        await AsyncStorage.removeItem(cacheKey);
      }
    } catch (err) {
      console.log('[Cache] Error reading:', err.message);
    }

    return null;
  },

  async set(key, data, ttl = DEFAULT_TTL) {
    const cacheKey = getCacheKey(key);
    const expiry = Date.now() + ttl;
    const cacheEntry = {data, expiry};

    // Store in memory
    memoryCache.set(cacheKey, cacheEntry);

    // Store in AsyncStorage
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (err) {
      console.log('[Cache] Error writing:', err.message);
    }
  },

  async invalidate(key) {
    const cacheKey = getCacheKey(key);
    memoryCache.delete(cacheKey);
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch (err) {
      console.log('[Cache] Error invalidating:', err.message);
    }
  },

  async invalidateMultiple(keys) {
    await Promise.all(keys.map(key => this.invalidate(key)));
  },

  async invalidateAll() {
    memoryCache.clear();
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (err) {
      console.log('[Cache] Error clearing all:', err.message);
    }
  },
};

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD: 'dashboard',
  TRANSACTIONS: 'transactions',
  PROFILE: 'profile',
  WALLET: 'wallet',
};

export default cache;
