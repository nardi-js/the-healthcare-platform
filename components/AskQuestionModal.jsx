"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import BaseModal from "./common/BaseModal";
import FormField from "./common/FormField";

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask a Question"
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? "Posting..." : "Post Question"}
      loading={isSubmitting}
      size="xl"
    >
      {error && (
        <div className="mb-4 text-red-500 text-sm">{error}</div>
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
        type="select"
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={categories}
        required
      />

      <FormField
        type="textarea"
        label="Question Details"
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="Provide more details about your question..."
        required
      />
    </BaseModal>
  );
}
