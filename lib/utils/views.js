"use client";

import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore";

const recordView = async (type, id, userId) => {
  try {
    const ref = doc(db, type, id);
    const updateData = {
      views: increment(1),
      lastViewed: serverTimestamp(),
    };

    // If there's a user logged in, track unique views
    if (userId) {
      updateData.uniqueViewers = arrayUnion(userId);
      updateData[`viewHistory.${userId}`] = serverTimestamp();
    }

    await updateDoc(ref, updateData);
  } catch (error) {
    console.error(`Error recording ${type} view:`, error);
  }
};

export const recordPostView = (postId, userId) => recordView('posts', postId, userId);
export const recordQuestionView = (questionId, userId) => recordView('questions', questionId, userId);
