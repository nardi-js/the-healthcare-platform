"use client";

import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes, FaFileAlt } from "react-icons/fa";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const categories = [
  { id: "General Medicine", label: "General Medicine" },
  { id: "Mental Health", label: "Mental Health" },
  { id: "Pediatrics", label: "Pediatrics" },
  { id: "Emergency care", label: "Emergency Care" },
  { id: "Chronic Condition", label: "Chronic Condition" },
  { id: "Preventive Care", label: "Preventive Care" },
];

export default function AskQuestionModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
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

  const handleMediaRemove = (index) => {
    setSelectedMedia((prev) => {
      const newMedia = [...prev];
      URL.revokeObjectURL(newMedia[index].preview);
      newMedia.splice(index, 1);
      return newMedia;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to ask a question");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Question content is required");
      return;
    }

    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const questionData = {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        media: selectedMedia.map((media) => ({
          url: media.preview,
          type: media.type,
        })),
        authorId: user.uid,
        author: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "/default-avatar.png",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        answerCount: 0,
        views: 0,
        likes: 0,
        dislikes: 0,
      };

      await addDoc(collection(db, "questions"), questionData);

      setTitle("");
      setContent("");
      setSelectedCategory("");
      setSelectedMedia([]);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      toast.success("Question posted successfully!");
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Failed to post question. Please try again.");
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
                  Ask a Question
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  {error && (
                    <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Question Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="mb-4">
                    <textarea
                      placeholder="What's your question?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 border rounded-lg resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category.id
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      {isSubmitting ? "Posting..." : "Post Question"}
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