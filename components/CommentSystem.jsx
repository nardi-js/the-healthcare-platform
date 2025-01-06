"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaCommentAlt,
  FaPaperPlane,
  FaReply,
  FaEdit,
  FaTrash,
  FaHeart,
  FaFlag,
  FaEllipsisV,
  FaRegHeart,
} from "react-icons/fa";
import { Menu } from "@headlessui/react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

const CommentSystem = ({
  postId,
  userId,
  initialComments = [],
  maxNestingLevel = 3,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, mostLiked
  const [commentCount, setCommentCount] = useState(0);

  // Fetch comments from Firestore
  useEffect(() => {
    if (!showComments || !postId) return;

    setLoading(true);
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy(sortBy === "mostLiked" ? "likes" : "timestamp", sortBy === "oldest" ? "asc" : "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString(),
        }));
        setComments(fetchedComments);
        setCommentCount(fetchedComments.length);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId, showComments, sortBy]);

  const handleSubmitComment = async (parentCommentId = null) => {
    if (!user) {
      setError("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const commentData = {
        postId,
        content: newComment.trim(),
        author: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "/default-avatar.png",
        },
        parentCommentId,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        edited: false,
      };

      await addDoc(collection(db, "comments"), commentData);
      setNewComment("");
      setReplyingToCommentId(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    if (!user) return;

    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        content: newContent,
        edited: true,
        lastEditedAt: serverTimestamp(),
      });
      setEditingCommentId(null);
      setNewComment("");
    } catch (error) {
      console.error("Error editing comment:", error);
      setError("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteDoc(doc(db, "comments", commentId));
      } catch (error) {
        console.error("Error deleting comment:", error);
        setError("Failed to delete comment. Please try again.");
      }
    }
  };

  const handleLikeComment = async (commentId, currentLikes, likedBy) => {
    if (!user) {
      setError("Please sign in to like comments");
      return;
    }

    try {
      const commentRef = doc(db, "comments", commentId);
      const hasLiked = likedBy.includes(user.uid);

      await updateDoc(commentRef, {
        likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
        likedBy: hasLiked
          ? likedBy.filter((id) => id !== user.uid)
          : [...likedBy, user.uid],
      });
    } catch (error) {
      console.error("Error updating like:", error);
      setError("Failed to update like. Please try again.");
    }
  };

  const handleReport = async (commentId) => {
    if (!user) {
      setError("Please sign in to report comments");
      return;
    }

    try {
      const reportRef = collection(db, "reports");
      await addDoc(reportRef, {
        commentId,
        reportedBy: user.uid,
        timestamp: serverTimestamp(),
        status: "pending",
      });
      alert("Comment reported successfully. Our team will review it.");
    } catch (error) {
      console.error("Error reporting comment:", error);
      setError("Failed to report comment. Please try again.");
    }
  };

  const renderComment = useCallback((comment, depth = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToCommentId === comment.id;
    const isAuthor = user?.uid === comment.author.id;
    const hasLiked = comment.likedBy?.includes(user?.uid);

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 ${
          depth > 0 ? "ml-6" : ""
        } border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              {comment.author.isVerified && (
                <div className="absolute -right-1 -bottom-1 bg-blue-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comment.author.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </span>
                {comment.edited && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id, newComment)}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setNewComment("");
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}

              <div className="mt-2 flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(comment.id, comment.likes, comment.likedBy || [])}
                  className={`flex items-center space-x-1 text-sm ${
                    hasLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-gray-500 hover:text-gray-600"
                  }`}
                >
                  {hasLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{comment.likes || 0}</span>
                </button>
                <button
                  onClick={() => setReplyingToCommentId(comment.id)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-600"
                >
                  <FaReply />
                  <span>Reply</span>
                </button>
              </div>

              {isReplying && (
                <div className="mt-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Write a reply..."
                    rows={3}
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleSubmitComment(comment.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      {loading ? "Posting..." : "Post Reply"}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingToCommentId(null);
                        setNewComment("");
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Menu as="div" className="relative">
            <Menu.Button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaEllipsisV className="text-gray-500" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
              {isAuthor && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setNewComment(comment.content);
                        }}
                        className={`${
                          active
                            ? "bg-gray-100 dark:bg-gray-700"
                            : ""
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <FaEdit className="mr-2" /> Edit
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className={`${
                          active
                            ? "bg-gray-100 dark:bg-gray-700"
                            : ""
                        } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                      >
                        <FaTrash className="mr-2" /> Delete
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleReport(comment.id)}
                    className={`${
                      active
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    <FaFlag className="mr-2" /> Report
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>

        {comment.replies && depth < maxNestingLevel && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </motion.div>
    );
  }, [editingCommentId, replyingToCommentId, user, loading, newComment, maxNestingLevel]);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <FaCommentAlt />
          <span>{showComments ? "Hide Comments" : "Show Comments"}</span>
          <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
            {commentCount}
          </span>
        </button>

        {showComments && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostLiked">Most Liked</option>
          </select>
        )}
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {user ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Write a comment..."
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleSubmitComment()}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Post Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  Please{" "}
                  <button
                    onClick={() => {/* Trigger sign in */}}
                    className="text-purple-500 hover:text-purple-600"
                  >
                    sign in
                  </button>{" "}
                  to comment
                </p>
              </div>
            )}

            {loading && !comments.length ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}

            {!loading && !comments.length && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentSystem;
