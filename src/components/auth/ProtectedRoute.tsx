'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Center, VStack, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'librarian' | 'any';
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) {
      return;
    }

    // Si aún está cargando, esperar
    if (isLoading) {
      return;
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
      return;
    }

    // Si requiere un rol específico, verificar
    if (requiredRole && requiredRole !== 'any') {
      if (!user || user.role !== requiredRole) {
        // Redirigir a página no autorizada o dashboard
        router.push('/dashboard');
        return;
      }
    }
  }, [requireAuth, requiredRole, isLoading, isAuthenticated, user, router, pathname]);

  // Mostrar loading mientras verifica
  if (requireAuth && isLoading) {
    return fallback || <LoadingSpinner fullScreen message="Verificando acceso..." />;
  }

  // Si no está autenticado y requiere auth, no mostrar nada (se redirige)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si requiere un rol específico y no lo tiene, no mostrar nada (se redirige)
  if (requireAuth && requiredRole && requiredRole !== 'any' && user?.role !== requiredRole) {
    return null;
  }

  // Mostrar contenido
  return <>{children}</>;
}

// Componente específico para rutas que requieren ser admin
export function AdminRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requireAuth requiredRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para rutas que requieren autenticación pero cualquier rol
export function AuthenticatedRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requireAuth requiredRole="any" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Componente para rutas públicas (solo para no autenticados)
export function PublicOnlyRoute({ children, redirectTo = '/dashboard' }: { children: ReactNode; redirectTo?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verificando acceso..." />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}