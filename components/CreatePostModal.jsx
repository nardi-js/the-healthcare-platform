"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaTag, FaTimes } from "react-icons/fa";
import BaseModal from "./common/BaseModal";
import FormField from "./common/FormField";
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

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTagAdd = () => {
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Post"
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? "Creating..." : "Create Post"}
      loading={isSubmitting}
      size="xl"
    >
      {error && (
        <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded">
          {error}
        </div>
      )}

      <FormField
        type="textarea"
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="What's on your mind?"
        required
      />

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
                formData.tags.includes(tag)
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <FormField
            type="text"
            value={customTag}
            onChange={(e) => {
              setCustomTag(e.target.value);
              setError("");
            }}
            placeholder="Custom tag (max 10 chars)"
            maxLength={10}
            className="flex-grow"
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
      {formData.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
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
    </BaseModal>
  );
}
