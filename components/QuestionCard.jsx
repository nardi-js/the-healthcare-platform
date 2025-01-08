"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FaEye, FaComment, FaTags, FaUser } from "react-icons/fa";
import Image from "next/image";

const QuestionCard = ({ question }) => {
  const {
    id,
    title,
    author,
    createdAt,
    tags = [],
    views = 0,
    answers = [],
    category,
  } = question;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <Link href={`/question/${id}`} className="block p-6">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative w-8 h-8">
            <Image
              src={author?.photoURL || "/download.png"}
              alt={author?.name || "Anonymous"}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {author?.name || "Anonymous"}
              {author?.isTrusted && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Trusted
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
              {title}
            </h3>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  {tag}
                </span>
              ))}
              {category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {category}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 ml-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <FaEye className="w-4 h-4" />
              <span>{views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaComment className="w-4 h-4" />
              <span>{answers?.length || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuestionCard;
