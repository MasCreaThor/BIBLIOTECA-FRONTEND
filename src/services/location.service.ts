// src/services/location.service.ts
import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface Location {
  _id: string;
  name: string;
  description: string;
  code?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationRequest {
  name: string;
  description: string;
  code?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  description?: string;
  code?: string; // ✅ Puede ser string vacío para limpiar
  active?: boolean;
}

export interface LocationFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const LOCATION_ENDPOINTS = {
  LOCATIONS: '/locations',
  LOCATION_BY_ID: (id: string) => `/locations/${id}`,
} as const;

export class LocationService {
  /**
   * Obtener todas las ubicaciones
   */
  static async getLocations(filters: LocationFilters = {}): Promise<PaginatedResponse<Location> | Location[]> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = params.toString() 
      ? `${LOCATION_ENDPOINTS.LOCATIONS}?${params.toString()}`
      : LOCATION_ENDPOINTS.LOCATIONS;

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Location>>>(url);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener ubicaciones');
    } catch (error: any) {
      // Si el backend no soporta paginación, puede devolver un array directo
      if (error?.response?.data && Array.isArray(error.response.data)) {
        return error.response.data as Location[];
      }
      
      throw error;
    }
  }

  /**
   * Obtener ubicación por ID
   */
  static async getLocationById(id: string): Promise<Location> {
    const response = await axiosInstance.get<ApiResponse<Location>>(
      LOCATION_ENDPOINTS.LOCATION_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener ubicación');
  }

  /**
   * Crear una nueva ubicación
   */
  static async createLocation(data: CreateLocationRequest): Promise<Location> {
    const cleanData = {
      name: data.name,
      description: data.description,
      // Si code está vacío, no lo incluir en la petición
      ...(data.code && data.code.trim() && { code: data.code.trim() }),
    };

    const response = await axiosInstance.post<ApiResponse<Location>>(
      LOCATION_ENDPOINTS.LOCATIONS,
      cleanData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear ubicación');
  }

  /**
   * Actualizar una ubicación
   */
  static async updateLocation(id: string, data: UpdateLocationRequest): Promise<Location> {
  // Incluir explícitamente el campo code, incluso si está vacío
    const cleanData: UpdateLocationRequest = {};
    
    if (data.name !== undefined) {
      cleanData.name = data.name;
    }
    
    if (data.description !== undefined) {
      cleanData.description = data.description;
    }
    
    // Siempre incluir code si se proporciona, incluso si está vacío
    if (data.hasOwnProperty('code')) {
      cleanData.code = data.code || ''; // Enviar string vacío para limpiar
    }
    
    if (data.active !== undefined) {
      cleanData.active = data.active;
    }

    console.log('🔄 Enviando datos de actualización:', cleanData);

    const response = await axiosInstance.put<ApiResponse<Location>>(
      LOCATION_ENDPOINTS.LOCATION_BY_ID(id),
      cleanData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar ubicación');
  }

  /**
   * Eliminar una ubicación
   */
  static async deleteLocation(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      LOCATION_ENDPOINTS.LOCATION_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar ubicación');
    }
  }
}