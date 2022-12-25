import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {App} from './App';
import {handleOauthCallback} from './auth';
import {fixLocalhostUrl} from './util';

window.addEventListener('load', async () => {
  fixLocalhostUrl();
  await handleOauthCallback();

  const container = document.getElementById('root');
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
});
