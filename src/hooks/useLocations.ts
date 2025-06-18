// src/hooks/useLocations.ts - HOOK PARA GESTIÓN DE UBICACIONES
// ================================================================
// HOOK PERSONALIZADO PARA UBICACIONES CON REACT QUERY
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { 
  Location, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// ===== INTERFACES =====
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

// ===== ENDPOINTS =====
const LOCATION_ENDPOINTS = {
  LOCATIONS: '/locations',
  LOCATION_BY_ID: (id: string) => `/locations/${id}`,
  ACTIVATE: (id: string) => `/locations/${id}/activate`,
  DEACTIVATE: (id: string) => `/locations/${id}/deactivate`,
} as const;

// ===== SERVICIOS =====
class LocationService {
  /**
   * Obtener ubicaciones con filtros
   */
  static async getLocations(filters: LocationFilters = {}): Promise<Location[]> {
    try {
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

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Location> | Location[]>>(url);

      if (response.data.success && response.data.data) {
        // El backend puede devolver array directo o paginado
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          return response.data.data.data || [];
        }
      }

      throw new Error(response.data.message || 'Error al obtener ubicaciones');
    } catch (error: any) {
      console.error('Error al obtener ubicaciones:', error);
      
      // Fallback con ubicaciones predeterminadas si el backend no las tiene
      if (error?.response?.status === 404) {
        const defaultLocations: Location[] = [
          {
            _id: 'default-biblioteca',
            name: 'Biblioteca Principal',
            description: 'Área principal de la biblioteca',
            code: 'BIB-001',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-deposito',
            name: 'Depósito',
            description: 'Área de almacenamiento',
            code: 'DEP-001',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-salon',
            name: 'Salón de Lectura',
            description: 'Área de lectura y estudio',
            code: 'SAL-001',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        return defaultLocations;
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
   * Crear ubicación
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
   * Actualizar ubicación
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
   * Eliminar ubicación
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

// ===== QUERY KEYS =====
export const LOCATION_QUERY_KEYS = {
  locations: ['locations'] as const,
  locationsList: (filters: LocationFilters) => ['locations', 'list', filters] as const,
  location: (id: string) => ['locations', 'detail', id] as const,
} as const;

// ===== HOOKS =====

/**
 * Hook para obtener lista de ubicaciones
 */
export function useLocations(
  filters: LocationFilters = {},
  options?: Omit<UseQueryOptions<Location[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.locationsList(filters),
    queryFn: () => LocationService.getLocations(filters),
    staleTime: 15 * 60 * 1000, // 15 minutos - ubicaciones cambian poco
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener ubicación por ID
 */
export function useLocation(
  id: string,
  options?: Omit<UseQueryOptions<Location>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.location(id),
    queryFn: () => LocationService.getLocationById(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear ubicación
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) => LocationService.createLocation(data),
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      toast.success(`Ubicación "${newLocation.name}" creada exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear ubicación';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar ubicación
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      LocationService.updateLocation(id, data),
    onSuccess: (updatedLocation, { id }) => {
      queryClient.setQueryData(LOCATION_QUERY_KEYS.location(id), updatedLocation);
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      toast.success(`Ubicación "${updatedLocation.name}" actualizada exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar ubicación';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar ubicación
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LocationService.deleteLocation(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: LOCATION_QUERY_KEYS.location(deletedId) });
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      toast.success('Ubicación eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar ubicación';
      toast.error(message);
    },
  });
}

/**
 * Hook para obtener ubicaciones activas (utilidad común)
 */
export function useActiveLocations() {
  return useLocations({ active: true }, {
    staleTime: 30 * 60 * 1000, // 30 minutos para ubicaciones activas
  });
}