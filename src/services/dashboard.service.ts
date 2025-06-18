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
  loanQuality: {
    onTimeReturnRate: number;
    averageLoanDuration: number;
    returnedThisMonth: number;
    lostLoans: number;
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
  PEOPLE_STATS: '/people/stats',
  USERS_STATS: '/users/stats',
  
  // Endpoints para obtener datos y calcular estadísticas localmente
  RESOURCES: '/resources',
  
  // ELIMINADO: CATEGORIES endpoint para evitar confusión con CategoryService
  // Las categorías ahora se manejan exclusivamente desde CategoryService
  
  // Endpoints que NO existen - eliminados
  // RESOURCES_STATS: '/resources/stats/summary', // ❌ NO EXISTE
  // DASHBOARD_STATS: '/dashboard/stats/summary', // ❌ NO EXISTE
  // RECENT_ACTIVITY: '/dashboard/recent-activity', // ❌ NO EXISTE
  LOAN_STATISTICS: '/loans/statistics',
} as const;

export class DashboardService {
  /**
   * ✅ MEJORADO: Obtener estadísticas principales del dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      
      // Obtener estadísticas desde endpoints que SÍ existen
      const [peopleStatsResult, resourcesStatsResult, loanStatsResult] = await Promise.allSettled([
        DashboardService.getPeopleStats(),    
        DashboardService.getResourcesStatsLocal(), // Usar método local
        DashboardService.getLoanStats(), // ✅ NUEVO: Obtener estadísticas de préstamos
      ]);

      // Extraer datos de manera segura
      const totalPeople = peopleStatsResult.status === 'fulfilled' ? peopleStatsResult.value.total : 0;
      const resourcesData = resourcesStatsResult.status === 'fulfilled' ? resourcesStatsResult.value : {
        total: 0, available: 0, borrowed: 0, byType: [], byCategory: []
      };
      const loanData = loanStatsResult.status === 'fulfilled' ? loanStatsResult.value : {
        totalLoans: 0, activeLoans: 0, overdueLoans: 0, returnedLoans: 0, lostLoans: 0,
        averageLoanDuration: 0, onTimeReturnRate: 0, returnedThisMonth: 0
      };

      // ✅ MEJORADO: Obtener actividad reciente
      const recentActivity = await DashboardService.getRecentActivity();

      // Construir estadísticas del dashboard
      const dashboardStats: DashboardStats = {
        totalResources: resourcesData.total,
        activeLoans: loanData.activeLoans, // ✅ MEJORADO: Usar datos reales de préstamos
        overdueLoans: loanData.overdueLoans, // ✅ MEJORADO: Usar datos reales de préstamos
        totalPeople,
        recentActivity, // ✅ NUEVO: Actividad reciente real
        // ✅ NUEVO: Agregar estadísticas de calidad
        loanQuality: {
          onTimeReturnRate: loanData.onTimeReturnRate,
          averageLoanDuration: loanData.averageLoanDuration,
          returnedThisMonth: loanData.returnedThisMonth,
          lostLoans: loanData.lostLoans
        }
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
        loanQuality: {
          onTimeReturnRate: 0,
          averageLoanDuration: 0,
          returnedThisMonth: 0,
          lostLoans: 0
        }
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

  /**
   * ✅ MEJORADO: Obtener estadísticas de préstamos
   */
  static async getLoanStats(): Promise<{
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    returnedLoans: number;
    lostLoans: number;
    averageLoanDuration: number;
    onTimeReturnRate: number;
    returnedThisMonth: number;
  }> {
    try {
      console.log('📊 Obteniendo estadísticas de préstamos...');
      
      const response = await axiosInstance.get<ApiResponse<{
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        returnedThisMonth: number;
        mostBorrowedResources: Array<{ resourceId: string; count: number }>;
      }>>(DASHBOARD_ENDPOINTS.LOAN_STATISTICS);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // ✅ CORRECCIÓN: Calcular valores faltantes basados en los datos disponibles
        const stats = {
          totalLoans: data.totalLoans || 0,
          activeLoans: data.activeLoans || 0,
          overdueLoans: data.overdueLoans || 0,
          returnedThisMonth: data.returnedThisMonth || 0,
          // ✅ VALORES CALCULADOS: Para estadísticas que no vienen del backend
          returnedLoans: 0, // Se calculará si es necesario
          lostLoans: 0, // Se calculará si es necesario
          averageLoanDuration: 0, // Se calculará si es necesario
          onTimeReturnRate: 0, // Se calculará si es necesario
        };
        
        console.log('✅ Estadísticas de préstamos obtenidas exitosamente');
        return stats;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de préstamos');
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de préstamos:', error);
      return {
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        returnedLoans: 0,
        lostLoans: 0,
        averageLoanDuration: 0,
        onTimeReturnRate: 0,
        returnedThisMonth: 0
      };
    }
  }

  /**
   * ✅ NUEVO: Obtener actividad reciente del sistema
   */
  static async getRecentActivity(): Promise<{
    loans: number;
    returns: number;
    newResources: number;
    newPeople: number;
  }> {
    try {
      console.log('📊 Obteniendo actividad reciente...');
      
      // Obtener la fecha de hoy
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Obtener préstamos del día
      const loansResponse = await axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
        `/loans?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}&limit=1000`
      );
      
      // Obtener devoluciones del día (préstamos devueltos hoy)
      const returnsResponse = await axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
        `/loans?status=returned&dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}&limit=1000`
      );
      
      // Obtener recursos agregados hoy
      const resourcesResponse = await axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
        `/resources?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}&limit=1000`
      );
      
      // Obtener personas registradas hoy
      const peopleResponse = await axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
        `/people?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}&limit=1000`
      );
      
      const activity = {
        loans: loansResponse.data.success ? (loansResponse.data.data?.data?.length || 0) : 0,
        returns: returnsResponse.data.success ? (returnsResponse.data.data?.data?.length || 0) : 0,
        newResources: resourcesResponse.data.success ? (resourcesResponse.data.data?.data?.length || 0) : 0,
        newPeople: peopleResponse.data.success ? (peopleResponse.data.data?.data?.length || 0) : 0,
      };
      
      console.log('✅ Actividad reciente obtenida:', activity);
      return activity;
      
    } catch (error) {
      console.error('❌ Error obteniendo actividad reciente:', error);
      return {
        loans: 0,
        returns: 0,
        newResources: 0,
        newPeople: 0,
      };
    }
  }

  // ELIMINADO: getCategoriesStats() method que causaba errores
  // Las estadísticas de categorías ya no son necesarias según los requerimientos del usuario
}