"use client";

import { AuthProvider } from "@/context/useAuth";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QuestionsProvider } from "@/context/QuestionsContext";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { initializeFirestore } from "@/lib/initFirestore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function ClientProviders({ children }) {
  // Initialize Firestore collections
  useEffect(() => {
    initializeFirestore().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <QuestionsProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 transition-all duration-300 ease-in-out">
                  {children}
                </main>
              </div>
            </div>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                }
              }}
            />
          </QuestionsProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
