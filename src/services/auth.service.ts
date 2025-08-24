import axiosInstance from '@/lib/axios';
import { ApiResponse, LoginRequest, LoginResponse, User } from '@/types/api.types';
import Cookies from 'js-cookie';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  UPDATE_PROFILE: '/auth/profile',
  VALIDATE: '/auth/validate',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export class AuthService {
  /**
   * Iniciar sesión
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    
    if (response.data.success && response.data.data) {
      // Guardar token en cookies
      const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token';
      Cookies.set(tokenKey, response.data.data.access_token, {
        expires: 1, // 1 día
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        //secure: false,
        //sameSite: 'lax',
      });
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error en el login');
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    try {
      await axiosInstance.post<ApiResponse<null>>(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continuar con logout local incluso si falla la petición al servidor
      console.warn('Error al hacer logout en el servidor:', error);
    } finally {
      // Limpiar token local
      const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token';
      Cookies.remove(tokenKey);
    }
  }

  /**
   * Obtener información del usuario actual
   */
  static async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener usuario');
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = await axiosInstance.put<ApiResponse<null>>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      passwords
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al cambiar contraseña');
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<User> {
    const response = await axiosInstance.put<ApiResponse<User>>(
      AUTH_ENDPOINTS.UPDATE_PROFILE,
      profileData
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al actualizar perfil');
  }

  /**
   * Validar token actual
   */
  static async validateToken(): Promise<boolean> {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(AUTH_ENDPOINTS.VALIDATE);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token';
    return !!Cookies.get(tokenKey);
  }

  /**
   * Obtener token actual
   */
  static getToken(): string | undefined {
    const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token';
    return Cookies.get(tokenKey);
  }

  /**
   * Decodificar token JWT (sin verificación)
   */
  static decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Verificar si el token ha expirado
   */
  static isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  /**
   * Obtener rol del usuario desde el token
   */
  static getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded?.role || null;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  static hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Verificar si el usuario es administrador
   */
  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verificar si el usuario es bibliotecario
   */
  static isLibrarian(): boolean {
    return this.hasRole('librarian');
  }

  /**
   * Solicitar recuperación de contraseña
   */
  static async forgotPassword(email: string): Promise<void> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      { email }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al solicitar recuperación de contraseña');
    }
  }

  /**
   * Restablecer contraseña con token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      { token, newPassword }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al restablecer contraseña');
    }
  }

  /**
   * Obtener token de acceso
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}