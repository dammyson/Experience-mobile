import {useMemo} from 'react';
import useRequest from './useRequest';
import {customerAPI, SESSION_EXPIRED_MESSAGE} from '../services/api';
import {readWalletAccount} from './customerData';

/**
 * Loads the customer's wallet and Safe Haven balance together.
 * A customer without a wallet yet gets `account.exists === false` rather than
 * an error. `error` is set only when both requests fail for a network or
 * expired-session reason (the API layer doesn't expose status codes, so a
 * "no wallet" failure can't be told apart from other server errors).
 *
 *   const {account, loading, refreshing, error, reload, refresh} = useWalletAccount();
 */
const useWalletAccount = () => {
  const request = useRequest(async () => {
    const [wallet, balance] = await Promise.allSettled([
      customerAPI.getWallet(),
      customerAPI.getAccountBalance(),
    ]);
    if (wallet.status === 'rejected' && balance.status === 'rejected') {
      const message = wallet.reason?.message || '';
      if (message === SESSION_EXPIRED_MESSAGE || /network request failed/i.test(message)) {
        throw wallet.reason;
      }
    }
    return {
      data: {
        wallet: wallet.status === 'fulfilled' ? wallet.value.data : null,
        balance: balance.status === 'fulfilled' ? balance.value.data : null,
      },
    };
  }, []);

  const account = useMemo(
    () => readWalletAccount(request.data?.wallet, request.data?.balance),
    [request.data],
  );

  return {...request, account};
};

export default useWalletAccount;
