// src/services/resourceType.service.ts
import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface ResourceType {
  _id: string;
  name: string;
  description: string;
  active: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceTypeRequest {
  name: string;
  description: string;
}

export interface UpdateResourceTypeRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface ResourceTypeFilters {
  search?: string;
  active?: boolean;
  isSystem?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const RESOURCE_TYPE_ENDPOINTS = {
  RESOURCE_TYPES: '/resource-types',
  RESOURCE_TYPE_BY_ID: (id: string) => `/resource-types/${id}`,
  ACTIVATE: (id: string) => `/resource-types/${id}/activate`,
  DEACTIVATE: (id: string) => `/resource-types/${id}/deactivate`,
} as const;

export class ResourceTypeService {
  /**
   * Obtener todos los tipos de recursos
   */
  static async getResourceTypes(filters: ResourceTypeFilters = {}): Promise<PaginatedResponse<ResourceType>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.isSystem !== undefined) params.append('isSystem', filters.isSystem.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ResourceType>>>(
      `${RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPES}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener tipos de recursos');
  }

  /**
   * Obtener tipo de recurso por ID
   */
  static async getResourceTypeById(id: string): Promise<ResourceType> {
    const response = await axiosInstance.get<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPE_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener tipo de recurso');
  }

  /**
   * Crear un nuevo tipo de recurso
   */
  static async createResourceType(data: CreateResourceTypeRequest): Promise<ResourceType> {
    const response = await axiosInstance.post<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPES,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear tipo de recurso');
  }

  /**
   * Actualizar un tipo de recurso
   */
  static async updateResourceType(id: string, data: UpdateResourceTypeRequest): Promise<ResourceType> {
    const response = await axiosInstance.put<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPE_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar tipo de recurso');
  }

  /**
   * Activar un tipo de recurso
   */
  static async activateResourceType(id: string): Promise<ResourceType> {
    const response = await axiosInstance.put<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.ACTIVATE(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al activar tipo de recurso');
  }

  /**
   * Desactivar un tipo de recurso
   */
  static async deactivateResourceType(id: string): Promise<ResourceType> {
    const response = await axiosInstance.put<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.DEACTIVATE(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al desactivar tipo de recurso');
  }

  /**
   * Eliminar un tipo de recurso
   */
  static async deleteResourceType(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPE_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar tipo de recurso');
    }
  }

  /**
   * Obtener estadísticas de tipos de recursos
   */
  static async getResourceTypeStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    systemTypes: number;
    customTypes: number;
    resourceCount: Record<string, number>;
  }> {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `${RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPES}/stats`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return {
        total: 0,
        active: 0,
        inactive: 0,
        systemTypes: 0,
        customTypes: 0,
        resourceCount: {},
      };
    } catch (error) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        systemTypes: 0,
        customTypes: 0,
        resourceCount: {},
      };
    }
  }
}