"use client";

import React, { useState } from "react";
import '@/public/styles/Post.css'; // Importing styles for Post
import { useAuth } from "@/context/useAuth";
import { FaFileAlt, FaPlayCircle, FaExpand } from "react-icons/fa";
import Link from 'next/link';

import VoteSystem from "./VoteSystem";
import CommentSystem from "./common/CommentSystem";
import ShareSystem from "./ShareSystem";

const Post = ({
  id,
  author,
  content,
  media = [],
  tags = [],
  likes = 0,
  views = 0,
  commentCount = 0,
  createdAt,
  isProfileView = false,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showFullContent, setShowFullContent] = useState(!isProfileView);

  const renderMediaContent = (mediaItem) => {
    switch (mediaItem.type) {
      case "image":
        return (
          <div
            className="media-item relative cursor-pointer"
            onClick={() => setSelectedMedia(mediaItem)}
          >
            <img
              src={mediaItem.url}
              alt="Post media"
              className="w-full h-64 object-cover rounded-lg transition-transform hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
              <FaExpand />
            </div>
          </div>
        );
      case "video":
        return (
          <div className="media-item relative">
            <video
              src={mediaItem.url}
              controls
              className="w-full h-64 object-cover rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
              <FaPlayCircle />
            </div>
          </div>
        );
      case "file":
        return (
          <a
            href={mediaItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-item flex items-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FaFileAlt className="mr-2" />
            <span>{mediaItem.name}</span>
          </a>
        );
      default:
        return null;
    }
  };

  const truncateContent = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className={`post-container bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${isProfileView ? 'border-l-4 border-purple-500' : ''}`}>
      {/* Post Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              <Link href={`/users/${author.id}`}>
                {author.name}
              </Link>
              {author.trustMark && (
                <span className="text-purple-600 text-sm ml-1">✓</span>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(createdAt?.seconds * 1000).toLocaleString()}
            </p>
          </div>
        </div>
        
        {isProfileView && user?.uid === author.id && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(id)}
              className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(id)}
              className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          {isProfileView ? truncateContent(content) : content}
        </p>
        {isProfileView && content.length > 200 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-purple-600 hover:text-purple-700 text-sm mt-2"
          >
            {showFullContent ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Media Content */}
      {media.length > 0 && (
        <div className="media-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {media.map((mediaItem, index) => (
            <div key={index}>{renderMediaContent(mediaItem)}</div>
          ))}
        </div>
      )}

      {/* Tags and Category */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Interaction Bar */}
      <div className="mt-4 flex items-center justify-between border-t pt-4 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <VoteSystem postId={id} />
          <CommentSystem
            postId={id}
            commentCount={commentCount}
          />
        </div>
        <ShareSystem url={`${window.location.origin}/posts/${id}`} />
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center"
          onClick={() => setSelectedMedia(null)}
        >
          {selectedMedia.type === "image" ? (
            <img
              src={selectedMedia.url}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={selectedMedia.url}
              controls
              className="max-w-full max-h-full"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
