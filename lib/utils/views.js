"use client";

import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
} from "firebase/firestore";

const recordView = async (type, id, userId) => {
  const maxRetries = 3;
  let retryCount = 0;

  const tryUpdate = async () => {
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
      return true;
    } catch (error) {
      console.error(
        `Error recording ${type} view (attempt ${retryCount + 1}):`,
        error
      );
      return false;
    }
  };

  while (retryCount < maxRetries) {
    const success = await tryUpdate();
    if (success) return;
    retryCount++;
    if (retryCount < maxRetries) {
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }

  console.error(`Failed to record ${type} view after ${maxRetries} attempts`);
};

export const recordPostView = (postId, userId) =>
  recordView("posts", postId, userId);
export const recordQuestionView = (questionId, userId) =>
  recordView("questions", questionId, userId);
