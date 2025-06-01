import axiosInstance from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResponse,
  Resource,
  ResourceType,
  Category,
  Location,
  ResourceState,
  SearchFilters,
  GoogleBooksResponse,
} from '@/types/api.types';

const RESOURCE_ENDPOINTS = {
  RESOURCES: '/resources',
  RESOURCE_BY_ID: (id: string) => `/resources/${id}`,
  RESOURCE_TYPES: '/resources/types',
  CATEGORIES: '/resources/categories',
  LOCATIONS: '/resources/locations',
  RESOURCE_STATES: '/resources/states',
  SEARCH: '/resources/search',
  GOOGLE_BOOKS: '/resources/google-books/search',
} as const;

export interface CreateResourceRequest {
  typeId: string;
  categoryId: string;
  title: string;
  authorIds?: string[];
  publisherId?: string;
  volumes?: number;
  stateId: string;
  locationId: string;
  notes?: string;
  isbn?: string;
  googleBooksId?: string;
}

export interface UpdateResourceRequest {
  typeId?: string;
  categoryId?: string;
  title?: string;
  authorIds?: string[];
  publisherId?: string;
  volumes?: number;
  stateId?: string;
  locationId?: string;
  notes?: string;
  isbn?: string;
  available?: boolean;
}

export class ResourceService {
  /**
   * Crear un nuevo recurso
   */
  static async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    const response = await axiosInstance.post<ApiResponse<Resource>>(
      RESOURCE_ENDPOINTS.RESOURCES,
      resourceData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear recurso');
  }

  /**
   * Obtener todos los recursos con filtros
   */
  static async getResources(filters: SearchFilters = {}): Promise<PaginatedResponse<Resource>> {
    const params = new URLSearchParams();

    // Agregar parámetros de filtro
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.resourceType) params.append('type', filters.resourceType);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Resource>>>(
      `${RESOURCE_ENDPOINTS.RESOURCES}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener recursos');
  }

  /**
   * Obtener recurso por ID
   */
  static async getResourceById(id: string): Promise<Resource> {
    const response = await axiosInstance.get<ApiResponse<Resource>>(
      RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener recurso');
  }

  /**
   * Actualizar recurso
   */
  static async updateResource(id: string, resourceData: UpdateResourceRequest): Promise<Resource> {
    const response = await axiosInstance.put<ApiResponse<Resource>>(
      RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id),
      resourceData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar recurso');
  }

  /**
   * Eliminar recurso
   */
  static async deleteResource(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar recurso');
    }
  }

  /**
   * Buscar recursos (búsqueda simple)
   */
  static async searchResources(query: string, limit = 10): Promise<Resource[]> {
    const response = await this.getResources({
      search: query,
      limit,
      page: 1,
    });

    return response.data;
  }

  /**
   * Obtener tipos de recursos
   */
  static async getResourceTypes(): Promise<ResourceType[]> {
    const response = await axiosInstance.get<ApiResponse<ResourceType[]>>(
      RESOURCE_ENDPOINTS.RESOURCE_TYPES
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener tipos de recursos');
  }

  /**
   * Obtener categorías
   */
  static async getCategories(): Promise<Category[]> {
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      RESOURCE_ENDPOINTS.CATEGORIES
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener categorías');
  }

  /**
   * Obtener ubicaciones
   */
  static async getLocations(): Promise<Location[]> {
    const response = await axiosInstance.get<ApiResponse<Location[]>>(
      RESOURCE_ENDPOINTS.LOCATIONS
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener ubicaciones');
  }

  /**
   * Obtener estados de recursos
   */
  static async getResourceStates(): Promise<ResourceState[]> {
    const response = await axiosInstance.get<ApiResponse<ResourceState[]>>(
      RESOURCE_ENDPOINTS.RESOURCE_STATES
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estados de recursos');
  }

  /**
   * Buscar en Google Books
   */
  static async searchGoogleBooks(query: string): Promise<GoogleBooksResponse> {
    const response = await axiosInstance.get<ApiResponse<GoogleBooksResponse>>(
      `${RESOURCE_ENDPOINTS.GOOGLE_BOOKS}?q=${encodeURIComponent(query)}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al buscar en Google Books');
  }

  /**
   * Verificar disponibilidad de recurso
   */
  static async checkResourceAvailability(id: string): Promise<boolean> {
    try {
      const resource = await this.getResourceById(id);
      return resource.available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener recursos disponibles para préstamo
   */
  static async getAvailableResources(filters: SearchFilters = {}): Promise<PaginatedResponse<Resource>> {
    return this.getResources({
      ...filters,
      status: 'available',
    });
  }

  /**
   * Obtener recursos por categoría
   */
  static async getResourcesByCategory(categoryId: string, filters: SearchFilters = {}): Promise<PaginatedResponse<Resource>> {
    return this.getResources({
      ...filters,
      category: categoryId,
    });
  }

  /**
   * Obtener recursos por tipo
   */
  static async getResourcesByType(type: string, filters: SearchFilters = {}): Promise<PaginatedResponse<Resource>> {
    return this.getResources({
      ...filters,
      resourceType: type as any,
    });
  }

  /**
   * Obtener recursos populares (más prestados)
   */
  static async getPopularResources(limit = 10): Promise<Resource[]> {
    // Esto se implementará cuando tengamos el endpoint de estadísticas
    const response = await this.getResources({
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc',
    });

    return response.data;
  }
}