import React from 'react';
import '../globals.css';
import { AuthProvider } from '../../context/useAuth';

export default function Authentication({ children }) {
  return (
    <div>
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}