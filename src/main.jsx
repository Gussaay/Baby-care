import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { I18nProvider } from './lib/i18n.jsx';
import { StoreProvider } from './lib/store.jsx';
import { dict } from './lib/strings.js';
import './firebase.js';
import './index.css';

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#E8577D' }).catch(() => {});
  // No service worker inside the native app: the APK ships its own files.
  navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()));
} else {
  registerSW({ immediate: true });
}

const onSaveError = () => window.alert(dict[document.documentElement.lang === 'ar' ? 'ar' : 'en'].saveFailed);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <StoreProvider onSaveError={onSaveError}>
        <App />
      </StoreProvider>
    </I18nProvider>
  </React.StrictMode>,
);
