import {randomUUID} from './uuid';

const clientIdProd =
  'supermarker-dcf39935dd1886632be2603cfdfab8542394559181827089365';
const clientIdTest =
  'supermarker-ce-34ccda38b50ee79372187608983b64652777442985647242029';

const authorizeUrlProd = 'https://api.kroger.com/v1/connect/oauth2/authorize';
const authorizeUrlTest =
  'https://api-ce.kroger.com/v1/connect/oauth2/authorize';

const redirectUri = () => {
  const url = new URL(window.location.href);
  url.search = 'callback';
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    url.hostname = 'localhost.loga.nz';
  }
  return url.toString();
};

export const initNonce = () => {
  if (!window.localStorage.getItem('oauth_nonce')) {
    resetNonce();
  }
};

export const resetNonce = () => {
  window.localStorage.setItem('oauth_nonce', randomUUID());
};

export const getNonce = () => {
  const nonce = window.localStorage.getItem('oauth_nonce');
  if (!nonce) {
    throw new Error('no nonce in localStorage');
  }
  return nonce;
};

export const loginHref = () =>
  `${authorizeUrlProd}?` +
  `response_type=code&` +
  `response_mode=form_post&` +
  `scope=product.compact&` +
  `client_id=${clientIdProd}&` +
  `redirect_uri=${redirectUri()}&` +
  `state=${getNonce()}`;

export const handleOauthResponse = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has('callback')) {
    if (url.searchParams.get('state') === getNonce()) {
      window.localStorage.setItem('id_token', url.searchParams.get('code'));
    } else {
      console.error('nonce/state mismatch');
    }
    resetNonce();
    url.search = '';
    url.hash = '';
    window.location.replace(url);
  }
};
