// Firebase configuration for production
// TODO: Replace with your actual Firebase project credentials
// IMPORTANT: Use environment variables or secure config service in production
// Never commit actual production credentials to source control
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_PROD_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project-prod.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-prod",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project-prod.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID",
  vapidKey: process.env.FIREBASE_VAPID_KEY // For FCM notifications
};

export const environment = 'production';
