"use client";

import { AnimatePresence } from 'framer-motion';
import Comment from './Comment';
import ErrorBoundary from '@/components/common/ErrorBoundary';

/**
 * CommentList component for displaying a list of comments
 * @param {Object} props
 * @param {Array} props.comments - Array of comment objects
 * @param {Function} props.onReply - Handler for reply action
 * @param {Function} props.onDelete - Handler for delete action
 * @param {Function} props.onEdit - Handler for edit action
 * @param {Function} props.onLike - Handler for like action
 * @param {Object} props.user - Current user object
 * @param {Function} props.formatDate - Date formatting function
 * @param {string} props.type - Type of the parent content
 * @param {boolean} props.isLoading - Loading state for comments
 */
const CommentList = ({
  comments = [],
  onReply,
  onDelete,
  onEdit,
  onLike,
  user,
  formatDate,
  type,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter top-level comments
  const topLevelComments = comments.filter(comment => !comment.replyTo);

  return (
    <div className="space-y-4">
      <ErrorBoundary>
        <AnimatePresence>
          {topLevelComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              onLike={onLike}
              user={user}
              formatDate={formatDate}
              type={type}
              allComments={comments}
            />
          ))}
        </AnimatePresence>
      </ErrorBoundary>
      {topLevelComments.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default CommentList;
