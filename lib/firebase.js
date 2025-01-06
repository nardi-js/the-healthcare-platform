// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCekLve1gYpH2nL6hhoCtuh6jCqiQ4SU5c",
  authDomain: "thehealthplatform-df586.firebaseapp.com",
  databaseURL: "https://thehealthplatform-df586-default-rtdb.firebaseio.com",
  projectId: "thehealthplatform-df586",
  storageBucket: "thehealthplatform-df586.firebasestorage.app",
  messagingSenderId: "216643613532",
  appId: "1:216643613532:web:eb8fb27eb6c49a4ac6c799",
  measurementId: "G-Y7NG3N7L8B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, app, storage };
