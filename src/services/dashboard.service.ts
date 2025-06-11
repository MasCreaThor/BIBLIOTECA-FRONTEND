// src/services/dashboard.service.ts - VERSIÓN LIMPIADA
import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface DashboardStats {
  totalResources: number;
  activeLoans: number;
  overdueLoans: number;
  totalPeople: number;
  recentActivity: {
    loans: number;
    returns: number;
    newResources: number;
    newPeople: number;
  };
}

export interface DetailedStats {
  people: {
    total: number;
    students: number;
    teachers: number;
    byGrade: Array<{ grade: string; count: number }>;
  };
  resources: {
    total: number;
    available: number;
    borrowed: number;
    byType: Array<{ type: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    librarians: number;
  };
}

// Interfaces para los datos de recursos
interface Resource {
  _id: string;
  title: string;
  availability: boolean;
  categoryId?: {
    _id: string;
    name: string;
  };
  resourceType?: {
    _id: string;
    name: string;
  };
  active: boolean;
}

const DASHBOARD_ENDPOINTS = {
  // Endpoints que SÍ existen en el backend
  PEOPLE_STATS: '/people/stats/summary',
  USERS_STATS: '/users/stats/summary',
  
  // Endpoints para obtener datos y calcular estadísticas localmente
  RESOURCES: '/resources',
  
  // ELIMINADO: CATEGORIES endpoint para evitar confusión con CategoryService
  // Las categorías ahora se manejan exclusivamente desde CategoryService
  
  // Endpoints que NO existen - eliminados
  // RESOURCES_STATS: '/resources/stats/summary', // ❌ NO EXISTE
  // DASHBOARD_STATS: '/dashboard/stats/summary', // ❌ NO EXISTE
  // RECENT_ACTIVITY: '/dashboard/recent-activity', // ❌ NO EXISTE
} as const;

export class DashboardService {
  /**
   * Obtener estadísticas principales del dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      
      // Obtener estadísticas desde endpoints que SÍ existen
      const [peopleStatsResult, resourcesStatsResult] = await Promise.allSettled([
        DashboardService.getPeopleStats(),    
        DashboardService.getResourcesStatsLocal(), // Usar método local
      ]);

      // Extraer datos de manera segura
      const totalPeople = peopleStatsResult.status === 'fulfilled' ? peopleStatsResult.value.total : 0;
      const resourcesData = resourcesStatsResult.status === 'fulfilled' ? resourcesStatsResult.value : {
        total: 0, available: 0, borrowed: 0, byType: [], byCategory: []
      };

      // Construir estadísticas del dashboard
      const dashboardStats: DashboardStats = {
        totalResources: resourcesData.total,
        activeLoans: resourcesData.borrowed,
        overdueLoans: 0, // Por implementar
        totalPeople,
        recentActivity: {
          loans: 0,    // Por implementar
          returns: 0,  // Por implementar
          newResources: 0, // Por implementar
          newPeople: 0,    // Por implementar
        },
      };

      console.log('✅ Estadísticas del dashboard obtenidas exitosamente');
      return dashboardStats;
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del dashboard:', error);
      
      // Fallback: estadísticas vacías
      return {
        totalResources: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalPeople: 0,
        recentActivity: {
          loans: 0,
          returns: 0,
          newResources: 0,
          newPeople: 0,
        },
      };
    }
  }

  /**
   * Obtener estadísticas detalladas del sistema
   */
  static async getDetailedStats(): Promise<DetailedStats> {
    try {
      console.log('📊 Obteniendo estadísticas detalladas...');

      const [peopleStats, resourcesStats, usersStats] = await Promise.allSettled([
        DashboardService.getPeopleStats(),
        DashboardService.getResourcesStatsLocal(),
        DashboardService.getUsersStats(),
      ]);

      const result = {
        people: peopleStats.status === 'fulfilled' ? peopleStats.value : {
          total: 0, students: 0, teachers: 0, byGrade: []
        },
        resources: resourcesStats.status === 'fulfilled' ? resourcesStats.value : {
          total: 0, available: 0, borrowed: 0, byType: [], byCategory: []
        },
        users: usersStats.status === 'fulfilled' ? usersStats.value : {
          total: 0, active: 0, inactive: 0, admins: 0, librarians: 0
        },
      };

      console.log('✅ Estadísticas detalladas obtenidas exitosamente');
      return result;
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas detalladas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de personas
   */
  static async getPeopleStats(): Promise<DetailedStats['people']> {
    try {
      console.log('👥 Obteniendo estadísticas de personas...');
      
      const response = await axiosInstance.get<ApiResponse<DetailedStats['people']>>(
        DASHBOARD_ENDPOINTS.PEOPLE_STATS
      );

      if (response.data.success && response.data.data) {
        console.log('✅ Estadísticas de personas obtenidas exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de personas');
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de personas:', error);
      return {
        total: 0,
        students: 0,
        teachers: 0,
        byGrade: [],
      };
    }
  }

  /**
   * Obtener estadísticas de recursos calculadas localmente
   * (En lugar de usar el endpoint inexistente /resources/stats/summary)
   */
  static async getResourcesStatsLocal(): Promise<DetailedStats['resources']> {
    try {
      console.log('📚 Calculando estadísticas de recursos localmente...');
      
      // Obtener todos los recursos del endpoint que SÍ existe
      const resourcesResponse = await axiosInstance.get<ApiResponse<PaginatedResponse<Resource> | Resource[]>>(
        `${DASHBOARD_ENDPOINTS.RESOURCES}?limit=1000` // Obtener muchos recursos para estadísticas
      );

      if (!resourcesResponse.data.success) {
        throw new Error(resourcesResponse.data.message || 'Error al obtener recursos');
      }

      // Normalizar la respuesta (puede ser array directo o paginado)
      let resources: Resource[];
      if (Array.isArray(resourcesResponse.data.data)) {
        resources = resourcesResponse.data.data;
      } else if (resourcesResponse.data.data && 'data' in resourcesResponse.data.data) {
        resources = (resourcesResponse.data.data as PaginatedResponse<Resource>).data || [];
      } else {
        resources = [];
      }

      // Calcular estadísticas
      const total = resources.length;
      const available = resources.filter(r => r.availability === true).length;
      const borrowed = total - available;

      // Agrupar por tipo de recurso
      const typeGroups = resources.reduce((acc, resource) => {
        const type = resource.resourceType?.name || 'Sin tipo';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byType = Object.entries(typeGroups).map(([type, count]) => ({
        type,
        count,
      }));

      // Agrupar por categoría
      const categoryGroups = resources.reduce((acc, resource) => {
        const category = resource.categoryId?.name || 'Sin categoría';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byCategory = Object.entries(categoryGroups).map(([category, count]) => ({
        category,
        count,
      }));

      const result = {
        total,
        available,
        borrowed,
        byType,
        byCategory,
      };

      console.log('✅ Estadísticas de recursos calculadas exitosamente:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error calculando estadísticas de recursos:', error);
      return {
        total: 0,
        available: 0,
        borrowed: 0,
        byType: [],
        byCategory: [],
      };
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUsersStats(): Promise<DetailedStats['users']> {
    try {
      console.log('👤 Obteniendo estadísticas de usuarios...');
      
      const response = await axiosInstance.get<ApiResponse<DetailedStats['users']>>(
        DASHBOARD_ENDPOINTS.USERS_STATS
      );

      if (response.data.success && response.data.data) {
        console.log('✅ Estadísticas de usuarios obtenidas exitosamente');
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de usuarios');
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de usuarios:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        librarians: 0,
      };
    }
  }

  /**
   * Verificar conectividad con el backend
   */
  static async checkBackendConnectivity(): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener resumen de salud del sistema
   */
  static async getSystemHealth(): Promise<{
    backend: boolean;
    apis: {
      people: boolean;
      resources: boolean;
      users: boolean;
    };
  }> {
    const results = await Promise.allSettled([
      DashboardService.checkBackendConnectivity(),
      DashboardService.getPeopleStats(),
      DashboardService.getResourcesStatsLocal(), // Usar método local
      DashboardService.getUsersStats(),
    ]);

    return {
      backend: results[0].status === 'fulfilled' && results[0].value,
      apis: {
        people: results[1].status === 'fulfilled',
        resources: results[2].status === 'fulfilled',
        users: results[3].status === 'fulfilled',
      },
    };
  }

  // ELIMINADO: getCategoriesStats() method que causaba errores
  // Las estadísticas de categorías ya no son necesarias según los requerimientos del usuario
}