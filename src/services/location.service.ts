// src/services/location.service.ts - SIMPLIFICADO SIN ESTADÍSTICAS
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
  code?: string;
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
    const response = await axiosInstance.post<ApiResponse<Location>>(
      LOCATION_ENDPOINTS.LOCATIONS,
      data
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
    const response = await axiosInstance.put<ApiResponse<Location>>(
      LOCATION_ENDPOINTS.LOCATION_BY_ID(id),
      data
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