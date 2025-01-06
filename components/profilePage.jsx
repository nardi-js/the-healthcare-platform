"use client"; // Mark this component as a client component

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle"; // Import ThemeToggle component
import { useAuth } from "@/context/useAuth"; // Import useAuth hook
import { db } from "@/lib/firebase"; // Import Firestore
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { storage } from "@/lib/firebase";
import toast from "react-hot-toast"; // Import toast

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    basic: null,
    extended: null,
    stats: {
      totalPosts: 0,
      totalQuestions: 0,
    },
  });
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
      return;
    }
  }, [user, authLoading, router]);

  // Fetch user activity data
  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Add retry logic for index propagation
        const fetchWithRetry = async (query, maxRetries = 3, delay = 2000) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              return await getDocs(query);
            } catch (err) {
              if (err.message.includes("requires an index") && i < maxRetries - 1) {
                console.log(`Retry ${i + 1}/${maxRetries} - Waiting for index propagation...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
              throw err;
            }
          }
        };

        // Create queries
        const postsQuery = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const questionsQuery = query(
          collection(db, "questions"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        console.log("Fetching data for user:", user.uid);
        
        // Fetch data with retry logic
        const [postsSnapshot, questionsSnapshot] = await Promise.all([
          fetchWithRetry(postsQuery),
          fetchWithRetry(questionsQuery)
        ]);

        console.log("Posts found:", postsSnapshot.size);
        console.log("Questions found:", questionsSnapshot.size);

        // Handle empty states and create test data if needed
        if (postsSnapshot.empty) {
          console.log("Creating test post...");
          const testPost = {
            title: "My First Healthcare Post",
            content: "Welcome to my healthcare journey! This is my first post on the platform.",
            authorId: user.uid,
            authorName: user.displayName || "Anonymous",
            authorAvatar: user.photoURL || "/default-avatar.png",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            upvotes: 0,
            downvotes: 0,
            tags: ["introduction", "healthcare"],
            category: "General"
          };

          const newPostRef = await addDoc(collection(db, "posts"), testPost);
          console.log("Test post created:", newPostRef.id);
          
          // Fetch updated posts
          const updatedPostsSnapshot = await fetchWithRetry(postsQuery);
          setPosts(
            updatedPostsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
          );
        } else {
          setPosts(
            postsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
          );
        }

        // Handle questions similarly
        if (questionsSnapshot.empty) {
          console.log("Creating test question...");
          const testQuestion = {
            title: "My First Healthcare Question",
            details: "I'm new to the platform and would like to understand its features better. Can someone help?",
            authorId: user.uid,
            author: {
              uid: user.uid,
              displayName: user.displayName || "Anonymous",
              photoURL: user.photoURL || "/default-avatar.png"
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            upvotes: 0,
            downvotes: 0,
            tags: ["getting-started", "help"],
            category: "Support",
            status: "open",
            answers: [],
            views: 0
          };

          const newQuestionRef = await addDoc(collection(db, "questions"), testQuestion);
          console.log("Test question created:", newQuestionRef.id);
          
          // Fetch updated questions
          const updatedQuestionsSnapshot = await fetchWithRetry(questionsQuery);
          setQuestions(
            updatedQuestionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
          );
        } else {
          setQuestions(
            questionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
          );
        }

        // Update stats
        setProfileData(prev => ({
          ...prev,
          stats: {
            totalPosts: postsSnapshot.size,
            totalQuestions: questionsSnapshot.size,
          },
        }));

        setLoading(false);
      } catch (err) {
        console.error("Error in fetchUserActivity:", err);
        setError(err.message);
        
        // More specific error messages
        if (err.message.includes("requires an index")) {
          toast.error("Database is still initializing. Please wait a moment and try again.", 
            { duration: 5000 });
        } else if (err.message.includes("permission-denied")) {
          toast.error("You don't have permission to access this data. Please sign in again.");
        } else {
          toast.error("Failed to load your activity. Please refresh the page.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserActivity();
    }
  }, [user]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);

      // Update Firestore profile
      await setDoc(
        doc(db, "userProfiles", user.uid),
        {
          ...profileData.extended,
          ...updatedData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        extended: {
          ...prev.extended,
          ...updatedData,
        },
      }));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile
      await updateProfile(user, {
        photoURL: downloadURL,
      });

      setProfileData((prev) => ({
        ...prev,
        basic: {
          ...prev.basic,
          photoURL: downloadURL,
        },
      }));
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError("Failed to update profile picture. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <img
              src={profileData.basic?.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
            />
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 bg-purple-500 text-white p-1 rounded-full cursor-pointer hover:bg-purple-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profileData.basic?.displayName || "Anonymous User"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {profileData.basic?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Posts
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {profileData.stats.totalPosts}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Questions
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {profileData.stats.totalQuestions}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Recent Posts
            </h3>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"
                  ></div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Recent Questions
            </h3>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"
                  ></div>
                ))}
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {question.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No questions yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
