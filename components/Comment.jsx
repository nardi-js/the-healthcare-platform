"use client";

import { formatDistanceToNow } from 'date-fns';
import Username from './Username';
import { FaHeart } from 'react-icons/fa';

export default function Comment({ comment }) {
  const {
    content,
    userId,
    username,
    createdAt,
    likes
  } = comment;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-2">
      <div className="flex items-center space-x-2 mb-2">
        <Username userId={userId} username={username} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-2">
        {content}
      </p>

      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
        <FaHeart className="w-4 h-4" />
        <span>{likes || 0}</span>
      </div>
    </div>
  );
}
