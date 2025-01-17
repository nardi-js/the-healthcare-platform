"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TrustedUserApplication() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      // First check if user is already trusted
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserProfile(userData);

      if (userData?.isTrusted) {
        setApplicationStatus('approved');
        setLoading(false);
        return;
      }

      // Check latest application
      const applicationsQuery = query(
        collection(db, 'trusted-applications'),
        where('userId', '==', user.uid),
        where('status', 'in', ['pending', 'approved', 'rejected'])
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      if (!applicationsSnapshot.empty) {
        const latestApp = applicationsSnapshot.docs[0].data();
        setApplicationStatus(latestApp.status);
      } else {
        setApplicationStatus('none');
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      toast.error('Error checking application status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setSubmitting(true);
    try {
      const application = {
        userId: user.uid,
        userEmail: user.email,
        username: userProfile?.username || user.email.split('@')[0],
        message: message.trim(),
        status: 'pending',
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'trusted-applications'), application);
      setApplicationStatus('pending');
      toast.success('Application submitted successfully!');
      setMessage('');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FaSpinner className="animate-spin text-purple-600 text-2xl" />
      </div>
    );
  }

  if (applicationStatus === 'approved' && userProfile?.isTrusted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            Congratulations! You are a trusted user.
          </h2>
          <p className="text-green-700 dark:text-green-300">
            You have full access to trusted user features.
          </p>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Application Under Review
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300">
            Your application is being reviewed by our team. We'll notify you once a decision has been made.
          </p>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Application Rejected
          </h2>
          <p className="text-red-700 dark:text-red-300">
            Unfortunately, your application was not approved. You may contact our team for more information.
          </p>
          <a 
            href="mailto:trust@healthcareplatform.com" 
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Contact Our Team
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Apply for Trusted User Status
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Why would you like to become a trusted user?
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Tell us about your professional background and why you'd like to become a trusted user..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className={`w-full px-4 py-2 rounded-lg ${
              submitting || !message.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white font-medium`}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
