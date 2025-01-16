"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEye, FaThumbsUp, FaComment, FaShare, FaUser } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import Username from "./Username";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PostCard({ post: initialPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    // Subscribe to real-time updates for the post
    const unsubscribe = onSnapshot(doc(db, "posts", initialPost.id), (doc) => {
      if (doc.exists()) {
        setPost({
          ...initialPost,
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || initialPost.createdAt
        });
      }
    });

    return () => unsubscribe();
  }, [initialPost.id]);

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <div 
      onClick={handlePostClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
    >
      {/* Author Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
          {post.author?.photoURL ? (
            <Image
              src={post.author.photoURL}
              alt={post.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <FaUser className="text-purple-600 dark:text-purple-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <Username userId={post.author?.id} username={post.author?.name || "Anonymous"} />
            {post.author?.isTrusted && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Trusted
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {post.content}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <FaEye className="w-4 h-4" />
          <span>{post.views || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaThumbsUp className="w-4 h-4" />
          <span>{post.likes?.length || post.upvotes || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaComment className="w-4 h-4" />
          <span>{post.commentCount || 0}</span>
        </div>
      </div>
    </div>
  );
}
