// src/services/resource.service.ts
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
import type { ApiResponse } from '@/types/api.types';

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
  static async getResources(filters: ResourceFilters = {}): Promise<ResourceListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.typeId) params.append('typeId', filters.typeId);
    if (filters.locationId) params.append('locationId', filters.locationId);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await axiosInstance.get<ResourceListResponse>(
      `${RESOURCE_ENDPOINTS.RESOURCES}?${params.toString()}`
    );
    
    if (response.data.success && response.data.data) {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener recursos');
  }
  
  static async getResourceById(id: string): Promise<Resource> {
    const response = await axiosInstance.get<ResourceResponse>(
      RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id)
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener recurso');
  }
  
  static async getResourceByISBN(isbn: string): Promise<Resource> {
    const response = await axiosInstance.get<ResourceResponse>(
      RESOURCE_ENDPOINTS.RESOURCE_BY_ISBN(isbn)
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al buscar por ISBN');
  }
  
  static async createResource(data: CreateResourceRequest): Promise<Resource> {
    const response = await axiosInstance.post<ResourceResponse>(
      RESOURCE_ENDPOINTS.RESOURCES,
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al crear recurso');
  }
  
  static async updateResource(id: string, data: UpdateResourceRequest): Promise<Resource> {
    const response = await axiosInstance.put<ResourceResponse>(
      RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id),
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al actualizar recurso');
  }
  
  static async updateResourceAvailability(id: string, available: boolean): Promise<Resource> {
    const response = await axiosInstance.put<ResourceResponse>(
      RESOURCE_ENDPOINTS.AVAILABILITY(id),
      { available }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al actualizar disponibilidad');
  }
  
  static async deleteResource(id: string): Promise<void> {
    const response = await axiosInstance.delete(RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id));
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar recurso');
    }
  }
  
  // ===== CATEGORÍAS =====
  static async getCategories(): Promise<Category[]> {
    const response = await axiosInstance.get<CategoryListResponse>(
      RESOURCE_ENDPOINTS.CATEGORIES
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener categorías');
  }
  
  static async createCategory(data: { name: string; description: string; color?: string }): Promise<Category> {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      RESOURCE_ENDPOINTS.CATEGORIES,
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al crear categoría');
  }
  
  // ===== AUTORES =====
  static async getAuthors(): Promise<Author[]> {
    const response = await axiosInstance.get<AuthorListResponse>(
      RESOURCE_ENDPOINTS.AUTHORS
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener autores');
  }
  
  static async searchAuthors(query: string, limit = 20): Promise<Author[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });
    
    const response = await axiosInstance.get<AuthorListResponse>(
      `${RESOURCE_ENDPOINTS.AUTHOR_SEARCH}?${params.toString()}`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al buscar autores');
  }
  
  static async createAuthor(data: { name: string; biography?: string }): Promise<Author> {
    const response = await axiosInstance.post<ApiResponse<Author>>(
      RESOURCE_ENDPOINTS.AUTHORS,
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al crear autor');
  }
  
  static async bulkCreateAuthors(names: string[]): Promise<Author[]> {
    const response = await axiosInstance.post<AuthorListResponse>(
      RESOURCE_ENDPOINTS.AUTHOR_BULK_CREATE,
      { names }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al crear autores');
  }
  
  // ===== EDITORIALES =====
  static async getPublishers(): Promise<Publisher[]> {
    const response = await axiosInstance.get<PublisherListResponse>(
      RESOURCE_ENDPOINTS.PUBLISHERS
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener editoriales');
  }
  
  static async findOrCreatePublisher(name: string): Promise<Publisher> {
    const response = await axiosInstance.post<ApiResponse<Publisher>>(
      RESOURCE_ENDPOINTS.PUBLISHER_FIND_OR_CREATE,
      { name }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al crear editorial');
  }
  
  // ===== UBICACIONES =====
  static async getLocations(): Promise<Location[]> {
    const response = await axiosInstance.get<LocationListResponse>(
      RESOURCE_ENDPOINTS.LOCATIONS
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener ubicaciones');
  }
  
  // ===== TIPOS Y ESTADOS =====
  static async getResourceTypes(): Promise<ResourceType[]> {
    const response = await axiosInstance.get<ResourceTypeListResponse>(
      RESOURCE_ENDPOINTS.RESOURCE_TYPES
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener tipos de recursos');
  }
  
  static async getResourceStates(): Promise<ResourceState[]> {
    const response = await axiosInstance.get<ResourceStateListResponse>(
      RESOURCE_ENDPOINTS.RESOURCE_STATES
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al obtener estados de recursos');
  }
  
  // ===== GOOGLE BOOKS =====
  static async searchGoogleBooks(query: string, maxResults = 10): Promise<GoogleBooksVolume[]> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });
    
    const response = await axiosInstance.get<GoogleBooksSearchResponse>(
      `${RESOURCE_ENDPOINTS.GOOGLE_BOOKS_SEARCH}?${params.toString()}`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al buscar en Google Books');
  }
  
  static async createResourceFromGoogleBooks(data: CreateResourceFromGoogleBooksRequest): Promise<Resource> {
    const response = await axiosInstance.post<ResourceResponse>(
      RESOURCE_ENDPOINTS.GOOGLE_BOOKS_CREATE,
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error al crear recurso desde Google Books');
  }
  
  static async checkGoogleBooksStatus(): Promise<{ apiAvailable: boolean; lastCheck: Date }> {
    const response = await axiosInstance.get(RESOURCE_ENDPOINTS.GOOGLE_BOOKS_STATUS);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return { apiAvailable: false, lastCheck: new Date() };
  }
}