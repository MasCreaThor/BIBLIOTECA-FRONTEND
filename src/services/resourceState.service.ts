// src/services/resourceState.service.ts
import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface ResourceState {
  _id: string;
  name: 'good' | 'deteriorated' | 'damaged' | 'lost';
  description: string;
  color: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceStateRequest {
  name: 'good' | 'deteriorated' | 'damaged' | 'lost';
  description: string;
  color?: string;
}

export interface UpdateResourceStateRequest {
  description?: string;
  color?: string;
  active?: boolean;
}

export interface ResourceStateFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const RESOURCE_STATE_ENDPOINTS = {
  RESOURCE_STATES: '/resource-states',
  RESOURCE_STATE_BY_ID: (id: string) => `/resource-states/${id}`,
  ACTIVATE: (id: string) => `/resource-states/${id}/activate`,
  DEACTIVATE: (id: string) => `/resource-states/${id}/deactivate`,
} as const;

export class ResourceStateService {
  /**
   * Obtener todos los estados de recursos
   */
  static async getResourceStates(filters: ResourceStateFilters = {}): Promise<PaginatedResponse<ResourceState>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ResourceState>>>(
      `${RESOURCE_STATE_ENDPOINTS.RESOURCE_STATES}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estados de recursos');
  }

  /**
   * Obtener estado de recurso por ID
   */
  static async getResourceStateById(id: string): Promise<ResourceState> {
    const response = await axiosInstance.get<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATE_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estado de recurso');
  }

  /**
   * Crear un nuevo estado de recurso
   */
  static async createResourceState(data: CreateResourceStateRequest): Promise<ResourceState> {
    const response = await axiosInstance.post<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATES,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear estado de recurso');
  }

  /**
   * Actualizar un estado de recurso
   */
  static async updateResourceState(id: string, data: UpdateResourceStateRequest): Promise<ResourceState> {
    const response = await axiosInstance.put<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATE_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar estado de recurso');
  }

  /**
   * Activar un estado de recurso
   */
  static async activateResourceState(id: string): Promise<ResourceState> {
    const response = await axiosInstance.put<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.ACTIVATE(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al activar estado de recurso');
  }

  /**
   * Desactivar un estado de recurso
   */
  static async deactivateResourceState(id: string): Promise<ResourceState> {
    const response = await axiosInstance.put<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.DEACTIVATE(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al desactivar estado de recurso');
  }

  /**
   * Eliminar un estado de recurso
   */
  static async deleteResourceState(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATE_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar estado de recurso');
    }
  }

  /**
   * Obtener estadísticas de estados de recursos
   */
  static async getResourceStateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    resourceCount: Record<string, number>;
  }> {
    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `${RESOURCE_STATE_ENDPOINTS.RESOURCE_STATES}/stats`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return {
        total: 0,
        active: 0,
        inactive: 0,
        resourceCount: {},
      };
    } catch (error) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        resourceCount: {},
      };
    }
  }
}