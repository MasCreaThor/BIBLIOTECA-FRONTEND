// src/services/resource.service.ts - VERSIÓN MEJORADA PARA GESTIÓN DE CANTIDADES
// ================================================================
// SERVICIO DE RECURSOS CON SOPORTE COMPLETO PARA PRÉSTAMOS
// ================================================================

import axiosInstance from '@/lib/axios';
import type {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
  ResourceSearchFilters,
  ResourceManagementFilters,
  ResourceResponse,
  ResourceListResponse,
  AvailabilityCheck,
} from '@/types/resource.types';
import type {
  QuantityUpdate,
  AvailabilityUpdate,
  StockAlert,
  ResourceStats,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api.types';

// ===== ENDPOINTS =====
const RESOURCE_ENDPOINTS = {
  RESOURCES: '/resources',
  RESOURCE_BY_ID: (id: string) => `/resources/${id}`,
  UPDATE_AVAILABILITY: (id: string) => `/resources/${id}/availability`,
  UPDATE_QUANTITY: (id: string) => `/resources/${id}/quantity`,
  CHECK_AVAILABILITY: (id: string) => `/resources/${id}/check-availability`,
  BULK_IMPORT: '/resources/bulk-import',
  STATS: '/resources/stats',
  LOW_STOCK: '/resources/low-stock',
  NO_STOCK: '/resources/no-stock',
} as const;

export class ResourceService {
  
  // ===== MÉTODOS PRINCIPALES =====
  
  /**
   * Obtener recursos con filtros avanzados y soporte de paginación
   */
  static async getResources(filters: ResourceFilters = {}): Promise<PaginatedResponse<Resource>> {
    try {
      console.log('🔍 ResourceService: Obteniendo recursos con filtros:', filters);

      const params = new URLSearchParams();
      
      // Parámetros básicos
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      
      // Filtros por entidades relacionadas
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.locationId) params.append('locationId', filters.locationId);
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.publisherId) params.append('publisherId', filters.publisherId);
      if (filters.typeId) params.append('typeId', filters.typeId);
      if (filters.stateId) params.append('stateId', filters.stateId);
      
      // ✅ FILTROS DE DISPONIBILIDAD Y STOCK
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.hasStock !== undefined) params.append('hasStock', filters.hasStock.toString());
      
      // Parámetros de ordenamiento
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      // Control de población de datos
      // params.append('populate', filters.populate !== false ? 'true' : 'false');

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Resource>>>(
        `${RESOURCE_ENDPOINTS.RESOURCES}?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recursos obtenidos exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener recursos');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener recursos:', error);
      
      // Fallback con estructura vacía válida
      return this.createEmptyResourceResponse(filters);
    }
  }

  /**
   * Obtener recurso por ID con datos poblados
   */
  static async getResourceById(id: string): Promise<Resource> {
    try {
      console.log('🔍 ResourceService: Buscando recurso por ID:', id);

      const response = await axiosInstance.get<ResourceResponse>(
        RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id)
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Recurso encontrado:', response.data.data.title);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Recurso no encontrado');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener recurso:', error);
      throw error;
    }
  }
  
  /**
   * Crear nuevo recurso con validación de cantidad
   */
  static async createResource(data: CreateResourceRequest): Promise<Resource> {
    try {
      console.log('📝 ResourceService: Creando recurso:', data.title);
      console.log('📤 ResourceService: Datos completos enviados:', {
        title: data.title,
        typeId: data.typeId,
        categoryId: data.categoryId,
        locationId: data.locationId,
        stateId: data.stateId,
        totalQuantity: data.totalQuantity,
        authorIds: data.authorIds,
        publisherId: data.publisherId,
        volumes: data.volumes,
        isbn: data.isbn,
        notes: data.notes,
        hasTotalQuantity: 'totalQuantity' in data,
        dataKeys: Object.keys(data),
      });

      // ✅ Validación de cantidad total
      if (!data.totalQuantity || data.totalQuantity < 1) {
        throw new Error('La cantidad total debe ser mayor a 0');
      }

      if (data.totalQuantity > 10000) {
        throw new Error('La cantidad total no puede exceder 10,000 unidades');
      }

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
   * Actualizar recurso existente
   */
  static async updateResource(id: string, data: UpdateResourceRequest): Promise<Resource> {
    try {
      console.log('📝 ResourceService: Actualizando recurso:', id);

      // ✅ Validación de cantidad si se está actualizando
      if (data.totalQuantity !== undefined) {
        if (data.totalQuantity < 1) {
          throw new Error('La cantidad total debe ser mayor a 0');
        }
        if (data.totalQuantity > 10000) {
          throw new Error('La cantidad total no puede exceder 10,000 unidades');
        }
      }

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

  // ===== MÉTODOS ESPECÍFICOS PARA GESTIÓN DE CANTIDADES =====

  /**
   * ✅ NUEVO: Actualizar cantidad total de un recurso
   */
  static async updateResourceQuantity(quantityUpdate: QuantityUpdate): Promise<Resource> {
    try {
      console.log('🔢 ResourceService: Actualizando cantidad:', {
        resourceId: quantityUpdate.resourceId,
        newQuantity: quantityUpdate.newTotalQuantity
      });

      if (quantityUpdate.newTotalQuantity < 1) {
        throw new Error('La cantidad total debe ser mayor a 0');
      }

      const response = await axiosInstance.put<ResourceResponse>(
        RESOURCE_ENDPOINTS.UPDATE_QUANTITY(quantityUpdate.resourceId),
        {
          totalQuantity: quantityUpdate.newTotalQuantity,
          reason: quantityUpdate.reason,
          updatedBy: quantityUpdate.updatedBy
        }
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Cantidad actualizada exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar cantidad');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al actualizar cantidad:', error);
      throw error;
    }
  }

  /**
   * ✅ NUEVO: Verificar disponibilidad detallada de un recurso
   */
  static async checkResourceAvailability(resourceId: string): Promise<AvailabilityCheck> {
    try {
      console.log('🔍 ResourceService: Verificando disponibilidad:', resourceId);

      const response = await axiosInstance.get<ApiResponse<AvailabilityCheck>>(
        RESOURCE_ENDPOINTS.CHECK_AVAILABILITY(resourceId)
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Disponibilidad verificada');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al verificar disponibilidad');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al verificar disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Actualizar disponibilidad general del recurso
   */
  static async updateResourceAvailability(
    availabilityUpdate: AvailabilityUpdate | { id: string; available: boolean; reason?: string; updatedBy?: string }
  ): Promise<Resource> {
    try {
      // Normalizar el parámetro para soportar ambos formatos
      const resourceId = 'resourceId' in availabilityUpdate ? availabilityUpdate.resourceId : availabilityUpdate.id;
      const updateData = {
        available: availabilityUpdate.available,
        reason: availabilityUpdate.reason,
        updatedBy: availabilityUpdate.updatedBy
      };

      console.log('🔄 ResourceService: Actualizando disponibilidad:', {
        resourceId,
        available: availabilityUpdate.available
      });

      const response = await axiosInstance.put<ResourceResponse>(
        RESOURCE_ENDPOINTS.UPDATE_AVAILABILITY(resourceId),
        updateData
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Disponibilidad actualizada');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar disponibilidad');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al actualizar disponibilidad:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA GESTIÓN DE STOCK =====

  /**
   * ✅ NUEVO: Obtener recursos con stock bajo
   */
  static async getResourcesWithLowStock(threshold: number = 5): Promise<Resource[]> {
    try {
      console.log('⚠️ ResourceService: Obteniendo recursos con stock bajo');

      const params = new URLSearchParams();
      params.append('threshold', threshold.toString());

      const response = await axiosInstance.get<ApiResponse<Resource[]>>(
        `${RESOURCE_ENDPOINTS.LOW_STOCK}?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        console.log(`✅ ResourceService: ${response.data.data.length} recursos con stock bajo`);
        return response.data.data;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener recursos con stock bajo:', error);
      return [];
    }
  }

  /**
   * ✅ NUEVO: Obtener recursos sin stock
   */
  static async getResourcesWithoutStock(): Promise<Resource[]> {
    try {
      console.log('🚫 ResourceService: Obteniendo recursos sin stock');

      const response = await axiosInstance.get<ApiResponse<Resource[]>>(
        RESOURCE_ENDPOINTS.NO_STOCK
      );
      
      if (response.data.success && response.data.data) {
        console.log(`✅ ResourceService: ${response.data.data.length} recursos sin stock`);
        return response.data.data;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener recursos sin stock:', error);
      return [];
    }
  }

  /**
   * ✅ NUEVO: Obtener estadísticas completas de recursos
   */
  static async getResourceStats(): Promise<ResourceStats> {
    try {
      console.log('📊 ResourceService: Obteniendo estadísticas de recursos');

      const response = await axiosInstance.get<ApiResponse<ResourceStats>>(
        RESOURCE_ENDPOINTS.STATS
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ ResourceService: Estadísticas obtenidas exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener estadísticas');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al obtener estadísticas:', error);
      
      // Estadísticas vacías como fallback
      return {
        total: 0,
        available: 0,
        borrowed: 0,
        byType: [],
        byCategory: [],
        stockStatus: {
          withStock: 0,
          lowStock: 0,
          noStock: 0,
        },
        totalUnits: 0,
        loanedUnits: 0,
        availableUnits: 0,
      };
    }
  }

  // ===== MÉTODOS DE BÚSQUEDA ESPECIALIZADOS =====

  /**
   * Búsqueda de recursos para formularios de préstamos
   */
  static async searchResourcesForLoan(filters: ResourceSearchFilters = {}): Promise<Resource[]> {
    try {
      console.log('🔍 ResourceService: Búsqueda para préstamos');

      const searchFilters: ResourceFilters = {
        ...filters,
        availability: 'available',  // Solo recursos disponibles
        hasStock: true,             // Solo con stock
        limit: filters.limit || 50, // Límite razonable
      };

      const result = await this.getResources(searchFilters);
      return result.data.filter(resource => 
        resource.availableQuantity && resource.availableQuantity > 0
      );
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error en búsqueda para préstamos:', error);
      return [];
    }
  }

  /**
   * Búsqueda avanzada con múltiples criterios
   */
  static async advancedSearch(filters: ResourceManagementFilters = {}): Promise<PaginatedResponse<Resource>> {
    try {
      console.log('🔍 ResourceService: Búsqueda avanzada');

      const params = new URLSearchParams();
      
      // Parámetros estándar
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      
      // ✅ Filtros específicos de gestión
      if (filters.lowStock) params.append('lowStock', 'true');
      if (filters.noStock) params.append('noStock', 'true');
      if (filters.createdAfter) params.append('createdAfter', filters.createdAfter.toISOString());
      if (filters.createdBefore) params.append('createdBefore', filters.createdBefore.toISOString());
      if (filters.createdBy) params.append('createdBy', filters.createdBy);
      
      return await this.getResources(filters);
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error en búsqueda avanzada:', error);
      return this.createEmptyResourceResponse(filters);
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Eliminar recurso (soft delete)
   */
  static async deleteResource(id: string): Promise<void> {
    try {
      console.log('🗑️ ResourceService: Eliminando recurso:', id);

      const response = await axiosInstance.delete<ApiResponse<null>>(
        RESOURCE_ENDPOINTS.RESOURCE_BY_ID(id)
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar recurso');
      }
      
      console.log('✅ ResourceService: Recurso eliminado exitosamente');
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al eliminar recurso:', error);
      throw error;
    }
  }

  /**
   * Crear respuesta vacía válida como fallback
   */
  private static createEmptyResourceResponse(filters: ResourceFilters): PaginatedResponse<Resource> {
    console.warn('🆘 ResourceService: Usando estructura vacía como fallback');
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

  // ===== UTILIDADES PARA VALIDACIÓN =====

  /**
   * ✅ NUEVO: Validar si un recurso puede ser prestado
   */
  static async canResourceBeLent(resourceId: string, requestedQuantity: number = 1): Promise<{
    canLend: boolean;
    reason?: string;
    availableQuantity: number;
  }> {
    try {
      const availability = await this.checkResourceAvailability(resourceId);
      
      if (!availability.available) {
        return {
          canLend: false,
          reason: 'El recurso no está disponible para préstamo',
          availableQuantity: 0
        };
      }

      if (availability.availableQuantity < requestedQuantity) {
        return {
          canLend: false,
          reason: `Solo hay ${availability.availableQuantity} unidades disponibles`,
          availableQuantity: availability.availableQuantity
        };
      }

      return {
        canLend: true,
        availableQuantity: availability.availableQuantity
      };
      
    } catch (error: any) {
      console.error('❌ ResourceService: Error al validar préstamo:', error);
      return {
        canLend: false,
        reason: 'Error al verificar disponibilidad',
        availableQuantity: 0
      };
    }
  }
}