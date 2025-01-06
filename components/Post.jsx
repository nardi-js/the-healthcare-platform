"use client";

import React, { useState } from "react";
import '@/public/styles/Post.css'; // Importing styles for Post
import { useAuth } from "@/context/useAuth";
import { FaFileAlt, FaPlayCircle, FaExpand } from "react-icons/fa";

import VoteSystem from "./VoteSystem";
import CommentSystem from "./CommentSystem";
import ShareSystem from "./ShareSystem";

const Post = ({
  id,
  author,
  title,
  timestamp,
  content,
  media = [],
  tags = [],
  category,
  status = 'published',
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialComments = [],
  isProfileView = false, // New prop to handle profile view
  onEdit, // New prop for editing
  onDelete, // New prop for deleting
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

  const postUrl = `https://yourplatform.com/posts/${id}`;

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
              {author.name}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        {isProfileView && (
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

      {/* Post Title */}
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        {title}
      </h2>

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
        {category && (
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
            {category}
          </span>
        )}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Status Badge (if in profile view) */}
      {isProfileView && (
        <div className="mb-4">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}

      {/* Interaction Components */}
      {!isProfileView && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <VoteSystem
            postId={id}
            userId={user?.uid}
            initialUpvotes={initialUpvotes}
            initialDownvotes={initialDownvotes}
          />
          <CommentSystem postId={id} initialComments={initialComments} />
          <ShareSystem url={postUrl} />
        </div>
      )}

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
