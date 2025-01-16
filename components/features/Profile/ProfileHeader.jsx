"use client";

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage } from '@/lib/firebase';
import toast from 'react-hot-toast';

/**
 * ProfileHeader component displays user's basic information and profile picture
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {Object} props.profileData - User's profile data
 * @param {Function} props.onProfileUpdate - Callback when profile is updated
 * @param {boolean} props.loading - Loading state
 */
const ProfileHeader = ({ user, profileData, onProfileUpdate, loading }) => {
  const [updating, setUpdating] = useState(false);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUpdating(true);
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      onProfileUpdate({ photoURL: downloadURL });
      toast.success('Profile picture updated successfully');
    } catch (err) {
      console.error('Error updating profile picture:', err);
      toast.error('Failed to update profile picture');
    } finally {
      setUpdating(false);
    }
  };

  return (
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
            disabled={loading || updating}
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
  );
};

export default ProfileHeader;
