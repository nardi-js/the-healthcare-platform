"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaComment, FaEye, FaThumbsUp } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/useAuth";

export default function Question({
  id,
  title,
  category,
  author,
  createdAt,
}) {
  const { user } = useAuth();
  const [questionData, setQuestionData] = useState({
    views: 0,
    upvotes: 0,
    commentCount: 0
  });

  // Listen to real-time updates for the question
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "questions", id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setQuestionData({
          views: data.views || 0,
          upvotes: data.likes || 0, // Using 'likes' to match VoteSystem
          commentCount: data.commentCount || 0
        });
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Get first letter of name for avatar
  const avatarLetter = (author?.name || "A")[0].toUpperCase();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header - Author Info and Time */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
          {avatarLetter}
        </div>
        <div className="flex-grow">
          <div className="text-gray-900 dark:text-white font-medium">
            {author?.name || "Anonymous"}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDistanceToNow(createdAt)} ago
          </div>
        </div>
      </div>

      {/* Question Title */}
      <Link href={`/questions/${id}`} className="block mb-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
          {title}
        </h3>
      </Link>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.isArray(category) ? (
          category.map((cat, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white font-medium"
            >
              {cat}
            </span>
          ))
        ) : (
          <span className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white font-medium">
            {category}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <FaEye className="w-4 h-4" />
          <span>{questionData.views}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaThumbsUp className="w-4 h-4" />
          <span>{questionData.upvotes}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaComment className="w-4 h-4" />
          <span>{questionData.commentCount}</span>
        </div>
      </div>
    </div>
  );
}
