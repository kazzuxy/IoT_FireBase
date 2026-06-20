import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyCPpajVgBqbmjujZiib_rCUoZIlUpGmw3Q",
  authDomain: "iot-firebase-relay.firebaseapp.com",
  databaseURL: "https://iot-firebase-relay-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-firebase-relay",
  storageBucket: "iot-firebase-relay.firebasestorage.app",
  messagingSenderId: "109010108992",
  appId: "1:109010108992:web:2d5187cddd351b3d1815a5"
};

// Check if credentials are saved in localStorage
export const getActiveConfig = () => {
  try {
    const saved = localStorage.getItem('firebase_iot_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.apiKey !== "ISI_API_KEY") {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return firebaseConfig;
};

const activeConfig = getActiveConfig();

let app: any = null;
let auth: any = null;
let db: any = null;

const isValidConfig = activeConfig.apiKey && activeConfig.apiKey !== "ISI_API_KEY";

if (isValidConfig) {
  try {
    app = initializeApp(activeConfig);
    auth = getAuth(app);
    db = getDatabase(app);
  } catch (err) {
    console.error("Firebase SDK init error:", err);
  }
}

export { app, auth, db };
