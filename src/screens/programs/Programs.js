import React, {useCallback, useEffect} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {getMerchantPrograms} from '../../actions/merchantActions';

const formatStatus = status =>
  status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';

const ProgramItem = ({program, isLast, onPress}) => {
  const isActive = (program.status || '').toUpperCase() === 'ACTIVE';
  return (
    <TouchableOpacity
      style={[styles.itemRow, !isLast && styles.itemBorder]}
      onPress={() => onPress(program)}
      activeOpacity={0.7}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName} numberOfLines={1}>
          {program.name || 'Untitled program'}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={1}>
          {[
            formatStatus(program.billing_type),
            program.point_value != null &&
              `Point value ${program.currency === 'NGN' ? '₦' : ''}${Number(program.point_value)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      {!!program.status && (
        <Text style={[styles.itemStatus, isActive && styles.itemStatusActive]}>
          {formatStatus(program.status)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const Programs = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const {programs, programsLoading} = useSelector(state => state.merchant);

  const merchantId = user?.merchant_ids?.[0];
  const programList = programs?.programs || [];

  const loadPrograms = useCallback(() => {
    if (merchantId) {
      dispatch(getMerchantPrograms(merchantId)).catch(() => {});
    }
  }, [dispatch, merchantId]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <BackIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={programList}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={({item, index}) => (
          <ProgramItem
            program={item}
            isLast={index === programList.length - 1}
            onPress={program => navigation.navigate('ProgramDetails', {program})}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={programsLoading}
            onRefresh={loadPrograms}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          !programsLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No programs yet</Text>
              <Text style={styles.emptySubtext}>Your loyalty programs will appear here</Text>
            </View>
          )
        }
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: theme.TEXT_PRIMARY,
  },
  itemDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    marginTop: 4,
  },
  itemStatus: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
  },
  itemStatusActive: {
    color: '#12B76A',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    marginTop: 6,
  },
});

export default Programs;
