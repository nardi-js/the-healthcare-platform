"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FaUser, FaReply, FaTrash, FaEdit } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';

const QuestionComment = ({ questionId, comments = [], onCommentUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const { user } = useAuth();

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const commentData = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL
      },
      createdAt: new Date().toISOString(), 
      replyTo: replyTo,
      replies: []
    };

    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        comments: arrayUnion(commentData)
      });

      const updatedComments = [...(comments || []), commentData];
      await updateDoc(questionRef, {
        lastCommentAt: serverTimestamp()
      });
      
      setNewComment('');
      setReplyTo(null);
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.author.uid !== user.uid) return;

    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        comments: arrayRemove(commentToDelete)
      });
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!user || !newText.trim()) return;

    const commentToEdit = comments.find(c => c.id === commentId);
    if (!commentToEdit || commentToEdit.author.uid !== user.uid) return;

    const updatedComment = {
      ...commentToEdit,
      text: newText.trim(),
      editedAt: new Date().toISOString() 
    };

    try {
      const questionRef = doc(db, 'questions', questionId);
      const updatedComments = comments.map(c => 
        c.id === commentId ? updatedComment : c
      );
      
      await updateDoc(questionRef, { 
        comments: updatedComments,
        lastEditAt: serverTimestamp()
      });
      setEditingComment(null);
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = typeof timestamp === 'string' 
        ? new Date(timestamp)
        : timestamp?.toDate?.() || new Date(timestamp);
      
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
              disabled={!newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
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
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author.displayName}
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
                    defaultValue={comment.text}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 sm:text-sm"
                    rows="2"
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id, event.target.previousSibling.value)}
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
                <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.text}</p>
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
                {user?.uid === comment.author.uid && (
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

export default QuestionComment;
