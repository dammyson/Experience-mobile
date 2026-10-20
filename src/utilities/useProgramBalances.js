import {useCallback, useEffect, useState} from 'react';
import {merchantAPI} from '../services/api';

/**
 * Loads GET …/programs/{id}/balance for each program in parallel.
 * Returns {balances: {programId: balance}, loading, reload}. A program whose
 * balance fails to load is simply missing from the map.
 */
const useProgramBalances = (merchantId, programs) => {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const ids = programs.map(p => p.id).join(',');

  const load = useCallback(async () => {
    if (!merchantId || !ids) {
      setBalances({});
      return;
    }
    setLoading(true);
    const list = ids.split(',');
    const results = await Promise.allSettled(list.map(id => merchantAPI.getProgramBalance(merchantId, id)));
    const next = {};
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        next[list[i]] = result.value.data;
      }
    });
    setBalances(next);
    setLoading(false);
  }, [merchantId, ids]);

  useEffect(() => {
    load();
  }, [load]);

  return {balances, loading, reload: load};
};

export default useProgramBalances;
