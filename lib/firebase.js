// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYfkefL3Ck514rHWfA7uhpaeVynUVV8b8",
  authDomain: "testing-ebde6.firebaseapp.com",
  projectId: "testing-ebde6",
  storageBucket: "testing-ebde6.firebasestorage.app",
  messagingSenderId: "669939440557",
  appId: "1:669939440557:web:cfadbeb6db875ae16d9f24",
  measurementId: "G-ZVZ02V4T39"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)