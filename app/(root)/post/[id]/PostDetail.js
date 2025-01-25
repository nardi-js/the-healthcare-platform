"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { FaComment, FaEye, FaUser, FaClock, FaTags } from "react-icons/fa";
import Image from "next/image";
import CommentSystem from "@/components/features/Comments/CommentSystem";
import VoteSystem from "@/components/shared/VoteSystem";
import { recordPostView } from "@/lib/utils/views";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function PostDetail({ postId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Real-time listener for post document
  useEffect(() => {
    if (!postId) return;

    const postRef = doc(db, "posts", postId);
    const unsubscribe = onSnapshot(
      postRef,
      (doc) => {
        if (doc.exists()) {
          setPost({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          });
          setLoading(false);
        } else {
          setError("Post not found");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching post:", error);
        setError("Failed to load post");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  // Record view count
  useEffect(() => {
    if (!postId) return;
    recordPostView(postId, user?.uid);
  }, [postId, user?.uid]);

  // Real-time listener for comments
  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          {/* Post Header */}
          <div className="flex flex-col space-y-4 mb-6">
            {/* Author and Stats Row */}
            <div className="flex items-center justify-between">
              {/* Author Info */}
              <div className="flex items-center space-x-3">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name || "Anonymous"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {post.author?.name || "Anonymous"}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FaClock className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaEye className="w-4 h-4" />
                  <span>{post.views || 0} views</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Media Content */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {post.media.map((item, index) => (
                  <div key={index} className="relative">
                    {item.type === "image" && (
                      <Image
                        src={item.url}
                        alt="Post media"
                        width={800}
                        height={600}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <FaTags className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Engagement */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <VoteSystem postId={postId} type="posts" />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Comments
          </h2>
          <CommentSystem
            type="post"
            itemId={postId}
            comments={comments}
            onCommentUpdate={() => {}} // No need for manual update since we have real-time listener
          />
        </div>
      </div>
    </div>
  );
}
