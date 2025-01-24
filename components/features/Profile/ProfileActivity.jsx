"use client";

import Link from 'next/link';

/**
 * ActivityCard component for displaying a list of items with loading state
 */
const ActivityCard = ({ title, items, loading, renderItem }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    <div className="space-y-4">
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      ) : items.length > 0 ? (
        items.slice(0, 3).map(renderItem)
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No {title.toLowerCase()} yet
        </p>
      )}
    </div>
  </div>
);

/**
 * PostItem component for rendering individual post items
 */
const PostItem = ({ post }) => (
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
);

/**
 * QuestionItem component for rendering individual question items
 */
const QuestionItem = ({ question }) => (
  <Link href={`/questions/${question.id}`} key={question.id}>
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
);

/**
 * ProfileActivity component displays user's recent posts and questions
 * @param {Object} props
 * @param {Array} props.posts - Array of user's posts
 * @param {Array} props.questions - Array of user's questions
 * @param {boolean} props.loading - Loading state
 */
const ProfileActivity = ({ posts, questions, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ActivityCard
        title="Recent Posts"
        items={posts}
        loading={loading}
        renderItem={(post) => <PostItem key={post.id} post={post} />}
      />
      <ActivityCard
        title="Recent Questions"
        items={questions}
        loading={loading}
        renderItem={(question) => <QuestionItem key={question.id} question={question} />}
      />
    </div>
  );
};

export default ProfileActivity;
