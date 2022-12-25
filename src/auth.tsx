import {useMemo} from 'react';
import {encodeUrlSafeBase64, randomUUID} from './util';

const clientIdProd =
  'supermarker-dcf39935dd1886632be2603cfdfab8542394559181827089365';

const authorizeUrlProd = 'https://api.kroger.com/v1/connect/oauth2/authorize';
const tokenUrlProd = 'https://api.kroger.com/v1/connect/oauth2/token';

const redirectUri = () => {
  const url = new URL(location.href);
  url.search = 'callback';
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

const getCodeVerifier = () => {
  const codeVerifier = localStorage.getItem('oauth_code_verifier');
  if (!codeVerifier) {
    throw new Error('No code verifier has been generated');
  }
  return codeVerifier;
};

const generateLoginHref = () => {
  return `${authorizeUrlProd}?${[
    `response_type=code`,
    `response_mode=form_post`,
    `code_challenge=${getCodeChallenge()}`,
    `code_challenge_method=S256`,
    `scope=product.compact`,
    `client_id=${clientIdProd}`,
    `redirect_uri=${redirectUri()}`,
    `state=${getNonce()}`,
  ].join('&')}`;
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
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const accessToken = (await response.json()).access_token;
  localStorage.setItem('oauth_access_token', accessToken);
};

export const handleOauthCallback = async () => {
  const url = new URL(location.href);

  // check whether an OAuth server has redirected back to us
  let isCallback = false;
  if (url.searchParams.has('callback')) {
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

export const useAccessToken = () => {
  return useMemo(() => {
    const authCode = localStorage.getItem('oauth_access_token');
    if (authCode) {
      localStorage.removeItem('auto_login_debounce');
      return authCode;
    }

    if (localStorage.getItem('auto_login_debounce')) {
      localStorage.removeItem('auto_login_debounce');
      throw new Error('Auto-login is looping');
    }
    localStorage.setItem('auto_login_debounce', '1');
    location.href = generateLoginHref();
    return null;
  }, []);
};
