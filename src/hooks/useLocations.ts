// src/hooks/useLocations.ts - VERSIÓN CON DEBUG PARA CAMPO CODE
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

// Query keys para React Query
export const LOCATION_QUERY_KEYS = {
  locations: ['locations'] as const,
  locationsList: (filters: LocationFilters) => ['locations', 'list', filters] as const,
  location: (id: string) => ['locations', 'detail', id] as const,
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
        const response = await LocationService.getLocations(filters);
        return response;
      } catch (error: any) {
        // Si el backend aún no soporta paginación, manejar como array simple
        if (error?.response?.status === 404 || error?.message?.includes('pagination')) {
          console.warn('API de ubicaciones no soporta paginación, usando formato simple');
          
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

/**
 * Hook para crear una ubicación
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) => {
      console.log('🆕 Creando ubicación con datos:', data);
      return LocationService.createLocation(data);
    },
    onSuccess: (newLocation) => {
      console.log('✅ Ubicación creada exitosamente:', newLocation);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      
      // Agregar al cache
      queryClient.setQueryData(LOCATION_QUERY_KEYS.location(newLocation._id), newLocation);
      
      toast.success(`Ubicación "${newLocation.name}" creada exitosamente`);
    },
    onError: (error: any) => {
      console.error('❌ Error creando ubicación:', error);
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
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) => {
      console.log(`🔄 Actualizando ubicación ${id} con datos:`, data);
      
      // ✅ DEBUG: Verificar que el campo code se incluye correctamente
      if (data.hasOwnProperty('code')) {
        console.log(`📝 Campo code detectado: "${data.code}" (tipo: ${typeof data.code})`);
      } else {
        console.log('⚠️ Campo code no presente en los datos de actualización');
      }
      
      return LocationService.updateLocation(id, data);
    },
    onSuccess: (updatedLocation) => {
      console.log('✅ Ubicación actualizada exitosamente:', updatedLocation);
      
      // ✅ DEBUG: Verificar el valor del código en la respuesta
      console.log(`📝 Código actualizado: "${updatedLocation.code}" (tipo: ${typeof updatedLocation.code})`);
      
      // Actualizar cache específico
      queryClient.setQueryData(LOCATION_QUERY_KEYS.location(updatedLocation._id), updatedLocation);
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      
      toast.success(`Ubicación "${updatedLocation.name}" actualizada exitosamente`);
    },
    onError: (error: any) => {
      console.error('❌ Error actualizando ubicación:', error);
      console.error('❌ Detalles del error:', error?.response?.data);
      
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
    mutationFn: (id: string) => {
      console.log(`🗑️ Eliminando ubicación ${id}`);
      return LocationService.deleteLocation(id);
    },
    onSuccess: (_, deletedId) => {
      console.log(`✅ Ubicación ${deletedId} eliminada exitosamente`);
      
      // Remover del cache
      queryClient.removeQueries({ queryKey: LOCATION_QUERY_KEYS.location(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.locations });
      
      toast.success('Ubicación eliminada exitosamente');
    },
    onError: (error: any) => {
      console.error('❌ Error eliminando ubicación:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar ubicación';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}