"use client";

/**
 * ProfileStats component displays user's statistics and account information
 * @param {Object} props
 * @param {Object} props.profileData - User's profile data containing stats and basic info
 */
const ProfileStats = ({ profileData }) => {
  return (
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
  );
};

export default ProfileStats;
