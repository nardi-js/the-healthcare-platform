"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes, FaTag } from "react-icons/fa";

const PREDEFINED_TAGS = [
  "Medical",
  "Lifestyle",
  "Mental Health",
  "Nutrition",
  "Fitness"
];

export default function CreatePostModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
    }));
    setSelectedMedia((prev) => [...prev, ...newMedia]);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCustomTagAdd = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && trimmedTag.length <= 10 && !selectedTags.includes(trimmedTag)) {
      setSelectedTags(prev => [...prev, trimmedTag]);
      setCustomTag("");
    } else if (trimmedTag.length > 10) {
      setError("Custom tag must be 10 characters or less");
    }
  };

  const handleMediaRemove = (index) => {
    setSelectedMedia((prev) => {
      const newMedia = [...prev];
      URL.revokeObjectURL(newMedia[index].preview);
      newMedia.splice(index, 1);
      return newMedia;
    });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!postContent.trim()) {
      setError("Post content is required");
      return;
    }

    if (selectedTags.length === 0) {
      setError("Please select at least one tag");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const postPayload = {
        content: postContent,
        media: selectedMedia.map((media) => ({
          url: media.preview,
          type: media.type,
        })),
        tags: selectedTags,
        authorId: user.uid,
        author: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "/default-avatar.png",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        views: 0,
        commentCount: 0,
      };

      await addDoc(collection(db, "posts"), postPayload);

      setPostContent("");
      setSelectedMedia([]);
      setSelectedTags([]);
      setCustomTag("");
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  Create New Post
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmitPost} className="mt-4">
                  {error && (
                    <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 border rounded-lg resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Tags Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PREDEFINED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Custom tag (max 10 chars)"
                        value={customTag}
                        onChange={(e) => {
                          setCustomTag(e.target.value);
                          setError("");
                        }}
                        maxLength={10}
                        className="flex-grow px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleCustomTagAdd}
                        disabled={!customTag.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          >
                            <FaTag className="mr-1" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleTagToggle(tag)}
                              className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Media
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaSelect}
                      multiple
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>

                  {/* Media Preview */}
                  {selectedMedia.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {selectedMedia.map((media, index) => (
                        <div key={index} className="relative">
                          {media.type === "image" ? (
                            <img
                              src={media.preview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded"
                            />
                          ) : (
                            <video
                              src={media.preview}
                              className="w-full h-32 object-cover rounded"
                              controls
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleMediaRemove(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Create Post"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
