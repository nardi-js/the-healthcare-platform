"use client";

import React, { useState } from "react";
import '@/public/styles/Post.css'; // Importing styles for Post

import { FaFileAlt, FaPlayCircle, FaExpand } from "react-icons/fa";

import VoteSystem from "./VoteSystem";
import CommentSystem from "./CommentSystem";
import ShareSystem from "./ShareSystem";

const Post = ({
  id,
  author,
  timestamp,
  content,
  media = [],
  tags = [],
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialComments = [],
}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

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
            <div className="absolute top-2 right-2 bg-black  bg-opacity-50 text-black p-1 rounded">
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

  const MediaPreviewModal = () => {
    if (!selectedMedia) return null;

    return (
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
    );
  };

  const postUrl = `https://yourplatform.com/posts/${id}`;

  return (
    <div className="post bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6 transition-transform hover:shadow-lg">
      <div className="post-header flex items-center mb-4">
        <img
          src={author.avatar}
          alt={author.name}
          className="author-image rounded-full mr-4 w-12 h-12"
        />
        <div className="author-info">
          <h3 className="author-name font-bold">{author.name}</h3>
          <p className="post-date text-white text-sm">
            {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="post-content mb-4">
        <p className="text-white leading-relaxed">{content}</p>

        {tags.length > 0 && (
          <div className="tags flex flex-wrap mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mr-2 mb-2 cursor-pointer hover:bg-blue-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {media.length > 0 && (
        <div
          className={`media-gallery grid ${
            media.length === 1
              ? "grid-cols-1"
              : media.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          } gap-4 mb-4`}
        >
          {media.map((mediaItem, index) => (
            <div key={index} className="media-wrapper">
              {renderMediaContent(mediaItem)}
            </div>
          ))}
        </div>
      )}

      <div className="post-interactions flex justify-between items-center border-t pt-4">
        <VoteSystem
          postId={id}
          initialUpvotes={initialUpvotes}
          initialDownvotes={initialDownvotes}
        />

        <div className="flex items-center space-x-4">
          <ShareSystem url={postUrl} title={`Post by ${author.name}`} />
        </div>
      </div>

      <div className="comments-section mt-4">
        <CommentSystem postId={id} initialComments={initialComments} />
      </div>

      <MediaPreviewModal />
    </div>
  );
};

export default Post;
