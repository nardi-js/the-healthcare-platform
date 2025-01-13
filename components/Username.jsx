"use client";

import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Username({ userId, username, showTrustMark = true }) {
  const [isTrusted, setIsTrusted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTrustedStatus = async () => {
      if (!userId) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setIsTrusted(userDoc.data()?.isTrusted || false);
        }
      } catch (error) {
        console.error('Error checking trusted status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTrustedStatus();
  }, [userId]);

  return (
    <span className="inline-flex items-center space-x-1">
      <span className="font-medium text-gray-900 dark:text-white">{username}</span>
      {showTrustMark && !isLoading && isTrusted && (
        <FaCheckCircle 
          className="text-blue-500 w-4 h-4" 
          title="Trusted User"
        />
      )}
    </span>
  );
}
