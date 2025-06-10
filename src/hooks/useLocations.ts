// src/hooks/useLocations.ts - SIMPLIFICADO SIN ESTADÍSTICAS
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { LocationService } from '@/services/location.service';
import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationFilters,
} from '@/services/location.service';
import type { PaginatedResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

export const LOCATION_QUERY_KEYS = {
  locations: ['locations'] as const,
  locationsList: (filters: LocationFilters) => ['locations', 'list', filters] as const,
  location: (id: string) => ['locations', 'detail', id] as const,
  // ✅ REMOVIDO: locationStats ya no se usa
} as const;

/**
 * Hook para obtener lista de ubicaciones con filtros
 */
export function useLocations(
  filters: LocationFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Location> | Location[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.locationsList(filters),
    queryFn: async () => {
      try {
        // Intentar obtener respuesta paginada
        const response = await LocationService.getLocations(filters);
        return response;
      } catch (error: any) {
        // Si el backend aún no soporta paginación, manejar como array simple
        if (error?.response?.status === 404 || error?.message?.includes('pagination')) {
          console.warn('API de ubicaciones no soporta paginación, usando formato simple');
          
          // Hacer una llamada más simple si existe endpoint alternativo
          try {
            const simpleResponse = await fetch('/api/locations');
            if (simpleResponse.ok) {
              const data = await simpleResponse.json();
              return Array.isArray(data) ? data : data.data || [];
            }
          } catch (simpleError) {
            console.error('Error en llamada simple a ubicaciones:', simpleError);
          }
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // No reintentar en errores 4xx
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    // En caso de error, devolver array vacío
    placeholderData: [] as Location[],
    ...options,
  });
}

/**
 * Hook para obtener una ubicación por ID
 */
export function useLocation(
  id: string,
  options?: Omit<UseQueryOptions<Location>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.location(id),
    queryFn: () => LocationService.getLocationById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

// ✅ REMOVIDO: useLocationStats - Ya no se usa

/**
 * Hook para crear una ubicación
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) => LocationService.createLocation(data),
    onSuccess: (newLocation) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      
      // Agregar al cache
      queryClient.setQueryData(LOCATION_QUERY_KEYS.location(newLocation._id), newLocation);
      
      toast.success(`Ubicación "${newLocation.name}" creada exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear ubicación';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar una ubicación
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) => 
      LocationService.updateLocation(id, data),
    onSuccess: (updatedLocation) => {
      // Actualizar cache específico
      queryClient.setQueryData(LOCATION_QUERY_KEYS.location(updatedLocation._id), updatedLocation);
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      
      toast.success(`Ubicación "${updatedLocation.name}" actualizada exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar ubicación';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para eliminar una ubicación
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LocationService.deleteLocation(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: LOCATION_QUERY_KEYS.location(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      
      toast.success('Ubicación eliminada exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar ubicación';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}