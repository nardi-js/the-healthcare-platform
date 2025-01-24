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
import { FaComment } from "react-icons/fa";
import Image from "next/image";
import CommentSystem from "@/components/features/Comments/CommentSystem";
import VoteSystem from "@/components/shared/VoteSystem";
import { toast } from "react-hot-toast";

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
          {/* Author Info */}
          <div className="flex items-center mb-4">
            <Image
              src={post.author.avatar || "/default-avatar.png"}
              alt={post.author.name || "Anonymous"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {post.author.name || "Anonymous"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Media Content */}
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mb-6">
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
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <VoteSystem postId={postId} type="posts" />
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 text-gray-500 hover:text-purple-500"
              >
                <FaComment />
                <span>{post.commentCount || 0}</span>
              </button>
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
