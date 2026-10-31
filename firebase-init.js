// Firebase setup (loaded from the Firebase CDN, so no build step is needed).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// Web config is safe to publish: access is controlled by Firebase security rules.
const firebaseConfig = {
  apiKey: "AIzaSyD1phPgh3jNNwqWvj_kvjtF1tz8kwPYhHw",
  authDomain: "baby-care-play.firebaseapp.com",
  projectId: "baby-care-play",
  storageBucket: "baby-care-play.firebasestorage.app",
  messagingSenderId: "371571774174",
  appId: "1:371571774174:web:0fa693257bcd75f25fe84f",
  measurementId: "G-5D2FZYEP7C"
};

export const app = initializeApp(firebaseConfig);

// Analytics only works on http(s) pages; skip quietly when opened as a local file.
isSupported().then(ok => {
  if (!ok) return;
  const analytics = getAnalytics(app);
  window.trackEvent = (name, params) => { try { logEvent(analytics, name, params); } catch (e) {} };
}).catch(() => {});
