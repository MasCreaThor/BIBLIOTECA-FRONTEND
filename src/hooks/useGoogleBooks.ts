// src/hooks/useGoogleBooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleBooksService } from '@/services/google-books.service';
import type {
  GoogleBooksVolume,
  CreateResourceFromGoogleBooksRequest,
  Resource,
} from '@/types/resource.types';
import { RESOURCE_QUERY_KEYS } from './useResources';
import toast from 'react-hot-toast';

/**
 * Hook para verificar el estado de Google Books API
 */
export function useGoogleBooksStatus() {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.googleBooksStatus,
    queryFn: GoogleBooksService.checkGoogleBooksStatus,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchInterval: 15 * 60 * 1000, // Verificar cada 15 minutos
    retry: 1,
  });
}

/**
 * Hook para buscar libros en Google Books
 */
export function useGoogleBooksSearch(
  query: string,
  maxResults = 10,
  enabled = true
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.googleBooksSearch(query),
    queryFn: () => GoogleBooksService.searchGoogleBooks(query, maxResults),
    enabled: enabled && query.length >= 3,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });
}

/**
 * Hook para crear un recurso desde Google Books
 */
export function useCreateResourceFromGoogleBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceFromGoogleBooksRequest) => 
      GoogleBooksService.createResourceFromGoogleBooks(data),
    onSuccess: (newResource: Resource) => {
      // Invalidar queries de recursos
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      // Agregar al cache
      queryClient.setQueryData(
        RESOURCE_QUERY_KEYS.resource(newResource._id),
        newResource
      );

      toast.success(`Libro "${newResource.title}" agregado desde Google Books`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear recurso desde Google Books';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook compuesto para manejar toda la funcionalidad de Google Books
 */
export function useGoogleBooks() {
  const statusQuery = useGoogleBooksStatus();
  const createFromGoogleBooksMutation = useCreateResourceFromGoogleBooks();

  // Estado derivado
  const isApiAvailable = statusQuery.data?.apiAvailable ?? false;
  const isLoading = statusQuery.isLoading;
  const error = statusQuery.error;

  return {
    // Estado de la API
    isApiAvailable,
    isLoading,
    error,
    statusData: statusQuery.data,
    
    // Mutaciones
    createFromGoogleBooks: createFromGoogleBooksMutation.mutateAsync,
    isCreating: createFromGoogleBooksMutation.isPending,
    
    // Funciones de utilidad
    refetchStatus: statusQuery.refetch,
  };
}

/**
 * Utilidades para trabajar con datos de Google Books
 */
export const GoogleBooksUtils = {
  /**
   * Extrae el ISBN-13 de un volumen de Google Books
   */
  getISBN13: (volume: GoogleBooksVolume): string | undefined => {
    return volume.industryIdentifiers?.find(
      identifier => identifier.type === 'ISBN_13'
    )?.identifier;
  },

  /**
   * Extrae el ISBN-10 de un volumen de Google Books
   */
  getISBN10: (volume: GoogleBooksVolume): string | undefined => {
    return volume.industryIdentifiers?.find(
      identifier => identifier.type === 'ISBN_10'
    )?.identifier;
  },

  /**
   * Obtiene cualquier ISBN disponible
   */
  getAnyISBN: (volume: GoogleBooksVolume): string | undefined => {
    return GoogleBooksUtils.getISBN13(volume) || 
           GoogleBooksUtils.getISBN10(volume);
  },

  /**
   * Formatea los autores como string
   */
  formatAuthors: (volume: GoogleBooksVolume): string => {
    if (!volume.authors || volume.authors.length === 0) {
      return 'Autor desconocido';
    }
    
    if (volume.authors.length === 1) {
      return volume.authors[0];
    }
    
    if (volume.authors.length === 2) {
      return volume.authors.join(' y ');
    }
    
    return `${volume.authors.slice(0, -1).join(', ')} y ${volume.authors[volume.authors.length - 1]}`;
  },

  /**
   * Obtiene la URL de imagen más grande disponible
   */
  getBestImageUrl: (volume: GoogleBooksVolume): string | undefined => {
    const images = volume.imageLinks;
    if (!images) return undefined;
    
    // Preferencia de tamaño: large > medium > small > thumbnail
    return images.large || 
           images.medium || 
           images.small || 
           images.thumbnail;
  },

  /**
   * Trunca la descripción a un número específico de caracteres
   */
  truncateDescription: (volume: GoogleBooksVolume, maxLength = 200): string => {
    if (!volume.description) return 'Sin descripción disponible';
    
    if (volume.description.length <= maxLength) {
      return volume.description;
    }
    
    return volume.description.substring(0, maxLength).trim() + '...';
  },

  /**
   * Valida si un volumen tiene información mínima requerida
   */
  isValidVolume: (volume: GoogleBooksVolume): boolean => {
    return !!(volume.title && volume.title.trim());
  },

  /**
   * Obtiene el año de publicación
   */
  getPublicationYear: (volume: GoogleBooksVolume): number | undefined => {
    if (!volume.publishedDate) return undefined;
    
    const year = parseInt(volume.publishedDate.substring(0, 4));
    return isNaN(year) ? undefined : year;
  },
};