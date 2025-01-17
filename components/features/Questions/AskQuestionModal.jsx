"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import Modal from "@/components/ui/modal";
import FormField from "@/components/common/FormField";

const categories = [
  { value: "General Medicine", label: "General Medicine" },
  { value: "Mental Health", label: "Mental Health" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Emergency care", label: "Emergency Care" },
  { value: "Chronic Condition", label: "Chronic Condition" },
  { value: "Preventive Care", label: "Preventive Care" },
];

export default function AskQuestionModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to ask a question");
      return;
    }

    const { title, content, category } = formData;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Question content is required");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const questionData = {
        title: title.trim(),
        content: content.trim(),
        category,
        authorId: user.uid,
        author: {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        answerCount: 0,
        views: 0,
        likes: 0,
        dislikes: 0,
      };

      await addDoc(collection(db, "questions"), questionData);
      
      toast.success("Question posted successfully!");
      setFormData({
        title: "",
        content: "",
        category: "",
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error posting question:", error);
      setError("Failed to post question. Please try again.");
      toast.error("Failed to post question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask a Question"
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
            {isSubmitting ? "Submitting..." : "Submit Question"}
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
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What's your question?"
          required
        />

        <FormField
          label="Description"
          name="content"
          type="textarea"
          value={formData.content}
          onChange={handleChange}
          placeholder="Provide more details about your question..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
