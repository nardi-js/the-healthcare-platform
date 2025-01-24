"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FaEye, FaComment, FaTags, FaUser, FaThumbsUp } from "react-icons/fa";
import Image from "next/image";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Username } from '@/components/shared';

const QuestionCard = ({ question, variant = "default" }) => {
  const {
    id,
    title,
    author,
    createdAt,
    tags = [],
    category,
  } = question;

  const [questionData, setQuestionData] = useState({
    views: question.views || 0,
    upvotes: Array.isArray(question.likes) ? question.likes.length : 0,
    commentCount: question.commentCount || 0
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "questions", id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setQuestionData({
          views: data.views || 0,
          upvotes: Array.isArray(data.likes) ? data.likes.length : 0,
          commentCount: data.commentCount || 0
        });
      }
    });

    return () => unsubscribe();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    
    // Handle Firestore Timestamp
    const date = timestamp?.toDate?.() || new Date(timestamp);
    
    if (!(date instanceof Date) || isNaN(date)) {
      return "Invalid date";
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const renderStats = () => (
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
  );

  const renderCategories = () => (
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
      ) : category && (
        <span className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white font-medium">
          {category}
        </span>
      )}
      {tags?.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-400"
        >
          {tag}
        </span>
      ))}
    </div>
  );

  if (variant === "simple") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
            {author?.photoURL ? (
              <Image
                src={author.photoURL}
                alt={`Profile picture of ${author?.name || author?.email || 'user'}`}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-200 dark:bg-purple-800">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {(author?.name?.[0] || author?.email?.[0] || '?').toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="text-gray-900 dark:text-white font-medium">
              <Username userId={author?.id} username={author?.name} />
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {formatDate(createdAt)}
            </div>
          </div>
        </div>

        <Link href={`/questions/${id}`} className="block mb-3 group">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 break-words line-clamp-2">
            {title}
          </h3>
        </Link>

        {renderCategories()}
        {renderStats()}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <Link href={`/questions/${id}`} className="block p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
            {author?.photoURL ? (
              <Image
                src={author.photoURL}
                alt={`Profile picture of ${author?.name || author?.email || 'user'}`}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-200 dark:bg-purple-800">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {(author?.name?.[0] || author?.email?.[0] || '?').toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <Username userId={author?.id} username={author?.name || "Anonymous"} />
            <p className="text-xs text-gray-500 dark:text-white">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 break-words line-clamp-2">
              {title}
            </h3>
            
            {renderCategories()}
            {renderStats()}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuestionCard;
