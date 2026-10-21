import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Text, FlatList, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {ConfirmSheet} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import ProgramCard from '../../components/merchant/ProgramCard';
import {getMerchantPrograms, getMerchantWallet} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import useProgramBalances from '../../utilities/useProgramBalances';
import {useMerchantId, readPrograms, readBalance, programTag, isPrepaid, isOpen} from '../../utilities/merchantData';
import {formatNaira} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const Programs = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {programs, programsLoading, error} = useSelector(state => state.merchant);
  const [pending, setPending] = useState(null); // {kind: 'close' | 'settle', program, amount}

  const list = useMemo(() => readPrograms(programs), [programs]);
  const {balances, reload: reloadBalances} = useProgramBalances(merchantId, list);

  const load = useCallback(
    (force = false) => {
      if (merchantId) {
        dispatch(getMerchantPrograms(merchantId, force)).catch(() => {});
      }
    },
    [dispatch, merchantId],
  );

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      reloadBalances();
    }, [reloadBalances]),
  );

  const actionFor = program => {
    const balance = balances[program.id];
    if (!isOpen(program) && programTag(program, balance).pending) {
      return {
        label: 'Settle now',
        note: 'Fund your wallet if needed, then settle what this program owes.',
        primary: true,
        onPress: () => setPending({kind: 'settle', program, amount: readBalance(balance).due}),
      };
    }
    if (isOpen(program) && !isPrepaid(program)) {
      return {
        label: 'Close program',
        note: 'Closing charges your wallet for points awarded.',
        onPress: () => setPending({kind: 'close', program, amount: readBalance(balance).due}),
      };
    }
    return undefined;
  };

  const confirmAction = async () => {
    const {kind, program} = pending;
    try {
      if (kind === 'close') {
        await merchantAPI.closeProgram(merchantId, program.id);
      } else {
        await merchantAPI.settleProgram(merchantId, program.id);
      }
      setPending(null);
      showMessage({message: kind === 'close' ? `${program.name} closed` : `${program.name} settled`, type: 'success'});
      load(true);
      reloadBalances();
      dispatch(getMerchantWallet(merchantId, true)).catch(() => {});
    } catch (err) {
      setPending(null);
      showMessage({message: err.message || 'That didn’t go through. Try again.', type: 'danger'});
    }
  };

  const amountLabel = pending?.amount != null ? formatNaira(pending.amount) : null;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader
        title="Programs"
        root
        right={
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('CreateProgram')}
            accessibilityRole="button"
            accessibilityLabel="New program"
            activeOpacity={0.85}>
            <Icon name="plus" size={16} color={colors.white} strokeWidth={2.2} />
            <Text style={styles.newText}>New</Text>
          </TouchableOpacity>
        }
      />
      <FlatList
        data={programsLoading && !programs ? [] : list}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <ProgramCard
            program={item}
            balance={balances[item.id]}
            action={actionFor(item)}
            onPress={() => navigation.navigate('ProgramDetails', {program: item})}
          />
        )}
        ListEmptyComponent={
          <RequestState
            loading={programsLoading && !programs}
            error={!programs && error}
            onRetry={() => load(true)}
            empty
            emptyText="No programs yet"
            emptySubtext="Create a program to start rewarding customers."
          />
        }
        contentContainerStyle={[styles.list, {paddingBottom: TAB_SCROLL_INSET}]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={programsLoading && !!programs}
            onRefresh={() => {
              load(true);
              reloadBalances();
            }}
            tintColor={colors.link}
          />
        }
      />

      {!!pending && (
        <ConfirmSheet
          visible
          title={pending.kind === 'close' ? `Close ${pending.program.name}?` : `Settle ${pending.program.name}`}
          rows={[
            amountLabel && {
              label: pending.kind === 'close' ? 'Charged to your wallet' : 'Amount due',
              value: amountLabel,
            },
          ]}
          note={
            pending.kind === 'close'
              ? "Customers can't earn in this program once it's closed. Your wallet is charged for the points awarded."
              : 'The amount due is taken from your business wallet.'
          }
          editLabel="Cancel"
          confirmLabel={pending.kind === 'close' ? 'Close program' : 'Settle now'}
          destructive={pending.kind === 'close'}
          onConfirm={confirmAction}
          onClose={() => setPending(null)}
        />
      )}
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: 16,
    paddingHorizontal: layout.screenPadding,
    gap: 12,
  },
  newBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newText: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.white,
  },
});

export default Programs;
