// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVBkWe3A7AwJdk_J6yx7sBhOgu4nWg9Ik",
  authDomain: "scrbrd-beta-2.firebaseapp.com",
  projectId: "scrbrd-beta-2",
  storageBucket: "scrbrd-beta-2.appspot.com", // Corrected common typo: firebasestorage.app -> .appspot.com
  messagingSenderId: "489561247753",
  appId: "1:489561247753:web:a09285d3776fde63f028d8",
  measurementId: "G-28ETF9TDYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Analytics if supported
export let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
