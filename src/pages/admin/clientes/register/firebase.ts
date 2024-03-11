// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { env } from '../../../../config/env';

const firebaseConfig = {
  apiKey: env.VITE_APP_FIREBASE_APIKEY,
  authDomain: env.VITE_APP_FIREBASE_AUTHDOMAIN,
  projectId: env.VITE_APP_FIREBASE_PROJECTID,
  storageBucket: env.VITE_APP_FIREBASE_STORAGEBUCKET,

  messagingSenderId: env.VITE_APP_FIREBASE_MESSAGINGSENDERID,
  appId: env.VITE_APP_FIREBASE_APPID,
  measurementId: env.VITE_APP_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);
