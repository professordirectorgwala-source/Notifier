import { useEffect, useMemo, useState } from 'react';

type QueryKey = string | readonly unknown[];

type QueryState<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
};

const cache = new Map<string, unknown>();
const inFlight = new Map<string, Promise<unknown>>();

const serializeKey = (key: QueryKey) => (Array.isArray(key) ? JSON.stringify(key) : key);

export function useQuery<T>(key: QueryKey, fetcher: () => Promise<T>): QueryState<T> {
  const cacheKey = useMemo(() => serializeKey(key), [key]);
  const [state, setState] = useState<QueryState<T>>(() => {
    if (cache.has(cacheKey)) {
      return {
        data: cache.get(cacheKey) as T,
        isLoading: false,
        error: null,
      };
    }

    return {
      data: undefined,
      isLoading: true,
      error: null,
    };
  });

  useEffect(() => {
    let cancelled = false;

    if (cache.has(cacheKey)) {
      setState({
        data: cache.get(cacheKey) as T,
        isLoading: false,
        error: null,
      });
      return () => {
        cancelled = true;
      };
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));

    const request =
      inFlight.get(cacheKey) ??
      fetcher().then((data) => {
        cache.set(cacheKey, data);
        inFlight.delete(cacheKey);
        return data;
      });

    inFlight.set(cacheKey, request);

    request
      .then((data) => {
        if (!cancelled) {
          setState({
            data: data as T,
            isLoading: false,
            error: null,
          });
        }
      })
      .catch((error: Error) => {
        inFlight.delete(cacheKey);
        if (!cancelled) {
          setState({
            data: undefined,
            isLoading: false,
            error,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, fetcher]);

  return state;
}

export function clearQueryCache() {
  cache.clear();
  inFlight.clear();
}
