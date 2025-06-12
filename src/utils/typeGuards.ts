// src/utils/typeGuards.ts
import type { PaginatedResponse } from '@/types/api.types';

/**
 * Type guards para manejar respuestas que pueden ser paginadas o arrays directos
 * Esto evita errores de TypeScript cuando el backend puede devolver ambos formatos
 */

/**
 * Type guard genérico para verificar si una respuesta es paginada
 */
export function isPaginatedResponse<T>(
  response: PaginatedResponse<T> | T[] | undefined | null
): response is PaginatedResponse<T> {
  return (
    response !== null &&
    response !== undefined &&
    typeof response === 'object' &&
    !Array.isArray(response) &&
    'data' in response &&
    'pagination' in response &&
    Array.isArray(response.data)
  );
}

/**
 * Type guard para verificar si es un array directo
 */
export function isDirectArray<T>(
  response: PaginatedResponse<T> | T[] | undefined | null
): response is T[] {
  return Array.isArray(response);
}

/**
 * Extrae datos de una respuesta que puede ser paginada o array directo
 * @param response - La respuesta del API que puede ser PaginatedResponse<T> | T[]
 * @returns Objeto con los datos extraídos y el total count
 */
export function extractResponseData<T>(
  response: PaginatedResponse<T> | T[] | undefined | null
): { data: T[]; totalCount: number } {
  // Si no hay respuesta, devolver datos vacíos
  if (!response) {
    return { data: [], totalCount: 0 };
  }

  // Si es una respuesta paginada
  if (isPaginatedResponse(response)) {
    return {
      data: response.data,
      totalCount: response.pagination.total,
    };
  }

  // Si es un array directo
  if (isDirectArray(response)) {
    return {
      data: response,
      totalCount: response.length,
    };
  }

  // Fallback para casos inesperados
  console.warn('Respuesta con formato inesperado:', response);
  return { data: [], totalCount: 0 };
}

/**
 * Hook personalizado para extraer datos de manera type-safe
 * @param response - La respuesta del API
 * @returns Datos extraídos listos para usar en componentes
 */
export function useExtractedData<T>(
  response: PaginatedResponse<T> | T[] | undefined | null
) {
  const { data, totalCount } = extractResponseData(response);
  
  return {
    items: data,
    totalCount,
    isEmpty: data.length === 0,
    hasItems: data.length > 0,
  };
}

/**
 * Type guards específicos para diferentes tipos de datos
 */

// Para ubicaciones
export function isLocationsPaginatedResponse(
  response: any
): response is PaginatedResponse<import('@/services/location.service').Location> {
  return isPaginatedResponse(response);
}

// Para categorías
export function isCategoriesPaginatedResponse(
  response: any
): response is PaginatedResponse<import('@/services/category.service').Category> {
  return isPaginatedResponse(response);
}

// Para tipos de recursos
export function isResourceTypesPaginatedResponse(
  response: any
): response is PaginatedResponse<import('@/services/resourceType.service').ResourceType> {
  return isPaginatedResponse(response);
}

/**
 * Utility para debugging - muestra el formato de la respuesta
 */
export function debugResponseFormat<T>(
  response: PaginatedResponse<T> | T[] | undefined | null,
  componentName: string
) {
  if (process.env.NODE_ENV === 'development') {
    if (!response) {
      console.log(`[${componentName}] Respuesta vacía o undefined`);
    } else if (isPaginatedResponse(response)) {
      console.log(`[${componentName}] Respuesta paginada:`, {
        dataLength: response.data.length,
        total: response.pagination.total,
        page: response.pagination.page,
      });
    } else if (isDirectArray(response)) {
      console.log(`[${componentName}] Array directo:`, {
        length: response.length,
      });
    } else {
      console.warn(`[${componentName}] Formato de respuesta no reconocido:`, response);
    }
  }
}