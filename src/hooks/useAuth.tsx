'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import { User, LoginRequest } from '@/types/api.types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si hay token
      if (!AuthService.isAuthenticated()) {
        setUser(null);
        return;
      }

      // Verificar si el token ha expirado
      if (AuthService.isTokenExpired()) {
        await logout();
        return;
      }

      // Obtener información del usuario
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      // No mostrar error aquí para evitar toast en carga inicial
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      
      const loginResponse = await AuthService.login(credentials);
      
      // Obtener información completa del usuario
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      
      toast.success(`¡Bienvenido, ${userData.email}!`);
    } catch (error) {
      console.error('Error en login:', error);
      throw error; // Re-lanzar para que el componente pueda manejar el error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún así limpiar el estado local
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        setUser(null);
        return;
      }

      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      // Si falla la petición, probablemente el token sea inválido
      await logout();
    }
  };

  const changePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    try {
      await AuthService.changePassword(passwords);
      toast.success('Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Hook para verificar roles
export function useRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isLibrarian: user?.role === 'librarian',
    role: user?.role,
    hasRole: (role: string) => user?.role === role,
  };
}

// Hook para protección de rutas
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirigir a login si no está autenticado
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);
  
  return { isAuthenticated, isLoading };
}

// Hook para requerir roles específicos
export function useRequireRole(requiredRole: string | string[]) {
  const { user, isLoading } = useAuth();
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  const hasRequiredRole = user && requiredRoles.includes(user.role);
  
  useEffect(() => {
    if (!isLoading && (!user || !hasRequiredRole)) {
      // Redirigir si no tiene el rol requerido
      toast.error('No tienes permisos para acceder a esta página');
      window.location.href = '/dashboard';
    }
  }, [user, hasRequiredRole, isLoading]);
  
  return { hasRequiredRole, isLoading };
}