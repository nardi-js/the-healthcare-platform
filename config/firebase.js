// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDC5qvw8-DayvIDOYCtSyICYVcj2A8sXmM",
  authDomain: "the-healthcare-palatform.firebaseapp.com",
  projectId: "the-healthcare-palatform",
  storageBucket: "the-healthcare-palatform.firebasestorage.app",
  messagingSenderId: "208172488041",
  appId: "1:208172488041:web:68ce6fdddc1a06d99d19f8",
  measurementId: "G-HV7SLEY9Z2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const atuh = getAuth(app)