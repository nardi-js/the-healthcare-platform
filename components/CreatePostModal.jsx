"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";

export default function CreatePostModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
    }));
    setSelectedMedia((prev) => [...prev, ...newMedia]);
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags((prev) => [...prev, newTag]);
      }
      e.target.value = "";
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
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
      // Handle not logged in state
      console.error("User must be logged in to create a post");
      return;
    }

    if (!postContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare Post Payload
      const postPayload = {
        content: postContent,
        media: selectedMedia.map((media) => ({
          url: media.preview || URL.createObjectURL(media.file),
          type: media.type,
        })),
        tags: selectedTags,
        authorId: user.uid,
        author: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "/download.png",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        views: 0,
        commentCount: 0,
      };

      // Add post to Firestore
      await addDoc(collection(db, "posts"), postPayload);

      // Clear form
      setPostContent("");
      setSelectedMedia([]);
      setSelectedTags([]);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Create Post
                </Dialog.Title>

                <form onSubmit={handleSubmitPost}>
                  {/* Post Content */}
                  <div className="mb-6">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      rows="4"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  {/* Media Upload */}
                  <div className="mb-6">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaSelect}
                      multiple
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200"
                    >
                      Add Media
                    </label>

                    {/* Media Preview */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {selectedMedia.map((media, index) => (
                        <div key={index} className="relative">
                          {media.type === "image" && (
                            <img
                              src={media.preview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleMediaRemove(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Add tags (press Enter)"
                      onKeyDown={handleTagAdd}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />

                    {/* Tags Display */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center space-x-1 dark:bg-purple-900 dark:text-purple-200"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="hover:text-purple-900 dark:hover:text-purple-100"
                          >
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !postContent.trim()}
                    className={`w-full py-3 rounded-lg text-white font-semibold ${
                      isSubmitting || !postContent.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
