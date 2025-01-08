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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get user profile from Firestore
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setProfileData(prev => ({
            ...prev,
            basic: {
              displayName: userData.displayName || user.displayName || "Anonymous",
              email: userData.email || user.email,
              photoURL: userData.photoURL || user.photoURL || "/download.png",
              createdAt: userData.createdAt?.toDate() || new Date(),
            }
          }));
        } else {
          // Initialize profile if it doesn't exist
          const newUserData = {
            displayName: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || "/download.png",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDoc, newUserData);
          setProfileData(prev => ({
            ...prev,
            basic: {
              ...newUserData,
              createdAt: new Date(),
            }
          }));
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

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

        // Set posts
        setPosts(
          postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))
        );

        // Set questions
        setQuestions(
          questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))
        );

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

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    switch (activeTab) {
      case "posts":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <Link href={`/post/${post.id}`} key={post.id}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>• {post.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {posts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No posts yet
              </div>
            )}
          </div>
        );

      case "questions":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {questions.map((question) => (
                <Link href={`/question/${question.id}`} key={question.id}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {question.title}
                    </h3>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        <span>• {question.views || 0} views</span>
                        <span>• {question.answers?.length || 0} answers</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No questions yet
              </div>
            )}
          </div>
        );

      default:
        return null;
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

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {profileData.stats.totalPosts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Posts</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {profileData.stats.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Questions</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Info
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                Member since: {new Date(profileData.basic?.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Email: {profileData.basic?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Posts
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                posts.slice(0, 3).map((post) => (
                  <Link href={`/post/${post.id}`} key={post.id}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                        {post.content}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{post.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No posts yet
                </p>
              )}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Questions
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
              ) : questions.length > 0 ? (
                questions.slice(0, 3).map((question) => (
                  <Link href={`/question/${question.id}`} key={question.id}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {question.title}
                      </h4>
                      <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{question.views || 0} views</span>
                        <span className="mx-2">•</span>
                        <span>{question.answers?.length || 0} answers</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No questions yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
