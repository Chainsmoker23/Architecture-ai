import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration.
// This uses Vite's standard `import.meta.env` to read from your .env file.
const firebaseConfig = {
  // FIX: Cast import.meta to any to resolve TypeScript error about 'env' property.
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

// This validation ensures all required keys are present.
const requiredKeys = Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>;
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  // This error means your .env file is likely not being read correctly.
  // 1. Ensure the file is named `.env` and is in the project root folder.
  // 2. Ensure you have restarted the development server after creating/editing the .env file.
  throw new Error(
    `Firebase configuration is missing required environment variables: ${missingKeys.join(', ')}. Please check your .env file and restart the server.`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);