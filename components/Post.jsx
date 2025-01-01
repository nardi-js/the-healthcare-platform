"use client";

import React, { useState } from 'react';
import { FaFileAlt, FaPlayCircle, FaExpand } from 'react-icons/fa';
import VoteSystem from './VoteSystem';
import CommentSystem from './CommentSystem';
import ShareSystem from './ShareSystem';

const Post = ({ 
  id, 
  author, 
  timestamp, 
  content, 
  media = [], 
  tags = [],
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialComments = []
}) => {
  // State for media preview
  const [selectedMedia, setSelectedMedia] = useState(null);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex items-center mb-4">
        <img src={''} alt={`${''}'s avatar`} className="w-10 h-10 rounded-full mr-4" />
        <div>
          <h2 className="text-lg font-semibold">{''}</h2>
          <p className="text-gray-500 text-sm">{new Date(timestamp).toLocaleString()}</p>
        </div>
      </div>
      <div className="mb-4">
        <p>{content}</p>
        {media.length > 0 && (
          <div className="flex flex-wrap -mx-2">
            {media.map((item, index) => (
              <div key={index} className="w-1/3 px-2 mb-4" onClick={() => setSelectedMedia(item)}>
                {item.type === 'image' && <img src={item.url} alt="media" className="w-full h-auto rounded-lg" />}
                {item.type === 'video' && <FaPlayCircle className="text-4xl text-gray-500" />}
                {item.type === 'file' && <FaFileAlt className="text-4xl text-gray-500" />}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <VoteSystem id={id} initialUpvotes={initialUpvotes} initialDownvotes={initialDownvotes} />
        <CommentSystem id={id} initialComments={initialComments} />
        <ShareSystem id={id} />
      </div>
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" onClick={() => setSelectedMedia(null)}>
          <div className="bg-white p-4 rounded-lg">
            {selectedMedia.type === 'image' && <img src={selectedMedia.url} alt="media" className="w-full h-auto" />}
            {selectedMedia.type === 'video' && <video src={selectedMedia.url} controls className="w-full h-auto" />}
            {selectedMedia.type === 'file' && <FaFileAlt className="text-4xl text-gray-500" />}
            <FaExpand className="text-2xl text-gray-500 cursor-pointer mt-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;