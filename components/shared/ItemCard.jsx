"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { FaEye, FaComment, FaTags, FaUser, FaThumbsUp } from "react-icons/fa";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Username } from "@/components/shared";

const ItemCard = ({
  item,
  type, // 'question' or 'post'
  onClick,
}) => {
  const [itemData, setItemData] = useState({
    views: item.views || 0,
    upvotes: 0,
    commentCount: 0,
  });

  useEffect(() => {
    const collectionName = type + "s"; // 'questions' or 'posts'
    const itemRef = doc(db, collectionName, item.id);

    // Listen for item updates (including views and votes)
    const unsubscribeItem = onSnapshot(itemRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setItemData((prev) => ({
          ...prev,
          views: data.views || 0,
          // Get likes count directly
          upvotes: typeof data.likes === "number" ? data.likes : 0,
        }));
      }
    });

    // Listen for comments count
    const commentsRef = collection(db, collectionName, item.id, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setItemData((prev) => ({
        ...prev,
        commentCount: snapshot.size,
      }));
    });

    return () => {
      unsubscribeItem();
      unsubscribeComments();
    };
  }, [item.id, type]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
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
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
    >
      {/* Author Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
          {item.author?.photoURL || item.author?.avatar ? (
            <Image
              src={item.author.photoURL || item.author.avatar}
              alt={`Profile picture of ${
                item.author?.name || item.author?.email || "user"
              }`}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-200 dark:bg-purple-800">
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {(
                  item.author?.name?.[0] ||
                  item.author?.email?.[0] ||
                  "?"
                ).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <Username
              userId={item.author?.id}
              username={item.author?.name || "Anonymous"}
            />
            {item.author?.isTrusted && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Trusted
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(item.createdAt)}
          </p>
        </div>
      </div>

      {/* Content */}
      {type === "question" ? (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {item.title}
        </h3>
      ) : (
        <div className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {item.content}
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Categories - Only for questions */}
      {type === "question" && item.category && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(item.category) ? (
            item.category.map((cat, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white font-medium"
              >
                {cat}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white font-medium">
              {item.category}
            </span>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <FaEye className="w-4 h-4" />
          <span>{itemData.views}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaThumbsUp className="w-4 h-4" />
          <span>{itemData.upvotes}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaComment className="w-4 h-4" />
          <span>{itemData.commentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
