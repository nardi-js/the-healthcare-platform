"use client";

import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore";

export const recordQuestionView = async (questionId, userId) => {
  try {
    const questionRef = doc(db, "questions", questionId);
    
    const updateData = {
      views: increment(1),
      lastViewed: serverTimestamp(),
    };

    // If there's a user logged in, track unique views
    if (userId) {
      updateData.uniqueViewers = arrayUnion(userId);
      updateData[`viewHistory.${userId}`] = serverTimestamp();
    }

    await updateDoc(questionRef, updateData);
  } catch (error) {
    console.error("Error recording question view:", error);
  }
};
