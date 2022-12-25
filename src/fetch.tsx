import {useMemo, useRef, useState} from 'react';
import {useAccessToken} from './auth';

export type FetchState = 'initial' | 'loading' | 'ready' | 'error';
export type FetchResult =
  | {state: 'initial'}
  | {state: 'loading'}
  | {state: 'ready'; data: any}
  | {state: 'error'; error: any};

export const useFetchData = (input: {
  url: string;
  method: string;
  params?: {[k: string]: string};
  headers?: {[k: string]: string};
}): FetchResult => {
  const accessToken = useAccessToken();
  const [state, setState] = useState<FetchState>('initial');
  const promise = useRef(null);
  const data = useRef(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`,
      ...input.headers,
    }),
    [input.headers]
  );

  if (state === 'initial') {
    const url = new URL(input.url);
    url.search = new URLSearchParams(input.params).toString();
    promise.current = fetch(url, {
      method: input.method,
      headers,
    })
      .then(async (result) => {
        if (result.ok) {
          data.current = await result.json();
          setState('ready');
        } else {
          console.warn(await result.json());
          setState('error');
        }
      })
      .catch((reason) => {
        console.warn(reason);
        setState('error');
      });
    setState('loading');
    return {state};
  }
  if (state === 'loading') {
    return {state};
  }
  if (state === 'ready') {
    return {state, data: data.current};
  }
  if (state === 'error') {
    return {state, error: 'An error occurred'};
  }
  throw new Error('Invalid state');
};
