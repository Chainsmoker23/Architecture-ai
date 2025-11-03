import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: These values should be set as environment variables.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// --- VALIDATION LOGIC ---
// This map helps create a clear error message if environment variables are missing.
const firebaseEnvMap: { [key in keyof typeof firebaseConfig]: string } = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
  appId: "FIREBASE_APP_ID"
};

// Check if any of the required Firebase config values are missing.
const missingConfigs = (Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>)
  .filter(key => !firebaseConfig[key]);

if (missingConfigs.length > 0) {
  // If required variables are missing, we throw a detailed error to guide the user.
  // This prevents the app from crashing with a cryptic Firebase error.
  const missingKeysText = missingConfigs.map(key => firebaseEnvMap[key]).join(', ');
  
  throw new Error(
    `Firebase configuration is missing. Please create a .env file in the root directory and set the following environment variables: ${missingKeysText}. You can find these values in your Firebase project settings under "Web app configuration".`
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
// --- END VALIDATION LOGIC ---


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);