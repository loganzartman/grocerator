import {useEffect, useState} from 'react';
import {encodeUrlSafeBase64, randomUUID} from './util';

const clientIdProd =
  'supermarker-dcf39935dd1886632be2603cfdfab8542394559181827089365';

const authorizeUrlProd = 'https://api.kroger.com/v1/connect/oauth2/authorize';
const tokenUrlProd = 'https://api.kroger.com/v1/connect/oauth2/token';

const REFRESH_TIME_ALLOWANCE_MS = 1000 * 60;
export const accessTokenEvents = new EventTarget();
export const accessTokenChanged = new CustomEvent('changed');

const redirectUri = () => {
  const url = new URL(location.href);
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url.toString();
};

const resetNonce = () => {
  localStorage.setItem('oauth_nonce', randomUUID());
};

const getNonce = () => {
  return localStorage.getItem('oauth_nonce');
};

const generateCodeVerifier = (): string => {
  const buffer = new Uint8Array(32);
  return encodeUrlSafeBase64(crypto.getRandomValues(buffer));
};

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  return encodeUrlSafeBase64(await crypto.subtle.digest('SHA-256', data));
};

const resetCodeChallenge = async () => {
  const verifier = generateCodeVerifier();
  localStorage.setItem('oauth_code_verifier', verifier);
  localStorage.setItem(
    'oauth_code_challenge',
    await generateCodeChallenge(verifier)
  );
};

const getCodeChallenge = (): string => {
  const codeChallenge = localStorage.getItem('oauth_code_challenge');
  if (!codeChallenge) {
    throw new Error('No code challenge has been generated');
  }
  return codeChallenge;
};

const getCodeVerifier = (): string => {
  const codeVerifier = localStorage.getItem('oauth_code_verifier');
  if (!codeVerifier) {
    throw new Error('No code verifier has been generated');
  }
  return codeVerifier;
};

const getAccessToken = (): string => {
  const accessToken = localStorage.getItem('oauth_access_token');
  if (!accessToken) {
    throw new Error('No access token has been acquired');
  }
  return accessToken;
};

const getRefreshToken = (): string => {
  const refreshToken = localStorage.getItem('oauth_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token has been acquired');
  }
  return refreshToken;
};

const getExpirationDate = (): number => {
  const expirationDate = localStorage.getItem('oauth_expiration_date');
  if (!expirationDate) {
    throw new Error('No expiration date has been acquired');
  }
  return Number.parseInt(expirationDate);
};

const isAccessTokenFresh = () => {
  return getExpirationDate() > Date.now() + REFRESH_TIME_ALLOWANCE_MS;
};

const hasFreshAccessToken = (): boolean => {
  return !!localStorage.getItem('oauth_access_token') && isAccessTokenFresh();
};

const generateLoginHref = () => {
  return `${authorizeUrlProd}?${[
    'response_type=code',
    'response_mode=form_post',
    `code_challenge=${getCodeChallenge()}`,
    'code_challenge_method=S256',
    'scope=product.compact',
    `client_id=${clientIdProd}`,
    `redirect_uri=${redirectUri()}`,
    `state=${getNonce()}`,
  ].join('&')}`;
};

const handleTokenResponse = async (response: Response) => {
  const responseJson = await response.json();

  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresInSec,
  } = responseJson;

  localStorage.setItem('oauth_access_token', accessToken);
  localStorage.setItem('oauth_refresh_token', refreshToken);
  localStorage.setItem(
    'oauth_expiration_date',
    String(Date.now() + expiresInSec * 1000)
  );
  accessTokenEvents.dispatchEvent(accessTokenChanged);

  setRefreshTimeout();
};

const exchangeCodeForAccessToken = async (code: string) => {
  const basicAuth = btoa(`${clientIdProd}:`);
  const response = await fetch(tokenUrlProd, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientIdProd,
      code_verifier: getCodeVerifier(),
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(),
      scope: 'product.compact',
    }),
  });

  if (response.ok) {
    await handleTokenResponse(response);
  } else {
    throw new Error(await response.text());
  }
};

const refreshAccessToken = async () => {
  // TODO: kroger says "invalid auth"? not sure it's on my end.
  const basicAuth = btoa(`${clientIdProd}:`);
  const response = await fetch(tokenUrlProd, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: getRefreshToken(),
    }),
  });

  if (response.ok) {
    await handleTokenResponse(response);
  } else {
    console.warn(`Failed to refresh access token: ${await response.text()}`);
  }
};

const handleOAuthCallback = async () => {
  const url = new URL(location.href);

  // check whether an OAuth server has redirected back to us
  let isCallback = false;
  if (url.searchParams.has('code')) {
    isCallback = true;
    const nonce = getNonce();
    // there should be a nonce if login was initiated from this page.
    // otherwise, maybe someone hit the back button or used an old link.
    if (nonce) {
      if (url.searchParams.get('state') === nonce) {
        const code = url.searchParams.get('code');
        await exchangeCodeForAccessToken(code);
      } else {
        throw new Error('nonce/state mismatch');
      }
    }
  }

  // safe to reset state after handling the callback
  await resetCodeChallenge();
  resetNonce();

  // exit the callback
  if (isCallback) {
    url.search = '';
    url.hash = '';
    location.replace(url);
  }
};

const setRefreshTimeout = () => {
  if (hasFreshAccessToken()) {
    const timeLeft = getExpirationDate() - Date.now();
    setTimeout(() => {
      refreshAccessToken();
    }, Math.max(0, timeLeft - REFRESH_TIME_ALLOWANCE_MS));
  } else console.log('stale AT');
};

export const initOAuth = async () => {
  await handleOAuthCallback();
  setRefreshTimeout();
};

export const useAccessToken = () => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (!hasFreshAccessToken()) {
      location.href = generateLoginHref();
      return null;
    }
    return getAccessToken();
  });

  useEffect(() => {
    const handleChanged = () => {
      setAccessToken(getAccessToken());
    };
    accessTokenEvents.addEventListener('changed', handleChanged);
    return () => {
      accessTokenEvents.removeEventListener('changed', handleChanged);
    };
  }, []);

  return accessToken;
};
