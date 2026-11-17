import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState} from '../../components/ui';
import {getMerchantWallet} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import {useMerchantId, hasMerchantWallet} from '../../utilities/merchantData';
import TransferForm from './TransferForm';

/**
 * Merchant withdrawal from the business wallet to any bank account. The server
 * debits the merchant's own Safe Haven account and checks the password, so the
 * app never sends a debit account number.
 */
const MerchantWithdraw = () => {
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {wallet, walletLoading, profile, error} = useSelector(state => state.merchant);

  const reload = useCallback(() => {
    if (merchantId) {
      dispatch(getMerchantWallet(merchantId, true)).catch(() => {});
    }
  }, [dispatch, merchantId]);

  // Withdrawals are checked against the latest balance, so skip the cache
  useEffect(() => {
    reload();
  }, [reload]);

  const submit = async ({bank, accountNumber, amount, narration, password}) => {
    const response = await merchantAPI.withdraw(merchantId, {
      bankCode: bank.id,
      bankName: bank.label,
      accountNumber,
      amount,
      narration,
      password,
    });
    reload();
    return {
      status: response.data?.status === 'success' ? 'success' : 'pending',
      reference: response.data?.wallet_transaction?.id,
    };
  };

  return (
    <TransferForm
      title="Withdraw to bank"
      source={{
        loading: walletLoading && !wallet,
        error: !wallet ? error : null,
        reload,
        balance: wallet?.available_balance,
        currency: wallet?.currency || 'NGN',
        ready: !!wallet && hasMerchantWallet(profile),
      }}
      notReady={
        <EmptyState
          title="Set up your business wallet first"
          hint="Withdrawals need a verified business with an active wallet account."
        />
      }
      requirePassword
      submit={submit}
      retryRoute="MerchantWithdraw"
      doneTab="Business"
    />
  );
};

export default MerchantWithdraw;
