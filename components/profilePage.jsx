"use client"; // Mark this component as a client component

import React, { useState } from 'react';
import Link from 'next/link';

const ProfilePage = () => {
  const [user, setUser] = useState({
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    photoURL: '/default-avatar.png',
  });
  const [posts, setPosts] = useState([
    { title: 'Post 1', content: 'This is the content of post 1.' },
    { title: 'Post 2', content: 'This is the content of post 2.' },
    { title: 'Post 3', content: 'This is the content of post 3.' },
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full mr-4" />
          <div>
            <h2 className="text-2xl font-bold">{user.displayName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Posts</h3>
          {posts.length > 0 ? (
            <ul className="space-y-4">
              {posts.map((post, index) => (
                <li key={index} className="bg-gray-200 p-4 rounded-lg shadow">
                  <h4 className="text-lg font-bold">{post.title}</h4>
                  <p>{post.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">You have not made any posts yet.</p>
          )}
          <Link href="/profile" legacyBehavior>
            <a className="text-blue-500 hover:underline">Go to Profile</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;