"use client";

import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore";

export const recordPostView = async (postId, userId) => {
  try {
    const postRef = doc(db, "posts", postId);
    
    const updateData = {
      views: increment(1),
      lastViewed: serverTimestamp(),
    };

    // If there's a user logged in, track unique views
    if (userId) {
      updateData.uniqueViewers = arrayUnion(userId);
      updateData[`viewHistory.${userId}`] = serverTimestamp();
    }

    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error("Error recording post view:", error);
  }
};
