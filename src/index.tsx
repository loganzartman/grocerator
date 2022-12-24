import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {App} from './App';
import {handleOauthResponse, initNonce} from './auth';

initNonce();
handleOauthResponse();

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
