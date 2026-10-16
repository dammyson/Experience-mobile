import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import RequestState from '../../components/layout/RequestState';
import {SearchInput} from '../../components/ui';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';

export const getMerchantId = merchant => merchant.id || merchant.merchant_id;
export const getMerchantName = merchant => merchant.name || merchant.merchant_name || 'Merchant';

const ChevronRight = () => <Text style={styles.chevron}>›</Text>;

const CheckEligibility = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const {data, loading, refreshing, error, reload, refresh} = useRequest(
    () => customerAPI.getMerchants(),
    [],
  );

  const merchants = useMemo(
    () => (Array.isArray(data) ? data : data?.merchants || []),
    [data],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return merchants;
    }
    return merchants.filter(merchant =>
      [getMerchantName(merchant), merchant.description]
        .filter(Boolean)
        .some(field => field.toLowerCase().includes(query)),
    );
  }, [merchants, search]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AppHeader title="Check Eligibility" showBack onBack={() => navigation.goBack()} />

      <View style={styles.searchRow}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search merchants" />
      </View>

      <FlatList
        data={loading || error ? [] : filtered}
        keyExtractor={(item, index) => getMerchantId(item) || String(index)}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8B5CF6" />
        }
        renderItem={({item, index}) => (
          <TouchableOpacity
            style={[styles.row, index < filtered.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate('MerchantEligibility', {merchant: item})}
            activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Text style={styles.name} numberOfLines={1}>
                {getMerchantName(item)}
              </Text>
              {!!item.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>
            <ChevronRight />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <RequestState
            loading={loading}
            error={error}
            empty
            emptyText={search ? 'No merchants match your search' : 'No merchants yet'}
            onRetry={reload}
          />
        }
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLeft: {
    flex: 1,
  },
  name: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: theme.TEXT_PRIMARY,
  },
  description: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: theme.TEXT_TERTIARY,
  },
});

export default CheckEligibility;
