"use client";

import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/utils'; // Your auth check logic

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const [isClient, setIsClient] = useState(false); // To track if it's on client-side

    useEffect(() => {
      // Mark as client-side once component is mounted
      setIsClient(true);

      // Redirect if not authenticated
      if (!isAuthenticated()) {
        window.location.href = '/faculty/login'; 
      }
    }, []);

    // If not on the client side yet, return null to avoid SSR mismatch
    if (!isClient) {
      return null; // Prevent rendering during SSR
    }

    if (!isAuthenticated()) {
      return null; // If not authenticated after client check
    }

    return <WrappedComponent {...props} />;
  };

  // Set the display name for better debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
