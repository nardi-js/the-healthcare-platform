"use client";

import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TrustedUserApplication from "@/components/TrustedUserApplication";

export default function TrustedApplicationPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <TrustedUserApplication />
      </div>
    </div>
  );
}
