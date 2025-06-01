'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function DebugInfo() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔍 Debug Info:', {
      pathname,
      isAuthenticated,
      isLoading,
      user: user ? { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      } : null,
      timestamp: new Date().toISOString()
    });
  }, [pathname, isAuthenticated, isLoading, user]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div>Path: {pathname}</div>
      <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {isLoading ? '⏳' : '✅'}</div>
      <div>User: {user?.email || 'None'}</div>
    </div>
  );
}