import {useCallback, useEffect, useState} from 'react';

/**
 * Runs an API call on mount and exposes its result for screens that don't
 * keep the data in Redux.
 *
 *   const {data, loading, refreshing, error, reload, refresh} = useRequest(
 *     () => customerAPI.getPurchases(),
 *     [],
 *   );
 *
 * `data` is the response's `data` field. `refresh` is for pull-to-refresh
 * (sets `refreshing` instead of `loading`).
 */
const useRequest = (request, deps) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(request, deps);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const response = await run();
        setData(response.data);
      } catch (err) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [run],
  );

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  return {data, loading, refreshing, error, reload, refresh};
};

export default useRequest;
