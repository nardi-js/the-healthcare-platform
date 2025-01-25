"use client";

import { useParams } from "next/navigation";
import PostDetail from "./PostDetail";

export default function PostPage() {
  const params = useParams();
  return <PostDetail postId={params.id} />;
}