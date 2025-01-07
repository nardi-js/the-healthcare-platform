"use client";

import Link from "next/link";
import { FaEye, FaThumbsUp, FaComment } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
            {post.authorName?.[0] || "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {post.authorName}
              {post.authorIsTrusted && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Trusted
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {post.createdAt ? formatDistanceToNow(post.createdAt, { addSuffix: true }) : ""}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.content}
        </p>

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
            <span>{post.likes || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaComment className="w-4 h-4" />
            <span>{post.comments || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
