"use client";

import { useState, useRef } from 'react';
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
  const [editText, setEditText] = useState('');
  const { user } = useAuth();
  const editInputRef = useRef(null);

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

  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
    // Focus the input after a brief delay to ensure it's mounted
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 100);
  };

  const handleEditComment = async (commentId) => {
    if (!user || !editText.trim()) return;

    const commentToEdit = comments.find(c => c.id === commentId);
    if (!commentToEdit || commentToEdit.author.uid !== user.uid) return;

    const updatedComment = {
      ...commentToEdit,
      text: editText.trim(),
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
      setEditText('');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          rows="3"
        />
        <div className="flex justify-end space-x-2">
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel Reply
            </button>
          )}
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${
              comment.replyTo ? 'ml-8 border-l-4 border-gray-300 dark:border-gray-600' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {comment.author.photoURL ? (
                  <img
                    src={comment.author.photoURL}
                    alt={comment.author.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <FaUser className="w-8 h-8 text-gray-400" />
                )}
                <div>
                  <div className="font-medium dark:text-white">
                    {comment.author.displayName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comment.createdAt)}
                    {comment.editedAt && ' (edited)'}
                  </div>
                </div>
              </div>
              
              {user?.uid === comment.author.uid && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(comment)}
                    className="text-gray-500 hover:text-blue-500 dark:text-gray-400"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2">
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    rows="3"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={!editText.trim()}
                      className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
              )}
            </div>

            {!editingComment && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center space-x-1"
              >
                <FaReply />
                <span>Reply</span>
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuestionComment;
