"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TrustedUserVerification() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const q = query(
        collection(db, 'trusted-applications'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate()
      }));
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (applicationId, isApproved) => {
    try {
      const applicationRef = doc(db, 'trusted-applications', applicationId);
      const userRef = doc(db, 'users', applications.find(app => app.id === applicationId).userId);

      await updateDoc(applicationRef, {
        status: isApproved ? 'approved' : 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: auth.currentUser.uid
      });

      if (isApproved) {
        await updateDoc(userRef, {
          isTrusted: true,
          trustedSince: serverTimestamp()
        });
      }

      toast.success(`Application ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Error updating application');
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
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Pending Trusted User Applications
      </h2>

      {applications.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No pending applications</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border dark:border-gray-700 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {application.userName || application.userEmail}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Submitted: {application.submittedAt?.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={application.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    View Document
                  </a>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleVerification(application.id, true)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2"
                >
                  <FaCheck />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleVerification(application.id, false)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center space-x-2"
                >
                  <FaTimes />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
