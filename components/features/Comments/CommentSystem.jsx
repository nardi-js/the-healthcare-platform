"use client";

import { useState, useCallback } from 'react';
import { FaSort } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  arrayRemove,
  arrayUnion,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

/**
 * CommentSystem component for managing comments on posts or questions
 * @param {Object} props
 * @param {string} props.type - Type of content being commented on (post/question)
 * @param {string} props.itemId - ID of the content being commented on
 * @param {Array} props.comments - Array of existing comments
 * @param {Function} props.onCommentUpdate - Callback for when comments are updated
 */
const CommentSystem = ({ type, itemId, comments = [], onCommentUpdate }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const COMMENTS_PER_PAGE = 10;

  const formatDate = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const sortComments = useCallback((commentsToSort) => {
    return [...commentsToSort].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'mostLiked':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        default:
          return dateB - dateA;
      }
    });
  }, [sortBy]);

  const handleSubmit = async (text) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const commentData = {
        content: text.trim(),
        userId: user.uid,
        username: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        likes: []
      };

      const commentsRef = collection(db, `${type}s/${itemId}/comments`);
      await addDoc(commentsRef, commentData);
      toast.success('Comment added successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId, username, replyText) => {
    if (!user) {
      toast.error('Please sign in to reply');
      return;
    }

    setIsSubmitting(true);
    try {
      const commentData = {
        content: replyText.trim(),
        userId: user.uid,
        username: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        likes: [],
        replyTo: {
          commentId,
          username
        }
      };

      const commentsRef = collection(db, `${type}s/${itemId}/comments`);
      await addDoc(commentsRef, commentData);
      toast.success('Reply added successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const commentRef = doc(db, `${type}s/${itemId}/comments`, commentId);
      await deleteDoc(commentRef);
      toast.success('Comment deleted successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleEdit = async (commentId, newText) => {
    try {
      const commentRef = doc(db, `${type}s/${itemId}/comments`, commentId);
      await updateDoc(commentRef, {
        content: newText,
        updatedAt: serverTimestamp(),
      });
      toast.success('Comment updated successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      const commentRef = doc(db, `${type}s/${itemId}/comments`, commentId);
      const comment = comments.find(c => c.id === commentId);
      const hasLiked = comment.likes?.includes(user.uid);

      await updateDoc(commentRef, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });

      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  const loadMoreComments = async () => {
    setIsLoading(true);
    try {
      const commentsRef = collection(db, `${type}s/${itemId}/comments`);
      const q = query(
        commentsRef,
        orderBy('createdAt', 'desc'),
        limit(COMMENTS_PER_PAGE),
        startAfter(comments[comments.length - 1]?.createdAt)
      );
      
      const snapshot = await getDocs(q);
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (onCommentUpdate) {
        onCommentUpdate(prevComments => [...prevComments, ...newComments]);
      }
      
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more comments:', error);
      toast.error('Failed to load more comments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">
            Comments ({comments.length})
          </h3>
          <div className="flex items-center space-x-2">
            <FaSort className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 dark:text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostLiked">Most Liked</option>
            </select>
          </div>
        </div>

        <CommentForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <CommentList
          comments={sortComments(comments)}
          onReply={handleReply}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onLike={handleLike}
          user={user}
          formatDate={formatDate}
          type={type}
          isLoading={isLoading}
        />

        {comments.length >= COMMENTS_PER_PAGE && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreComments}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load More Comments'}
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CommentSystem;
