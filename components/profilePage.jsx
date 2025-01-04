"use client"; // Mark this component as a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle"; // Import ThemeToggle component
import { useAuth } from "../context/useAuth"; // Import useAuth hook
import { db } from "@/lib/firebase"; // Import Firestore
import { collection, getDocs, query, where } from "firebase/firestore";

const ProfilePage = () => {
  const  user  = useAuth(); // Get the current user from the custom hook
  //const { user } = useAuth(); <= This is the original code, but it doesn't work
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [profilePicture, setProfilePicture] = useState(user?.photoURL || "https://via.placeholder.com/150");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchPostsAndQuestions = async () => {
        try {
          const postsQuery = query(
            collection(db, "posts"),
            where("author.id", "==", user.uid)
          );
          const postsSnapshot = await getDocs(postsQuery);
          const postsData = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postsData);

          const questionsQuery = query(
            collection(db, "questions"),
            where("author.id", "==", user.uid)
          );
          const questionsSnapshot = await getDocs(questionsQuery);
          const questionsData = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(questionsData);

          setLoading(false);
        } catch (error) {
          console.error("Error fetching posts and questions:", error);
          setLoading(false);
        }
      };

      fetchPostsAndQuestions();
    }
  }, [user]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  if (loading) {
    return <div>Loading posts and questions...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <ThemeToggle /> {/* Add ThemeToggle component */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <img src={profilePicture} alt="Profile" className="w-20 h-20 rounded-full mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.displayName}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="mt-2" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Stats</h3>
          <p className="text-gray-600 dark:text-gray-400">Posts: {posts.length}</p>
          <p className="text-gray-600 dark:text-gray-400">Questions: {questions.length}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Posts</h3>
          {posts.length > 0 ? (
            <ul className="space-y-4">
              {posts.map((post, index) => (
                <li key={index} className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{post.title}</h4>
                  <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">You have not made any posts yet.</p>
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