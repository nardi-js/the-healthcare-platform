"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { FaUserShield, FaTimes, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function TrustedUsersPage() {
  const { user } = useAuth();
  const [trustedUsers, setTrustedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustedUsers();
  }, []);

  const fetchTrustedUsers = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('isTrusted', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trustedSince: doc.data().trustedSince?.toDate()
      }));
      setTrustedUsers(users);
    } catch (error) {
      console.error('Error fetching trusted users:', error);
      toast.error('Error loading trusted users');
    } finally {
      setLoading(false);
    }
  };

  const removeTrustedStatus = async (userId) => {
    try {
      // Update user's trusted status
      await updateDoc(doc(db, 'users', userId), {
        isTrusted: false,
        trustedSince: null,
        verifiedBy: null,
        verifierName: null
      });

      // Find and update any existing applications to allow reapplication
      const applicationsQuery = query(
        collection(db, 'trusted-applications'),
        where('userId', '==', userId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      // Update all applications to 'rejected' status
      const updatePromises = applicationsSnapshot.docs.map(appDoc => 
        updateDoc(doc(db, 'trusted-applications', appDoc.id), {
          status: 'rejected',
          reviewedAt: new Date(),
          rejectionReason: 'Trusted status revoked by admin',
          reviewedBy: user.uid,
          reviewerName: user.displayName || user.email
        })
      );
      
      await Promise.all(updatePromises);
      
      toast.success('Trusted status removed successfully');
      // Update the local state
      setTrustedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error removing trusted status:', error);
      toast.error('Error removing trusted status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <FaSpinner className="animate-spin text-purple-600 text-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Trusted Users
          </h1>
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg">
            Total: {trustedUsers.length}
          </div>
        </div>

        <div className="space-y-4">
          {trustedUsers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No trusted users found
            </p>
          ) : (
            trustedUsers.map((trustedUser) => (
              <div
                key={trustedUser.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
                    {trustedUser.photoURL ? (
                      <Image
                        src={trustedUser.photoURL}
                        alt={`Profile picture of ${trustedUser.username || trustedUser.email || 'user'}`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <FaUserShield className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {trustedUser.username || trustedUser.email}
                    </h3>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-500 dark:text-gray-300">
                        Email: {trustedUser.email}
                      </p>
                      {trustedUser.trustedSince && (
                        <p className="text-gray-500 dark:text-gray-300">
                          Trusted since: {formatDistanceToNow(trustedUser.trustedSince, { addSuffix: true })}
                        </p>
                      )}
                      {trustedUser.verifierName && (
                        <p className="text-gray-500 dark:text-gray-300">
                          Verified by: {trustedUser.verifierName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeTrustedStatus(trustedUser.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove trusted status"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
