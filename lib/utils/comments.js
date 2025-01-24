import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export const fetchComments = async (postId, sortBy = "newest", limitCount = 20) => {
  try {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy(sortBy === "mostLiked" ? "likes" : "timestamp", sortBy === "oldest" ? "asc" : "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

export const addComment = async (postId, userId, content, parentCommentId = null) => {
  try {
    const commentData = {
      postId,
      content: content.trim(),
      author: {
        id: userId,
        name: "User", // You should get this from your user profile
        avatar: "/default-avatar.png", // You should get this from your user profile
      },
      parentCommentId,
      timestamp: serverTimestamp(),
      likes: 0,
      likedBy: [],
      edited: false,
    };

    const docRef = await addDoc(collection(db, "comments"), commentData);
    return {
      id: docRef.id,
      ...commentData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
};

export const updateComment = async (commentId, content) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      content,
      edited: true,
      lastEditedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Failed to update comment");
  }
};

export const deleteComment = async (commentId) => {
  try {
    await deleteDoc(doc(db, "comments", commentId));
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }
};

export const likeComment = async (commentId, userId, currentLikes, likedBy) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    const hasLiked = likedBy.includes(userId);

    await updateDoc(commentRef, {
      likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
      likedBy: hasLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId],
    });
  } catch (error) {
    console.error("Error updating like:", error);
    throw new Error("Failed to update like");
  }
};

export const reportComment = async (commentId, userId, reason, details = "") => {
  try {
    await addDoc(collection(db, "reports"), {
      commentId,
      reportedBy: userId,
      reason,
      details,
      timestamp: serverTimestamp(),
      status: "pending",
    });
  } catch (error) {
    console.error("Error reporting comment:", error);
    throw new Error("Failed to report comment");
  }
};
