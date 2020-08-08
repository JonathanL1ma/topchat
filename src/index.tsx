import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Loader from './components/Loader';
import CenterWrapper from './global/CenterWrapper';

import { firebaseConfig } from './util/firebase.config';
import { FirebaseAppProvider } from 'reactfire';

import './index.css';

ReactDOM.render(
    <FirebaseAppProvider firebaseConfig={ firebaseConfig }>
        <Suspense fallback={<CenterWrapper><Loader /></CenterWrapper>}>
            <App />
        </Suspense>
    </FirebaseAppProvider>,
    document.getElementById('root')
);
