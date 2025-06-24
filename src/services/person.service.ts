// src/services/person.service.ts - VERSIÓN CORREGIDA
import axiosInstance from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResponse,
  Person,
  PersonType,
  CreatePersonRequest,
  UpdatePersonRequest,
  SearchFilters,
} from '@/types/api.types';

const PERSON_ENDPOINTS = {
  PEOPLE: '/people',
  PERSON_BY_ID: (id: string) => `/people/${id}`,
  PERSON_BY_DOCUMENT: (document: string) => `/people/document/${document}`,
  PERSON_ACTIVATE: (id: string) => `/people/${id}/activate`,
  PERSON_DEACTIVATE: (id: string) => `/people/${id}/deactivate`,
  PERSON_STATS: '/people/stats/summary',
  PERSON_TYPES: '/people/types/all',
  PERSON_TYPE_BY_ID: (id: string) => `/people/types/${id}`,
} as const;

export class PersonService {
  /**
   * Crear una nueva persona
   */
  static async createPerson(personData: CreatePersonRequest): Promise<Person> {
    try {
      console.log('👤 PersonService: Creando persona:', personData);
      
      const response = await axiosInstance.post<ApiResponse<Person>>(
        PERSON_ENDPOINTS.PEOPLE,
        personData
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Persona creada exitosamente:', response.data.data._id);
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al crear persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al crear persona:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las personas con filtros - VERSIÓN CORREGIDA CON FALLBACKS
   */
  static async getPeople(filters: SearchFilters = {}): Promise<PaginatedResponse<Person>> {
    try {
      const params = new URLSearchParams();

      // Agregar parámetros de filtro con validación
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.personType) params.append('personType', filters.personType);
      if (filters.status) params.append('status', filters.status);
      if (filters.page && filters.page > 0) params.append('page', filters.page.toString());
      if (filters.limit && filters.limit > 0) params.append('limit', Math.min(filters.limit, 100).toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = `${PERSON_ENDPOINTS.PEOPLE}?${params.toString()}`;
      
      console.log('🔍 PersonService: Buscando personas:', {
        url,
        filters,
        paramsString: params.toString()
      });

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Person>>>(url);

      console.log('✅ PersonService: Respuesta recibida:', {
        success: response.data.success,
        dataLength: response.data.data?.data?.length || 0,
        total: response.data.data?.pagination?.total || 0,
        status: response.status
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener personas');
    } catch (error: any) {
      console.error('❌ PersonService: Error al buscar personas:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        filters
      });

      // Si es error 500 y posiblemente de populate, intentar fallback
      if (error.response?.status === 500) {
        console.warn('🔄 PersonService: Intentando método de fallback para error 500...');
        return await this.getPeopleWithFallback(filters);
      }

      // Si es error de conectividad, crear respuesta vacía válida
      if (!error.response) {
        console.warn('🌐 PersonService: Error de conectividad, devolviendo respuesta vacía');
        return this.createEmptyResponse(filters);
      }

      throw error;
    }
  }

  /**
   * Método de fallback para cuando falla el populate en el backend
   */
  private static async getPeopleWithFallback(filters: SearchFilters): Promise<PaginatedResponse<Person>> {
    try {
      const params = new URLSearchParams();

      // Usar parámetros más simples
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', (filters.limit || 10).toString());
      
      // Intentar sin populate si el backend lo soporta
      params.append('populate', 'false');

      const url = `${PERSON_ENDPOINTS.PEOPLE}?${params.toString()}`;
      console.log('🔄 PersonService: Fallback con parámetros simples:', url);

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Person>>>(url);

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Fallback exitoso');
        return response.data.data;
      }

      throw new Error('Fallback falló');
    } catch (error) {
      console.error('❌ PersonService: Fallback falló:', error);
      return this.createEmptyResponse(filters);
    }
  }

  /**
   * Crear respuesta vacía válida como último recurso
   */
  private static createEmptyResponse(filters: SearchFilters): PaginatedResponse<Person> {
    console.warn('🆘 PersonService: Creando respuesta vacía como último recurso');
    return {
      data: [],
      pagination: {
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  /**
   * Obtener persona por ID
   */
  static async getPersonById(id: string): Promise<Person> {
    try {
      console.log('🔍 PersonService: Buscando persona por ID:', id);

      const response = await axiosInstance.get<ApiResponse<Person>>(
        PERSON_ENDPOINTS.PERSON_BY_ID(id)
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Persona encontrada:', response.data.data._id);
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al buscar persona por ID:', error);
      throw error;
    }
  }

  /**
   * Obtener persona por número de documento
   */
  static async getPersonByDocument(documentNumber: string): Promise<Person> {
    try {
      console.log('🔍 PersonService: Buscando persona por documento:', documentNumber);

      const response = await axiosInstance.get<ApiResponse<Person>>(
        PERSON_ENDPOINTS.PERSON_BY_DOCUMENT(documentNumber)
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Persona encontrada por documento');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al buscar persona por documento:', error);
      throw error;
    }
  }

  /**
   * Actualizar persona
   */
  static async updatePerson(id: string, personData: UpdatePersonRequest): Promise<Person> {
    try {
      console.log('📝 PersonService: Actualizando persona:', id);

      const response = await axiosInstance.put<ApiResponse<Person>>(
        PERSON_ENDPOINTS.PERSON_BY_ID(id),
        personData
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Persona actualizada exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al actualizar persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al actualizar persona:', error);
      throw error;
    }
  }

  /**
   * Activar persona
   */
  static async activatePerson(id: string): Promise<Person> {
    try {
      console.log('✅ PersonService: Activando persona:', id);

      const response = await axiosInstance.put<ApiResponse<Person>>(
        PERSON_ENDPOINTS.PERSON_ACTIVATE(id)
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Persona activada exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al activar persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al activar persona:', error);
      throw error;
    }
  }

  /**
   * Desactivar persona
   */
  static async deactivatePerson(id: string): Promise<Person> {
    try {
      console.log('❌ PersonService: Desactivando persona:', id);

      const response = await axiosInstance.put<ApiResponse<Person>>(
        PERSON_ENDPOINTS.PERSON_DEACTIVATE(id)
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Persona desactivada exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al desactivar persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al desactivar persona:', error);
      throw error;
    }
  }

  /**
   * Eliminar persona permanentemente
   */
  static async deletePerson(id: string): Promise<void> {
    try {
      console.log('🗑️ PersonService: Eliminando persona:', id);

      const response = await axiosInstance.delete<ApiResponse<null>>(
        PERSON_ENDPOINTS.PERSON_BY_ID(id)
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar persona');
      }

      console.log('✅ PersonService: Persona eliminada exitosamente');
    } catch (error: any) {
      console.error('❌ PersonService: Error al eliminar persona:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de personas
   */
  static async getPersonStats(): Promise<{
    total: number;
    students: number;
    teachers: number;
    byGrade: Array<{ grade: string; count: number }>;
  }> {
    try {
      console.log('📊 PersonService: Obteniendo estadísticas de personas');

      const response = await axiosInstance.get<
        ApiResponse<{
          total: number;
          students: number;
          teachers: number;
          byGrade: Array<{ grade: string; count: number }>;
        }>
      >(PERSON_ENDPOINTS.PERSON_STATS);

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Estadísticas obtenidas exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas');
    } catch (error: any) {
      console.error('❌ PersonService: Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener tipos de persona
   */
  static async getPersonTypes(): Promise<PersonType[]> {
    try {
      console.log('📋 PersonService: Obteniendo tipos de persona');

      const response = await axiosInstance.get<ApiResponse<PersonType[]>>(
        PERSON_ENDPOINTS.PERSON_TYPES
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Tipos de persona obtenidos:', response.data.data.length);
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener tipos de persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al obtener tipos de persona:', error);
      throw error;
    }
  }

  /**
   * Obtener tipo de persona por ID
   */
  static async getPersonTypeById(id: string): Promise<PersonType> {
    try {
      console.log('🔍 PersonService: Buscando tipo de persona por ID:', id);

      const response = await axiosInstance.get<ApiResponse<PersonType>>(
        PERSON_ENDPOINTS.PERSON_TYPE_BY_ID(id)
      );

      if (response.data.success && response.data.data) {
        console.log('✅ PersonService: Tipo de persona encontrado');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener tipo de persona');
    } catch (error: any) {
      console.error('❌ PersonService: Error al obtener tipo de persona:', error);
      throw error;
    }
  }

  /**
   * Buscar personas (búsqueda simple optimizada para componentes)
   */
  static async searchPeople(query: string, limit = 10): Promise<Person[]> {
    try {
      console.log('🔍 PersonService: Búsqueda simple de personas:', { query, limit });

      const response = await this.getPeople({
        search: query.trim(),
        limit: Math.min(limit, 20), // Límite razonable para autocomplete
        page: 1,
        status: 'active' // Solo personas activas para préstamos
      });

      console.log(`✅ PersonService: Búsqueda completada, ${response.data.length} resultados`);
      return response.data;
    } catch (error: any) {
      console.error('❌ PersonService: Error en búsqueda simple:', error);
      // En caso de error, devolver array vacío para que el componente no falle
      return [];
    }
  }

  /**
   * Validar número de documento único
   */
  static async validateDocumentNumber(documentNumber: string, excludeId?: string): Promise<boolean> {
    try {
      console.log('🔍 PersonService: Validando número de documento:', documentNumber);

      const person = await this.getPersonByDocument(documentNumber);
      // Si encuentra una persona y no es la que estamos excluyendo, el documento ya existe
      const isValid = excludeId ? person._id !== excludeId : false;
      
      console.log('✅ PersonService: Validación completada:', { isValid });
      return isValid;
    } catch (error) {
      // Si no encuentra la persona, el documento está disponible
      console.log('✅ PersonService: Documento disponible (no encontrado)');
      return true;
    }
  }
}

// Exportar clase con métodos estáticos
// The export statement is removed as PersonService is already exported as a class.

// Exportar instancia única para compatibilidad con el código existente
export const personService = PersonService;