// src/services/personErrorRecovery.service.ts
import { PersonService } from './person.service';
import type { 
  PaginatedResponse, 
  Person, 
  SearchFilters,
  ApiResponse 
} from '@/types/api.types';
import axiosInstance from '@/lib/axios';

/**
 * Servicio alternativo para manejar errores del backend en la gestión de personas
 * Proporciona fallbacks y recuperación de errores para problemas de populate
 */
export class PersonErrorRecoveryService {
  
  /**
   * Intenta obtener personas con diferentes estrategias si falla el populate
   */
  static async getPeopleWithFallback(filters: SearchFilters): Promise<PaginatedResponse<Person>> {
    try {
      // Intentar el método normal primero
      return await PersonService.getPeople(filters);
    } catch (error: any) {
      // Si es error 500 y menciona populate, intentar estrategia alternativa
      if (error?.response?.status === 500 && 
          error?.response?.data?.message?.includes('populate')) {
        
        console.warn('Error de populate detectado, intentando método alternativo...');
        return await this.getPeopleWithoutPopulate(filters);
      }
      
      // Si es otro tipo de error, relanzarlo
      throw error;
    }
  }

  /**
   * Obtiene personas sin depender del populate del backend
   */
  private static async getPeopleWithoutPopulate(filters: SearchFilters): Promise<PaginatedResponse<Person>> {
    const params = new URLSearchParams();

    // Agregar parámetros de filtro
    if (filters.search) params.append('search', filters.search);
    if (filters.personType) params.append('personType', filters.personType);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    try {
      // Intentar hacer una petición más simple que no requiera populate
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Person>>>(
        `/people?${params.toString()}&populate=false` // Indicar al backend que no haga populate
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener personas');
    } catch (error) {
      // Si aún falla, crear una respuesta vacía pero válida
      console.error('Error al obtener personas con método alternativo:', error);
      
      return {
        data: [],
        pagination: {
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  /**
   * Enriquece los datos de personas con información de tipos obtenida por separado
   */
  static async enrichPeopleWithTypes(
    peopleResponse: PaginatedResponse<Person>,
    personTypes: Array<{ _id: string; name: string; description: string }>
  ): Promise<PaginatedResponse<Person>> {
    
    const enrichedPeople = peopleResponse.data.map(person => {
      // Si ya tiene personType, devolverlo tal como está
      if (person.personType) return person;
      
      // Si no, buscar el tipo por personTypeId
      if (person.personTypeId) {
        const personType = personTypes.find(type => type._id === person.personTypeId);
        if (personType) {
          return { 
            ...person, 
            personType: {
              _id: personType._id,
              name: personType.name as 'student' | 'teacher',
              description: personType.description,
              active: true, // Asumir que está activo
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          };
        }
      }
      
      return person;
    });

    return {
      ...peopleResponse,
      data: enrichedPeople,
    };
  }
}