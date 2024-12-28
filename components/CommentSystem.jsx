"use client";
import React, { useState } from 'react';
import {
  FaCommentAlt,
  FaPaperPlane,
  FaReply,
  FaEdit,
  FaTrash,
  FaHeart,
} from 'react-icons/fa';

const CommentSystem = ({
  postId,
  userId,
  initialComments = [],
  maxNestingLevel = 3,
}) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = (parentCommentId = null) => {
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    const commentPayload = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: userId,
        name: 'Current User',
        avatar: '/path/to/avatar.jpg',
      },
      parentCommentId,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    if (parentCommentId) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), commentPayload] }
            : comment
        )
      );
    } else {
      setComments((prev) => [commentPayload, ...prev]);
    }

    setNewComment('');
    setReplyingToCommentId(null);
  };

  const renderComment = (comment, depth = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToCommentId === comment.id;

    return (
      <div
        key={comment.id}
        className={`comment bg-gray-50 rounded-lg p-4 mb-4 shadow-sm ${
          depth > 0 ? 'ml-4 border-l-2 pl-2' : ''
        }`}
        style={{
          opacity: depth >= maxNestingLevel ? 0.5 : 1,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <span className="font-bold">{comment.author.name}</span>
              <p className="text-xs text-gray-500">
                {new Date(comment.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => setReplyingToCommentId(comment.id)}
              className="hover:text-blue-600"
            >
              <FaReply /> Reply
            </button>
            <button
              onClick={() => {
                setEditingCommentId(comment.id);
                setNewComment(comment.content);
              }}
              className="hover:text-blue-600"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={() =>
                setComments((prev) =>
                  prev.filter((c) => c.id !== comment.id)
                )
              }
              className="hover:text-red-600"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={() => {
                setComments((prev) =>
                  prev.map((c) =>
                    c.id === comment.id
                      ? { ...c, content: newComment }
                      : c
                  )
                );
                setEditingCommentId(null);
                setNewComment('');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="mt-2 text-gray-700">{comment.content}</p>
        )}

        {isReplying && (
          <div className="mt-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Write a reply..."
            />
            <button
              onClick={() => handleSubmitComment(comment.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Submit
            </button>
          </div>
        )}

        {comment.replies &&
          comment.replies.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="comment-system mt-6">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center bg-gray-100 dark:bg-slate-500 p-2 rounded shadow hover:bg-gray-200"
      >
        <FaCommentAlt className="mr-2" />
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {showComments && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-4">
            Comments ({comments.length})
          </h3>

          <div className="new-comment mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border text-black rounded-lg"
              placeholder="Write a comment..."
            />
            <button
              onClick={() => handleSubmitComment()}
              className="bg-blue-500 text-white px-6 py-2 rounded mt-2"
            >
              Submit
            </button>
          </div>

          <div className="comments-list">
            {comments.map((comment) => renderComment(comment))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSystem;
