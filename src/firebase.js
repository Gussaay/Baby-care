// Firebase project "baby-care-play" (set up earlier for Baby care hosting).
// The web config is safe to publish: access is controlled by Firebase security rules.
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyD1phPgh3jNNwqWvj_kvjtF1tz8kwPYhHw',
  authDomain: 'baby-care-play.firebaseapp.com',
  projectId: 'baby-care-play',
  storageBucket: 'baby-care-play.firebasestorage.app',
  messagingSenderId: '371571774174',
  appId: '1:371571774174:web:0fa693257bcd75f25fe84f',
  measurementId: 'G-5D2FZYEP7C',
};

export const app = initializeApp(firebaseConfig);

let analytics = null;
isSupported()
  .then((ok) => { if (ok) analytics = getAnalytics(app); })
  .catch(() => {});

export function track(name, params) {
  try { if (analytics) logEvent(analytics, name, params); } catch { /* ignore */ }
}
