// src/services/resource.service.ts - VERSIÓN CORREGIDA
import axiosInstance from '@/lib/axios';
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
  ResourceResponse,
  ResourceListResponse,
  CategoryListResponse,
  AuthorListResponse,
  PublisherListResponse,
  LocationListResponse,
  ResourceTypeListResponse,
  ResourceStateListResponse,
  GoogleBooksSearchResponse,
} from '@/types/resource.types';

// Importar ApiResponse para respuestas específicas
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

const RESOURCE_ENDPOINTS = {
  RESOURCES: '/resources',
  RESOURCE_BY_ID: (id: string) => `/resources/${id}`,
  RESOURCE_BY_ISBN: (isbn: string) => `/resources/isbn/${isbn}`,
  AVAILABILITY: (id: string) => `/resources/${id}/availability`,
  
  // Entidades auxiliares
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  AUTHORS: '/authors',
  AUTHOR_BY_ID: (id: string) => `/authors/${id}`,
  AUTHOR_SEARCH: '/authors/search',
  AUTHOR_BULK_CREATE: '/authors/bulk-create',
  PUBLISHERS: '/publishers',
  PUBLISHER_BY_ID: (id: string) => `/publishers/${id}`,
  PUBLISHER_FIND_OR_CREATE: '/publishers/find-or-create',
  LOCATIONS: '/locations',
  LOCATION_BY_ID: (id: string) => `/locations/${id}`,
  RESOURCE_TYPES: '/resource-types',
  RESOURCE_STATES: '/resource-states',
  
  // Google Books
  GOOGLE_BOOKS_SEARCH: '/google-books/search',
  GOOGLE_BOOKS_ISBN: (isbn: string) => `/google-books/isbn/${isbn}`,
  GOOGLE_BOOKS_VOLUME: (id: string) => `/google-books/volume/${id}`,
  GOOGLE_BOOKS_STATUS: '/google-books/status',
  GOOGLE_BOOKS_CREATE: '/resources/google-books',
  GOOGLE_BOOKS_PREVIEW: (volumeId: string) => `/resources/google-books/preview/${volumeId}`,
  GOOGLE_BOOKS_CHECK: (volumeId: string) => `/resources/google-books/check/${volumeId}`,
} as const;

export class ResourceService {
  // ===== RECURSOS PRINCIPALES =====
  
  /**
   * Obtener recursos con filtros - VERSIÓN CORREGIDA CON MAPEO CORRECTO
   */
  static async getResources(filters: ResourceFilters = {}): Promise<PaginatedResponse<Resource>> {
    try {
      const params = new URLSearchParams();
      
      // Parámetros básicos con validación
      if (filters.page && filters.page > 0) params.append('page', filters.page.toString());
      if (filters.limit && filters.limit > 0) params.append('limit', Math.min(filters.limit, 100).toString());
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.typeId) params.append('typeId', filters.typeId);
      if (filters.locationId) params.append('locationId', filters.locationId);
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      // CORRECCIÓN CRÍTICA: Mapear correctamente el filtro de disponibilidad
      if (filters.availability) {
        params.append('availability', filters.availability);
      }
      // También manejar el caso donde venga 'available' como boolean (compatibilidad)
      else if ('available' in filters && typeof (filters as any).available === 'boolean') {
        params.append('availability', (filters as any).available ? 'available' : 'borrowed');
      }

      const url = `${RESOURCE_ENDPOINTS.RESOURCES}?${params.toString()}`;
      
      console.log('🔍 ResourceService: Buscando recursos con filtros:', {
        url,
        filters,
        params: params.toString()
      });

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Resource>>>(url);

      console.log('✅ ResourceService: Respuesta recibida:', {
        success: response.data.success,
        dataLength: response.data.data?.data?.length || 0,
        total: response.data.data?.pagination?.total || 0,
        status: response.status
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener recursos');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al buscar recursos:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        filters
      });
      
      // Si hay problema de conectividad
      if (!error.response) {
        console.error('🌐 ResourceService: Error de conectividad');
        return this.createEmptyResourceResponse(filters);
      }
      
      // Si es error 500, intentar método de fallback
      if (error.response?.status === 500) {
        console.warn('🔄 ResourceService: Intentando método de fallback...');
        return await this.getResourcesWithFallback(filters);
      }
      
      throw error;
    }
  }

  /**
   * Método de fallback para cuando falla la búsqueda principal
   */
  static async getResourcesWithFallback(filters: ResourceFilters): Promise<PaginatedResponse<Resource>> {
    try {
      // Intentar con parámetros más simples
      const params = new URLSearchParams();
      
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.limit) params.append('limit', (filters.limit || 10).toString());
      if (filters.availability) params.append('availability', filters.availability);
      
      // Solo filtros básicos sin populate
      params.append('populate', 'false');

      console.log('🔄 ResourceService: Fallback con parámetros simples:', params.toString());

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Resource>>>(
        `${RESOURCE_ENDPOINTS.RESOURCES}?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Fallback exitoso');
        return response.data.data;
      }

      throw new Error('Fallback falló');
    } catch (error) {
      console.error('❌ ResourceService: Fallback falló:', error);
      return this.createEmptyResourceResponse(filters);
    }
  }

  /**
   * Crear respuesta vacía válida como último recurso
   */
  private static createEmptyResourceResponse(filters: ResourceFilters): PaginatedResponse<Resource> {
    console.warn('🆘 ResourceService: Usando estructura vacía como último recurso');
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
   * Obtener recurso por ID
   */
  static async getResourceById(id: string): Promise<Resource> {
    try {
      console.log('🔍 ResourceService: Buscando recurso por ID:', id);

      const response = await axiosInstance.get<ResourceResponse>(
        RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id)
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recurso encontrado:', response.data.data._id);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener recurso');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al buscar recurso por ID:', error);
      throw error;
    }
  }
  
  /**
   * Buscar recursos disponibles (optimizado para componentes de búsqueda)
   */
  static async searchAvailableResources(query: string, limit = 10): Promise<Resource[]> {
    try {
      console.log('🔍 ResourceService: Búsqueda de recursos disponibles:', { query, limit });

      const response = await this.getResources({
        search: query.trim(),
        availability: 'available', // Solo recursos disponibles
        limit: Math.min(limit, 20), // Límite razonable para autocomplete
        page: 1
      });

      console.log(`✅ ResourceService: Búsqueda completada, ${response.data.length} resultados`);
      return response.data;
    } catch (error: any) {
      console.error('❌ ResourceService: Error en búsqueda de recursos disponibles:', error);
      // En caso de error, devolver array vacío para que el componente no falle
      return [];
    }
  }

  /**
   * Obtener recurso por ISBN
   */
  static async getResourceByISBN(isbn: string): Promise<Resource> {
    try {
      console.log('🔍 ResourceService: Buscando recurso por ISBN:', isbn);

      const response = await axiosInstance.get<ResourceResponse>(
        RESOURCE_ENDPOINTS.RESOURCE_BY_ISBN(isbn)
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recurso encontrado por ISBN');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al buscar por ISBN');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al buscar por ISBN:', error);
      throw error;
    }
  }
  
  /**
   * Crear nuevo recurso
   */
  static async createResource(data: CreateResourceRequest): Promise<Resource> {
    try {
      console.log('📝 ResourceService: Creando recurso:', data.title);

      const response = await axiosInstance.post<ResourceResponse>(
        RESOURCE_ENDPOINTS.RESOURCES,
        data
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recurso creado exitosamente:', response.data.data._id);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear recurso');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al crear recurso:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar recurso
   */
  static async updateResource(id: string, data: UpdateResourceRequest): Promise<Resource> {
    try {
      console.log('📝 ResourceService: Actualizando recurso:', id);

      const response = await axiosInstance.put<ResourceResponse>(
        RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id),
        data
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recurso actualizado exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar recurso');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al actualizar recurso:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar disponibilidad del recurso
   */
  static async updateResourceAvailability(id: string, available: boolean): Promise<Resource> {
    try {
      console.log('🔄 ResourceService: Actualizando disponibilidad:', { id, available });

      const response = await axiosInstance.put<ResourceResponse>(
        RESOURCE_ENDPOINTS.AVAILABILITY(id),
        { available }
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Disponibilidad actualizada exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar disponibilidad');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al actualizar disponibilidad:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar recurso
   */
  static async deleteResource(id: string): Promise<void> {
    try {
      console.log('🗑️ ResourceService: Eliminando recurso:', id);

      const response = await axiosInstance.delete(RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id));
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar recurso');
      }

      console.log('✅ ResourceService: Recurso eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al eliminar recurso:', error);
      throw error;
    }
  }
  
  // ===== CATEGORÍAS =====
  static async getCategories(): Promise<Category[]> {
    try {
      console.log('📁 ResourceService: Obteniendo categorías');

      const response = await axiosInstance.get<CategoryListResponse>(
        RESOURCE_ENDPOINTS.CATEGORIES
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Categorías obtenidas:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener categorías');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener categorías:', error);
      throw error;
    }
  }
  
  static async createCategory(data: { name: string; description: string; color?: string }): Promise<Category> {
    try {
      console.log('📝 ResourceService: Creando categoría:', data.name);

      const response = await axiosInstance.post<ApiResponse<Category>>(
        RESOURCE_ENDPOINTS.CATEGORIES,
        data
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Categoría creada exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear categoría');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al crear categoría:', error);
      throw error;
    }
  }
  
  // ===== AUTORES =====
  static async getAuthors(): Promise<Author[]> {
    try {
      console.log('👨‍💼 ResourceService: Obteniendo autores');

      const response = await axiosInstance.get<AuthorListResponse>(
        RESOURCE_ENDPOINTS.AUTHORS
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Autores obtenidos:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener autores');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener autores:', error);
      throw error;
    }
  }
  
  static async searchAuthors(query: string, limit = 20): Promise<Author[]> {
    try {
      console.log('🔍 ResourceService: Buscando autores:', { query, limit });

      const params = new URLSearchParams({
        q: query.trim(),
        limit: Math.min(limit, 50).toString(),
      });
      
      const response = await axiosInstance.get<AuthorListResponse>(
        `${RESOURCE_ENDPOINTS.AUTHOR_SEARCH}?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Autores encontrados:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al buscar autores');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al buscar autores:', error);
      return []; // Devolver array vacío en caso de error
    }
  }
  
  static async createAuthor(data: { name: string; biography?: string }): Promise<Author> {
    try {
      console.log('📝 ResourceService: Creando autor:', data.name);

      const response = await axiosInstance.post<ApiResponse<Author>>(
        RESOURCE_ENDPOINTS.AUTHORS,
        data
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Autor creado exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear autor');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al crear autor:', error);
      throw error;
    }
  }
  
  static async bulkCreateAuthors(names: string[]): Promise<Author[]> {
    try {
      console.log('📝 ResourceService: Creando autores en lote:', names.length);

      const response = await axiosInstance.post<AuthorListResponse>(
        RESOURCE_ENDPOINTS.AUTHOR_BULK_CREATE,
        { names }
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Autores creados exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear autores');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al crear autores en lote:', error);
      throw error;
    }
  }
  
  // ===== EDITORIALES =====
  static async getPublishers(): Promise<Publisher[]> {
    try {
      console.log('🏢 ResourceService: Obteniendo editoriales');

      const response = await axiosInstance.get<PublisherListResponse>(
        RESOURCE_ENDPOINTS.PUBLISHERS
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Editoriales obtenidas:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener editoriales');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener editoriales:', error);
      throw error;
    }
  }
  
  static async findOrCreatePublisher(name: string): Promise<Publisher> {
    try {
      console.log('🔍 ResourceService: Buscando o creando editorial:', name);

      const response = await axiosInstance.post<ApiResponse<Publisher>>(
        RESOURCE_ENDPOINTS.PUBLISHER_FIND_OR_CREATE,
        { name: name.trim() }
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Editorial procesada exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear editorial');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al procesar editorial:', error);
      throw error;
    }
  }
  
  // ===== UBICACIONES =====
  static async getLocations(): Promise<Location[]> {
    try {
      console.log('📍 ResourceService: Obteniendo ubicaciones');

      const response = await axiosInstance.get<LocationListResponse>(
        RESOURCE_ENDPOINTS.LOCATIONS
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Ubicaciones obtenidas:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener ubicaciones');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener ubicaciones:', error);
      throw error;
    }
  }
  
  // ===== TIPOS Y ESTADOS =====
  static async getResourceTypes(): Promise<ResourceType[]> {
    try {
      console.log('🏷️ ResourceService: Obteniendo tipos de recursos');

      const response = await axiosInstance.get<ResourceTypeListResponse>(
        RESOURCE_ENDPOINTS.RESOURCE_TYPES
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Tipos de recursos obtenidos:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener tipos de recursos');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener tipos de recursos:', error);
      throw error;
    }
  }
  
  static async getResourceStates(): Promise<ResourceState[]> {
    try {
      console.log('🏷️ ResourceService: Obteniendo estados de recursos');

      const response = await axiosInstance.get<ResourceStateListResponse>(
        RESOURCE_ENDPOINTS.RESOURCE_STATES
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Estados de recursos obtenidos:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener estados de recursos');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener estados de recursos:', error);
      throw error;
    }
  }
  
  // ===== GOOGLE BOOKS =====
  static async searchGoogleBooks(query: string, maxResults = 10): Promise<GoogleBooksVolume[]> {
    try {
      console.log('📚 ResourceService: Buscando en Google Books:', { query, maxResults });

      const params = new URLSearchParams({
        q: query.trim(),
        maxResults: Math.min(maxResults, 40).toString(),
      });
      
      const response = await axiosInstance.get<GoogleBooksSearchResponse>(
        `${RESOURCE_ENDPOINTS.GOOGLE_BOOKS_SEARCH}?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Google Books resultados:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al buscar en Google Books');
    } catch (error: any) {
      console.error('❌ ResourceService: Error en Google Books:', error);
      return []; // Devolver array vacío para que el componente no falle
    }
  }
  
  static async createResourceFromGoogleBooks(data: CreateResourceFromGoogleBooksRequest): Promise<Resource> {
    try {
      console.log('📝 ResourceService: Creando recurso desde Google Books:', data.googleBooksId);

      const response = await axiosInstance.post<ResourceResponse>(
        RESOURCE_ENDPOINTS.GOOGLE_BOOKS_CREATE,
        data
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recurso creado desde Google Books exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear recurso desde Google Books');
    } catch (error: any) {
      console.error('❌ ResourceService: Error al crear desde Google Books:', error);
      throw error;
    }
  }
  
  static async checkGoogleBooksStatus(): Promise<{ apiAvailable: boolean; lastCheck: Date }> {
    try {
      console.log('🔍 ResourceService: Verificando estado de Google Books API');

      const response = await axiosInstance.get(RESOURCE_ENDPOINTS.GOOGLE_BOOKS_STATUS);
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Estado de Google Books obtenido');
        return response.data.data;
      }
      
      return { apiAvailable: false, lastCheck: new Date() };
    } catch (error: any) {
      console.error('❌ ResourceService: Error al verificar Google Books:', error);
      return { apiAvailable: false, lastCheck: new Date() };
    }
  }
}

// Exportar clase con métodos estáticos
// The export statement is removed as ResourceService is already exported above.

// Exportar instancia única para compatibilidad con el código existente
export const resourceService = ResourceService;