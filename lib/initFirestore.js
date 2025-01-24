"use client";

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Collections we need
const COLLECTIONS = {
  POSTS: 'posts',
  QUESTIONS: 'questions',
  VOTES: 'votes',
  COMMENTS: 'comments',
  USERS: 'users'
};

// Initialize a collection with sample data if it's empty
const initializeCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
      console.log(`${collectionName} collection is empty`);
    } else {
      console.log(`${collectionName} collection already exists`);
    }
  } catch (error) {
    console.error(`Error checking ${collectionName} collection:`, error);
  }
};

// Main initialization function
export const initializeFirestore = async () => {
  try {
    console.log('Starting Firestore initialization...');

    // Initialize each collection
    await Promise.all([
      initializeCollection(COLLECTIONS.POSTS),
      initializeCollection(COLLECTIONS.QUESTIONS),
      initializeCollection(COLLECTIONS.USERS)
    ]);

    console.log('Firestore initialization completed successfully');
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
  }
};
