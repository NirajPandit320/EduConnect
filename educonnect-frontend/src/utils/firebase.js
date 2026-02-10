// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase Authentication
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlONVLOdJXCH3yo0JH31JS6uANH-jdNZA",
  authDomain: "educonnect-b8931.firebaseapp.com",
  projectId: "educonnect-b8931",
  storageBucket: "educonnect-b8931.appspot.com",
  messagingSenderId: "198568737921",
  appId: "1:198568737921:web:424f663f4c07ca456ea180",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// 🔴 THIS LINE IS CRITICAL
export { auth };
