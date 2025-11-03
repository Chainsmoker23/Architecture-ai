import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: These values should be set as environment variables.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// --- VALIDATION LOGIC ---
// This map helps create a clear error message if environment variables are missing.
const firebaseEnvMap: { [key in keyof typeof firebaseConfig]: string } = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID"
};

// Check if any of the required Firebase config values are missing.
const missingConfigs = (Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>)
  .filter(key => !firebaseConfig[key]);

if (missingConfigs.length > 0) {
  // If required variables are missing, we throw a detailed error to guide the user.
  // This prevents the app from crashing with a cryptic Firebase error.
  const missingKeysText = missingConfigs.map(key => firebaseEnvMap[key]).join(', ');
  
  throw new Error(
    `Firebase configuration is missing. Please create a .env file and set: ${missingKeysText}. IMPORTANT: For this app, each key must start with the 'VITE_' prefix.`
  );
}

// Check if any of the values are still placeholders.
const placeholderConfigs = (Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>)
  .filter(key => firebaseConfig[key]?.includes('PASTE_YOUR_'));

if (placeholderConfigs.length > 0) {
    const placeholderKeysText = placeholderConfigs.map(key => firebaseEnvMap[key]).join(', ');
    throw new Error(
      `Firebase configuration contains placeholder values. Please replace the placeholders in your .env file with the actual values from your Firebase project. The following keys still have placeholders: ${placeholderKeysText}.`
    );
}

// --- NEW VALIDATION: Check for common copy-paste errors ---
// Check if it looks like the user pasted a JS object instead of using KEY=VALUE format.
const anyValueLooksLikeJS = (Object.values(firebaseConfig) as (string | undefined)[])
    .some(val => val && (val.includes('const ') || val.includes('{') || val.includes(':')));

if (anyValueLooksLikeJS) {
    throw new Error(
      `Firebase configuration appears to be incorrect. It looks like you may have pasted a JavaScript object into your .env file. Please ensure your .env file uses the format KEY="VALUE" for each line. For example: VITE_FIREBASE_API_KEY="your-key-here"`
    );
}
// --- END NEW VALIDATION ---


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);