import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {EmptyState} from '../../components/ui';
import {safeHavenAPI} from '../../services/api';
import useWalletAccount from '../../utilities/useWalletAccount';
import {transferOutcome, newPaymentReference} from '../../utilities/transfer';
import TransferForm from './TransferForm';

// Customer transfer from their Safe Haven wallet account to any bank
const Transfer = () => {
  const navigation = useNavigation();
  const wallet = useWalletAccount();
  const {account} = wallet;

  const submit = async ({bank, accountNumber, sessionId, amount, narration, saveBeneficiary}) => {
    const paymentReference = newPaymentReference();
    const response = await safeHavenAPI.transferExternal({
      nameEnquiryReference: sessionId,
      debitAccountNumber: account.number,
      bankCode: bank.id,
      accountNumber,
      amount,
      narration,
      paymentReference,
      saveBeneficiary,
    });
    return {status: transferOutcome(response.data), reference: paymentReference};
  };

  return (
    <TransferForm
      title="Transfer to bank"
      source={{
        loading: wallet.loading,
        error: wallet.error,
        reload: wallet.reload,
        balance: account.balance,
        currency: account.currency,
        ready: !!account.number,
      }}
      notReady={
        <EmptyState
          title="Verify your identity first"
          hint="Bank transfers need a wallet account. Verify your BVN to get one."
          action={{label: 'Verify identity', onPress: () => navigation.replace('VerifyIdentity')}}
        />
      }
      showSaveBeneficiary
      submit={submit}
      retryRoute="Transfer"
      doneTab="Wallet"
    />
  );
};

export default Transfer;
