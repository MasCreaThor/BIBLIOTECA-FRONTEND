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
    const response = await axiosInstance.post<ApiResponse<Person>>(
      PERSON_ENDPOINTS.PEOPLE,
      personData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear persona');
  }

  /**
   * Obtener todas las personas con filtros
   */
  static async getPeople(filters: SearchFilters = {}): Promise<PaginatedResponse<Person>> {
    const params = new URLSearchParams();

    // Agregar parámetros de filtro
    if (filters.search) params.append('search', filters.search);
    if (filters.personType) params.append('personType', filters.personType);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Person>>>(
      `${PERSON_ENDPOINTS.PEOPLE}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener personas');
  }

  /**
   * Obtener persona por ID
   */
  static async getPersonById(id: string): Promise<Person> {
    const response = await axiosInstance.get<ApiResponse<Person>>(
      PERSON_ENDPOINTS.PERSON_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener persona');
  }

  /**
   * Obtener persona por número de documento
   */
  static async getPersonByDocument(documentNumber: string): Promise<Person> {
    const response = await axiosInstance.get<ApiResponse<Person>>(
      PERSON_ENDPOINTS.PERSON_BY_DOCUMENT(documentNumber)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener persona');
  }

  /**
   * Actualizar persona
   */
  static async updatePerson(id: string, personData: UpdatePersonRequest): Promise<Person> {
    const response = await axiosInstance.put<ApiResponse<Person>>(
      PERSON_ENDPOINTS.PERSON_BY_ID(id),
      personData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar persona');
  }

  /**
   * Activar persona
   */
  static async activatePerson(id: string): Promise<Person> {
    const response = await axiosInstance.put<ApiResponse<Person>>(
      PERSON_ENDPOINTS.PERSON_ACTIVATE(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al activar persona');
  }

  /**
   * Desactivar persona
   */
  static async deactivatePerson(id: string): Promise<Person> {
    const response = await axiosInstance.put<ApiResponse<Person>>(
      PERSON_ENDPOINTS.PERSON_DEACTIVATE(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al desactivar persona');
  }

  /**
   * Eliminar persona permanentemente
   */
  static async deletePerson(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      PERSON_ENDPOINTS.PERSON_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar persona');
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
    const response = await axiosInstance.get<
      ApiResponse<{
        total: number;
        students: number;
        teachers: number;
        byGrade: Array<{ grade: string; count: number }>;
      }>
    >(PERSON_ENDPOINTS.PERSON_STATS);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estadísticas');
  }

  /**
   * Obtener tipos de persona
   */
  static async getPersonTypes(): Promise<PersonType[]> {
    const response = await axiosInstance.get<ApiResponse<PersonType[]>>(
      PERSON_ENDPOINTS.PERSON_TYPES
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener tipos de persona');
  }

  /**
   * Obtener tipo de persona por ID
   */
  static async getPersonTypeById(id: string): Promise<PersonType> {
    const response = await axiosInstance.get<ApiResponse<PersonType>>(
      PERSON_ENDPOINTS.PERSON_TYPE_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener tipo de persona');
  }

  /**
   * Buscar personas (búsqueda simple)
   */
  static async searchPeople(query: string, limit = 10): Promise<Person[]> {
    const response = await this.getPeople({
      search: query,
      limit,
      page: 1,
    });

    return response.data;
  }

  /**
   * Validar número de documento único
   */
  static async validateDocumentNumber(documentNumber: string, excludeId?: string): Promise<boolean> {
    try {
      const person = await this.getPersonByDocument(documentNumber);
      // Si encuentra una persona y no es la que estamos excluyendo, el documento ya existe
      return excludeId ? person._id !== excludeId : false;
    } catch (error) {
      // Si no encuentra la persona, el documento está disponible
      return true;
    }
  }
}