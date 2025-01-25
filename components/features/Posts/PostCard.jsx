"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ItemCard from "@/components/shared/ItemCard";

export default function PostCard({ post }) {
  const router = useRouter();

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <ItemCard
      item={post}
      type="post"
      onClick={handlePostClick}
    />
  );
}