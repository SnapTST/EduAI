
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// For more information, visit: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyBsKggq05-IlxikteRlYMMGRcMVoj0iDu0",
  authDomain: "eduai-scholar.firebaseapp.com",
  projectId: "eduai-scholar",
  storageBucket: "eduai-scholar.firebasestorage.app",
  messagingSenderId: "606202680678",
  appId: "1:606202680678:web:c02ae1b134e7523fe164a7",
  measurementId: "G-YNKSJ3K7KE"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
