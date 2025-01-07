"use client";

import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TrustedUserApplication() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rules = [
    "Must be a licensed healthcare professional",
    "Must provide valid certification or license",
    "Must have a verified professional email",
    "Must agree to our professional conduct guidelines",
    "Must maintain high-quality contributions",
    "Subject to periodic review of trusted status",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload your credentials');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `trusted-applications/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Create application document in Firestore
      const applicationRef = doc(collection(db, 'trusted-applications'));
      await setDoc(applicationRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        status: 'pending',
        documentUrl: fileUrl,
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        notes: null
      });

      toast.success('Application submitted successfully');
      setFile(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Trusted User Application
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Requirements
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          {rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Credentials (PDF)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="credential-upload"
            />
            <label
              htmlFor="credential-upload"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
            >
              <FaUpload />
              <span>{file ? file.name : 'Choose PDF file'}</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || isSubmitting}
          className={`w-full px-4 py-2 rounded-lg ${
            isSubmitting || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white font-medium flex items-center justify-center space-x-2`}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Application</span>
          )}
        </button>
      </form>
    </div>
  );
}
