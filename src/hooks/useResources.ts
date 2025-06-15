// src/hooks/useResources.ts - VERSIÓN CORREGIDA
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ResourceService } from '@/services/resource.service';
import type {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
  Category,
  Author,
  Publisher,
  Location,
  ResourceType,
  ResourceState,
  GoogleBooksVolume,
  CreateResourceFromGoogleBooksRequest,
} from '@/types/resource.types';
import type { PaginatedResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

// Query keys para React Query
export const RESOURCE_QUERY_KEYS = {
  resources: ['resources'] as const,
  resourcesList: (filters: ResourceFilters) => ['resources', 'list', filters] as const,
  resource: (id: string) => ['resources', 'detail', id] as const,
  resourceByISBN: (isbn: string) => ['resources', 'isbn', isbn] as const,
  
  // Entidades auxiliares
  categories: ['resources', 'categories'] as const,
  authors: ['resources', 'authors'] as const,
  publishers: ['resources', 'publishers'] as const,
  locations: ['resources', 'locations'] as const,
  resourceTypes: ['resources', 'types'] as const,
  resourceStates: ['resources', 'states'] as const,
  
  // Google Books
  googleBooksSearch: (query: string) => ['google-books', 'search', query] as const,
  googleBooksStatus: ['google-books', 'status'] as const,
} as const;

/**
 * Hook para obtener lista de recursos con filtros - CORREGIDO
 */
export function useResources(
  filters: ResourceFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Resource>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourcesList(filters),
    queryFn: async () => {
      try {
        console.log('🔍 useResources: Obteniendo recursos con filtros:', filters);
        return await ResourceService.getResources(filters);
      } catch (error: any) {
        console.error('❌ useResources: Error al obtener recursos:', error);
        
        // Si es error 500, intentar con fallback
        if (error?.response?.status === 500) {
          console.warn('🔄 useResources: Intentando fallback...');
          return ResourceService.getResourcesWithFallback(filters);
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // No reintentar en errores 400-499 (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

/**
 * Hook para búsqueda simple de recursos (optimizado para componentes)
 */
export function useSearchResources(query: string, limit: number = 10, availableOnly: boolean = true) {
  return useQuery({
    queryKey: ['resources', 'search', query, limit, availableOnly],
    queryFn: async () => {
      try {
        console.log('🔍 useSearchResources: Búsqueda simple:', { query, limit, availableOnly });
        
        const filters: ResourceFilters = {
          search: query.trim(),
          limit: Math.min(limit, 20),
          page: 1
        };
        
        if (availableOnly) {
          filters.availability = 'available';
        }
        
        const response = await ResourceService.getResources(filters);
        console.log(`✅ useSearchResources: ${response.data.length} recursos encontrados`);
        
        return response.data; // Devolver solo el array de recursos
      } catch (error: any) {
        console.error('❌ useSearchResources: Error en búsqueda:', error);
        return []; // Devolver array vacío en caso de error
      }
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}

/**
 * Hook para obtener un recurso por ID
 */
export function useResource(
  id: string,
  options?: Omit<UseQueryOptions<Resource>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resource(id),
    queryFn: () => ResourceService.getResourceById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para buscar recurso por ISBN
 */
export function useResourceByISBN(
  isbn: string,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<Resource>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourceByISBN(isbn),
    queryFn: () => ResourceService.getResourceByISBN(isbn),
    enabled: enabled && !!isbn && isbn.length >= 10,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

/**
 * Hook para obtener categorías
 */
export function useCategories(
  options?: Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.categories,
    queryFn: ResourceService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutos - datos que cambian poco
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnMount: false,
    ...options,
  });
}

/**
 * Hook para obtener autores
 */
export function useAuthors(
  options?: Omit<UseQueryOptions<Author[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.authors,
    queryFn: ResourceService.getAuthors,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para buscar autores
 */
export function useAuthorSearch(query: string, limit = 20) {
  return useQuery({
    queryKey: ['authors', 'search', query, limit],
    queryFn: () => ResourceService.searchAuthors(query, limit),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook para obtener editoriales
 */
export function usePublishers(
  options?: Omit<UseQueryOptions<Publisher[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.publishers,
    queryFn: ResourceService.getPublishers,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnMount: false,
    ...options,
  });
}

/**
 * Hook para obtener ubicaciones
 */
export function useLocations(
  options?: Omit<UseQueryOptions<Location[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.locations,
    queryFn: ResourceService.getLocations,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnMount: false,
    ...options,
  });
}

/**
 * Hook para obtener tipos de recursos
 */
export function useResourceTypes(
  options?: Omit<UseQueryOptions<ResourceType[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourceTypes,
    queryFn: ResourceService.getResourceTypes,
    staleTime: 60 * 60 * 1000, // 1 hora - datos muy estables
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    retry: 2,
    refetchOnMount: false,
    ...options,
  });
}

/**
 * Hook para obtener estados de recursos
 */
export function useResourceStates(
  options?: Omit<UseQueryOptions<ResourceState[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourceStates,
    queryFn: ResourceService.getResourceStates,
    staleTime: 60 * 60 * 1000, // 1 hora - datos muy estables
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    retry: 2,
    refetchOnMount: false,
    ...options,
  });
}

/**
 * Hook para crear un recurso
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceRequest) => ResourceService.createResource(data),
    onSuccess: (newResource) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      // Agregar al cache
      queryClient.setQueryData(
        RESOURCE_QUERY_KEYS.resource(newResource._id),
        newResource
      );

      toast.success(`Recurso "${newResource.title}" creado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar un recurso
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceRequest }) => 
      ResourceService.updateResource(id, data),
    onSuccess: (updatedResource) => {
      // Actualizar cache específico
      queryClient.setQueryData(
        RESOURCE_QUERY_KEYS.resource(updatedResource._id),
        updatedResource
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      toast.success(`Recurso "${updatedResource.title}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar disponibilidad
 */
export function useUpdateResourceAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) => 
      ResourceService.updateResourceAvailability(id, available),
    onSuccess: (updatedResource) => {
      // Actualizar cache
      queryClient.setQueryData(
        RESOURCE_QUERY_KEYS.resource(updatedResource._id),
        updatedResource
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      const status = updatedResource.available ? 'disponible' : 'no disponible';
      toast.success(`Recurso marcado como ${status}`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar disponibilidad';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para eliminar un recurso
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceService.deleteResource(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: RESOURCE_QUERY_KEYS.resource(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      toast.success('Recurso eliminado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para crear autor
 */
export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; biography?: string }) => ResourceService.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.authors });
      toast.success('Autor creado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear autor';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para crear múltiples autores
 */
export function useBulkCreateAuthors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (names: string[]) => ResourceService.bulkCreateAuthors(names),
    onSuccess: (newAuthors) => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.authors });
      toast.success(`${newAuthors.length} autor(es) creado(s) exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear autores';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para buscar o crear editorial
 */
export function useFindOrCreatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => ResourceService.findOrCreatePublisher(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.publishers });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al buscar/crear editorial';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para búsqueda de Google Books
 */
export function useGoogleBooksSearch(query: string, maxResults = 10) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.googleBooksSearch(query),
    queryFn: () => ResourceService.searchGoogleBooks(query, maxResults),
    enabled: query.length >= 3,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
  });
}

/**
 * Hook para crear recurso desde Google Books
 */
export function useCreateResourceFromGoogleBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceFromGoogleBooksRequest) => 
      ResourceService.createResourceFromGoogleBooks(data),
    onSuccess: (newResource) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      // Agregar al cache
      queryClient.setQueryData(
        RESOURCE_QUERY_KEYS.resource(newResource._id),
        newResource
      );

      toast.success(`Recurso "${newResource.title}" importado desde Google Books exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al importar desde Google Books';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para verificar estado de Google Books API
 */
export function useGoogleBooksStatus() {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.googleBooksStatus,
    queryFn: ResourceService.checkGoogleBooksStatus,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: 1,
  });
}