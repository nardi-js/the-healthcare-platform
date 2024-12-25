// components/Post.jsx
import Image from 'next/image';
import React from 'react';
import { posts } from '@/constant/post';

const Post = () => {
  return (
   <div>
   {posts.map(({ title, content, author, authorImage, postDate }) => (
    <div className="border rounded-lg p-4 shadow-md mb-4">
      <div className="flex items-center mb-2">
        <img src={authorImage} alt={author} className="w-10 h-10 rounded-full mr-2" />
        <div>
          <span className="font-bold">{author}</span>
          <span className="text-gray-500 text-sm ml-2">{postDate}</span>
        </div>
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-700">{content}</p>
      <div className="flex justify-between mt-2">
        <button className="text-blue-500">Like</button>
        <button className="text-blue-500">Comment</button>
        <button className="text-blue-500">Share</button>
      </div>
    </div>
   ))};
   </div>
  );
};

export default Post;