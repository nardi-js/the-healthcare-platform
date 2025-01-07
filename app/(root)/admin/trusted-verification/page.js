"use client";

import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TrustedUserVerification from "@/components/TrustedUserVerification";

export default function TrustedVerificationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const isUserAdmin = userDoc.data()?.isAdmin || false;
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Access Denied
        </h1>
        <p className="mt-2 text-gray-600">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <TrustedUserVerification />
      </div>
    </div>
  );
}
