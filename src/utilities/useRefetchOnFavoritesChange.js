import {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

/**
 * Calls `refetch` whenever the customer adds or removes a favourite elsewhere
 * (Explore dispatches FAVORITES_CHANGED). Tab screens stay mounted, so without
 * this their favourites list would stay as it was when they first loaded.
 *
 * Use the request's `refresh`, not `reload`, so the screen doesn't flash a
 * loading state.
 */
const useRefetchOnFavoritesChange = refetch => {
  const version = useSelector(state => state.customer.favoritesVersion);
  const seen = useRef(version);

  useEffect(() => {
    if (seen.current !== version) {
      seen.current = version;
      refetch();
    }
  }, [version, refetch]);
};

export default useRefetchOnFavoritesChange;
