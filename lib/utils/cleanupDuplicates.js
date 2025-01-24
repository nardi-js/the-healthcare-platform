"use client";

import { db } from "../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

export const cleanupDuplicateQuestions = async () => {
  try {
    // Get all questions ordered by creation time
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const seenTitles = new Set();
    const duplicates = [];

    querySnapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const title = data.title;

      if (seenTitles.has(title)) {
        // This is a duplicate
        duplicates.push(docSnapshot.id);
      } else {
        seenTitles.add(title);
      }
    });

    // Delete duplicates
    for (const docId of duplicates) {
      await deleteDoc(doc(db, "questions", docId));
    }

    console.log(`Cleaned up ${duplicates.length} duplicate questions`);
    return duplicates.length;
  } catch (error) {
    console.error("Error cleaning up duplicates:", error);
    throw error;
  }
};
