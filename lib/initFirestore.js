"use client";

import { db } from './firebase';
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
const initializeCollection = async (collectionName, sampleData) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
      console.log(`Initializing ${collectionName} collection...`);
      const batch = writeBatch(db);

      sampleData.forEach((item) => {
        const docRef = doc(collectionRef);
        batch.set(docRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`${collectionName} collection initialized successfully`);
    } else {
      console.log(`${collectionName} collection already exists`);
    }
  } catch (error) {
    console.error(`Error initializing ${collectionName} collection:`, error);
  }
};

// Sample data for each collection
const sampleData = {
  posts: [
    {
      title: "Welcome to the Healthcare Platform",
      content: "This is a sample post to demonstrate the platform's features.",
      authorId: "system",
      authorName: "System",
      authorAvatar: "/default-avatar.png",
      upvotes: 0,
      downvotes: 0,
      tags: ["welcome", "general"],
      category: "Announcements"
    }
  ],
  questions: [
    {
      title: "How do I get started with the Healthcare Platform?",
      details: "I'm new to the platform and would like to understand its features.",
      author: {
        uid: "system",
        displayName: "System",
        photoURL: "/default-avatar.png"
      },
      upvotes: 0,
      downvotes: 0,
      tags: ["getting-started", "help"],
      category: "Support",
      status: "open",
      answers: [],
      views: 0
    }
  ],
  users: [
    {
      uid: "system",
      displayName: "System",
      email: "system@healthcareplatform.com",
      photoURL: "/default-avatar.png",
      role: "system",
      createdAt: new Date().toISOString()
    }
  ]
};

// Main initialization function
export const initializeFirestore = async () => {
  try {
    console.log('Starting Firestore initialization...');

    // Initialize each collection
    await Promise.all([
      initializeCollection(COLLECTIONS.POSTS, sampleData.posts),
      initializeCollection(COLLECTIONS.QUESTIONS, sampleData.questions),
      initializeCollection(COLLECTIONS.USERS, sampleData.users)
    ]);

    console.log('Firestore initialization completed successfully');
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
  }
};
