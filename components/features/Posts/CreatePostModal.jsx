"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaTag, FaTimes } from "react-icons/fa";
import Modal from "@/components/ui/modal";
import FormField from "@/components/common/FormField";
import toast from "react-hot-toast";

const PREDEFINED_TAGS = [
  "Medical",
  "Lifestyle",
  "Mental Health",
  "Nutrition",
  "Fitness"
];

export default function CreatePostModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    content: "",
    tags: [],
  });
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleTagClick = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && trimmedTag.length <= 10 && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCustomTag("");
    } else if (trimmedTag.length > 10) {
      setError("Custom tag must be 10 characters or less");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!formData.content.trim()) {
      setError("Post content is required");
      return;
    }

    if (formData.tags.length === 0) {
      setError("Please select at least one tag");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const postPayload = {
        content: formData.content.trim(),
        media: selectedMedia.map((media) => ({
          url: media.preview,
          type: media.type,
        })),
        tags: formData.tags,
        authorId: user.uid,
        author: {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        views: 0,
        commentCount: 0,
      };

      await addDoc(collection(db, "posts"), postPayload);
      toast.success("Post created successfully!");

      setFormData({
        content: "",
        tags: [],
      });
      setSelectedMedia([]);
      setCustomTag("");
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a Post"
      footer={
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
            {error}
          </div>
        )}

        <FormField
          label="Content"
          name="content"
          type="textarea"
          value={formData.content}
          onChange={handleChange}
          placeholder="Share your thoughts..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.tags.includes(tag)
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                } hover:bg-purple-200`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Add Custom Tag
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter custom tag"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 sm:text-sm"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
            >
              <FaTag className="mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <FaTimes />
              </button>
            </span>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Media (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="media-upload"
                  className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                >
                  <span>Upload media files</span>
                  <input
                    id="media-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaSelect}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {selectedMedia.map((media, index) => (
            <div key={index} className="relative">
              {media.type === "image" ? (
                <img
                  src={media.preview}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-full object-cover rounded"
                />
              ) : (
                <video
                  src={media.preview}
                  className="h-24 w-full object-cover rounded"
                  controls
                />
              )}
              <button
                type="button"
                onClick={() => handleMediaRemove(index)}
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
