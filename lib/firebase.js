// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
<<<<<<< HEAD
=======
import { getStorage } from "firebase/storage";
>>>>>>> main

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
<<<<<<< HEAD
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
=======
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

// Initialize Storage with CORS settings
const storage = getStorage(app);

export { db, auth, app, storage };
>>>>>>> main
