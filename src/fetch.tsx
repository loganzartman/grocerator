import {useCallback, useMemo, useRef, useState} from 'react';
import {useAccessToken} from './auth';
import {ExpiringCache} from './cache';

export type FetchState = 'loading' | 'ready' | 'error';
export type FetchResult =
  | {state: 'loading'}
  | {state: 'ready'; data: any}
  | {state: 'error'; error: any};

const fetchCache = new ExpiringCache<Readonly<[URL, RequestInit]>, Object>({
  expiresInMs: 120 * 1000,
});

const deepEqual = (a: Object, b: Object) =>
  JSON.stringify(a) === JSON.stringify(b);

export const useFetch = (input: {
  url: string;
  method: string;
  params?: {[k: string]: string};
  headers?: {[k: string]: string};
  skip?: boolean;
  noCache?: boolean;
}): FetchResult => {
  const accessToken = useAccessToken();
  const [state, setState] = useState<FetchState>('loading');
  const urlRef = useRef(null);
  const fetchInitRef = useRef(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dataRef = useRef(null);
  const errorRef = useRef(null);

  const url = useMemo(() => {
    const url = new URL(input.url);
    url.search = new URLSearchParams(input.params).toString();
    return url;
  }, [input.url, input.params]);

  const fetchInit = useMemo(() => {
    const headers = {Authorization: `Bearer ${accessToken}`, ...input.headers};
    return {method: input.method, headers};
  }, [accessToken, input.headers, input.method]);

  const inputChanged = useMemo(
    () =>
      !input.skip &&
      (!deepEqual(url, urlRef.current) ||
        !deepEqual(fetchInit, fetchInitRef.current)),
    [url, fetchInit, input.skip]
  );

  const sendRequest = useCallback(async () => {
    setState('loading');

    abortControllerRef.current?.abort('Sending new request');
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    urlRef.current = url;
    fetchInitRef.current = fetchInit;

    const cacheKey = [url, fetchInit] as const;
    if (!input.noCache && fetchCache.has(cacheKey)) {
      dataRef.current = fetchCache.get(cacheKey);
      errorRef.current = null;
      fetchCache.set(cacheKey, dataRef.current);
      setState('ready');
    } else {
      try {
        const response = await fetch(url, {...fetchInit, signal});
        if (response.ok) {
          dataRef.current = await response.json();
          errorRef.current = null;
          if (!input.noCache) {
            fetchCache.set(cacheKey, dataRef.current);
          }
          setState('ready');
        } else {
          dataRef.current = null;
          errorRef.current = await response.text();
          console.warn(errorRef.current);
          setState('error');
        }
      } catch (e) {
        dataRef.current = null;
        errorRef.current = e.toString();
        console.warn(e);
        setState('error');
      }
    }
  }, [url, fetchInit]);

  if (inputChanged) {
    sendRequest();
  }

  if (state === 'loading') {
    return {state};
  } else if (state === 'ready') {
    return {state, data: dataRef.current};
  } else if (state === 'error') {
    return {state, error: errorRef.current};
  } else {
    throw new Error(`Invalid internal state: ${state}`);
  }
};
