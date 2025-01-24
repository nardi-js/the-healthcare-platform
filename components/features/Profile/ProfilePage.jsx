"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';
import { db } from '@/lib/firebase';
import { 
  getDoc, 
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc 
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileActivity from './ProfileActivity';

/**
 * ProfilePage component that manages user profile data and displays user information
 */
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get user document reference
        const userDoc = doc(db, 'users', user.uid);
        
        try {
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            
            // Handle the timestamp, which could be a Firestore timestamp or an ISO string
            let createdAtDate;
            if (userData.createdAt?.toDate) {
              createdAtDate = userData.createdAt.toDate();
            } else if (userData.createdAt) {
              createdAtDate = new Date(userData.createdAt);
            } else {
              createdAtDate = new Date();
            }

            setProfileData(prev => ({
              ...prev,
              basic: {
                displayName: userData.displayName || user.displayName || 'Anonymous',
                email: userData.email || user.email,
                photoURL: userData.photoURL || user.photoURL || '/download.png',
                createdAt: createdAtDate,
              }
            }));
          } else {
            // Create new user profile if it doesn't exist
            const newUserData = {
              displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Anonymous'),
              email: user.email,
              photoURL: user.photoURL || '/download.png',
              createdAt: new Date(),
              updatedAt: new Date(),
              stats: {
                totalPosts: 0,
                totalQuestions: 0,
                totalAnswers: 0,
                totalComments: 0
              }
            };

            try {
              await setDoc(userDoc, newUserData);
              
              setProfileData(prev => ({
                ...prev,
                basic: {
                  ...newUserData,
                  createdAt: new Date(),
                }
              }));
            } catch (createError) {
              console.error('Error creating user profile:', createError);
              toast.error('Failed to create profile. Please try again.');
              throw createError;
            }
          }
        } catch (docError) {
          console.error('Error accessing user document:', docError);
          if (docError.code === 'permission-denied') {
            toast.error('Access denied. Please sign in again.');
            throw docError;
          }
          throw docError;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in profile operation:', err);
        setError(err.message);
        setLoading(false);
        
        if (err.code === 'permission-denied') {
          router.push('/sign-in');
        }
      }
    };

    if (user && !authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const fetchWithRetry = async (query, maxRetries = 3, delay = 2000) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              return await getDocs(query);
            } catch (err) {
              if (err.message.includes('requires an index') && i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
              throw err;
            }
          }
        };

        const [postsSnapshot, questionsSnapshot] = await Promise.all([
          fetchWithRetry(query(
            collection(db, 'posts'),
            where('authorId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          )),
          fetchWithRetry(query(
            collection(db, 'questions'),
            where('authorId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          ))
        ]);

        setPosts(
          postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))
        );

        setQuestions(
          questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))
        );

        setProfileData(prev => ({
          ...prev,
          stats: {
            totalPosts: postsSnapshot.size,
            totalQuestions: questionsSnapshot.size,
          },
        }));
      } catch (err) {
        console.error('Error in fetchUserActivity:', err);
        setError(err.message);
        
        if (err.message.includes('requires an index')) {
          toast.error('Database is still initializing. Please wait a moment and try again.', 
            { duration: 5000 });
        } else if (err.message.includes('permission-denied')) {
          toast.error('You don\'t have permission to access this data. Please sign in again.');
        } else {
          toast.error('Failed to load your activity. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserActivity();
    }
  }, [user]);

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({
      ...prev,
      basic: {
        ...prev.basic,
        ...updatedData,
      },
    }));
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

        <ProfileHeader
          user={user}
          profileData={profileData}
          onProfileUpdate={handleProfileUpdate}
          loading={loading}
        />

        <ProfileStats profileData={profileData} />

        <ProfileActivity
          posts={posts}
          questions={questions}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
