"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FaUser, FaReply, FaTrash, FaEdit } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { doc, collection, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';
import Image from 'next/image';

const PostComment = ({ postId, comments = [], onCommentUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const commentData = {
        content: newComment.trim(),
        author: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '/download.png'
        },
        createdAt: serverTimestamp(),
        replyTo: replyTo
      };

      const docRef = await addDoc(commentsRef, commentData);
      
      // Update post's comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: (comments?.length || 0) + 1
      });

      // Update local state with the new comment
      const commentWithId = {
        id: docRef.id,
        ...commentData,
        createdAt: new Date()
      };

      if (onCommentUpdate) {
        onCommentUpdate([commentWithId, ...comments]);
      }
      
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.author.id !== user.uid) return;

    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      
      // Update post's comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: Math.max(0, (comments?.length || 0) - 1)
      });

      if (onCommentUpdate) {
        onCommentUpdate(comments.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!user || !newText.trim()) return;

    const commentToEdit = comments.find(c => c.id === commentId);
    if (!commentToEdit || commentToEdit.author.id !== user.uid) return;

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const updates = {
        content: newText.trim(),
        editedAt: serverTimestamp()
      };
      
      await updateDoc(commentRef, updates);

      if (onCommentUpdate) {
        const updatedComments = comments.map(c => 
          c.id === commentId 
            ? { ...c, ...updates, editedAt: new Date() }
            : c
        );
        onCommentUpdate(updatedComments);
      }

      setEditingComment(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start space-x-4">
            <div className="min-w-0 flex-1">
              <textarea
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
                placeholder="Add a comment..."
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
          {replyTo && (
            <div className="mt-2 text-sm text-gray-500">
              Replying to comment
              <button
                onClick={() => setReplyTo(null)}
                className="ml-2 text-purple-600 hover:text-purple-500"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex space-x-4 ${comment.replyTo ? 'ml-12' : ''}`}
          >
            <div className="flex-shrink-0">
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex-grow">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author.name}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.editedAt && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="mt-2">
                  <textarea
                    defaultValue={comment.content}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 sm:text-sm"
                    rows="2"
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={(e) => handleEditComment(comment.id, e.target.parentElement.parentElement.querySelector('textarea').value)}
                      className="text-sm text-purple-600 hover:text-purple-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="text-sm text-gray-500 hover:text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
              )}
              
              <div className="mt-2 flex items-center space-x-4">
                {user && !comment.replyTo && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FaReply className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                )}
                {user?.uid === comment.author.id && (
                  <>
                    <button
                      onClick={() => setEditingComment(comment.id)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <FaEdit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center text-sm text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PostComment;
