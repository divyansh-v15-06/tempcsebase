"use client";

import { useState, useEffect } from 'react';
import { isAuthenticatedADmin } from '@/lib/utils'; // Your auth check logic

const withAuth2 = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const [isClient, setIsClient] = useState(false); // To track if it's on client-side

    useEffect(() => {
      // Mark as client-side once component is mounted
      setIsClient(true);

      // Redirect if not authenticated
      if (!isAuthenticatedADmin()) {
        window.location.href = '/admin/login'; 
      }
    }, []);

    // If not on the client side yet, return null to avoid SSR mismatch
    if (!isClient) {
      return null; // Prevent rendering during SSR
    }

    if (!isAuthenticatedADmin()) {
      return null; // If not authenticated after client check
    }

    return <WrappedComponent {...props} />;
  };

  // Set the display name for better debugging
  AuthenticatedComponent.displayName = `withAuth2(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth2;
