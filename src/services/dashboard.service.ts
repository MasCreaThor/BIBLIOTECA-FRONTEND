// src/services/dashboard.service.ts
import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';

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

const DASHBOARD_ENDPOINTS = {
  STATS_SUMMARY: '/dashboard/stats/summary',
  PEOPLE_STATS: '/people/stats/summary',
  RESOURCES_STATS: '/resources/stats/summary',
  USERS_STATS: '/users/stats/summary',
  RECENT_ACTIVITY: '/dashboard/recent-activity',
} as const;

export class DashboardService {
  /**
   * Obtener estadísticas principales del dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Por ahora usamos llamadas individuales hasta que se implemente el endpoint unificado
      const [peopleStats, resourcesStats] = await Promise.allSettled([
        DashboardService.getPeopleStats(),    
        DashboardService.getResourcesStats(), 
      ]);

      // Datos base
      const totalPeople = peopleStats.status === 'fulfilled' ? peopleStats.value.total : 0;
      const totalResources = resourcesStats.status === 'fulfilled' ? resourcesStats.value.total : 0;

      // Mock data para préstamos hasta que se implemente
      const mockLoanData = {
        activeLoans: Math.floor(totalResources * 0.15), // 15% de recursos prestados
        overdueLoans: Math.floor(totalResources * 0.03), // 3% vencidos
      };

      // Mock para actividad reciente
      const mockActivity = {
        loans: Math.floor(Math.random() * 10) + 1,
        returns: Math.floor(Math.random() * 8) + 1,
        newResources: Math.floor(Math.random() * 3),
        newPeople: Math.floor(Math.random() * 5),
      };

      return {
        totalResources,
        totalPeople,
        activeLoans: mockLoanData.activeLoans,
        overdueLoans: mockLoanData.overdueLoans,
        recentActivity: mockActivity,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      
      // Fallback con datos mock
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
   * Obtener estadísticas de personas
   */
  static async getPeopleStats(): Promise<DetailedStats['people']> {
    try {
      const response = await axiosInstance.get<ApiResponse<DetailedStats['people']>>(
        DASHBOARD_ENDPOINTS.PEOPLE_STATS
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de personas');
    } catch (error) {
      console.error('Error obteniendo estadísticas de personas:', error);
      return {
        total: 0,
        students: 0,
        teachers: 0,
        byGrade: [],
      };
    }
  }

  /**
   * Obtener estadísticas de recursos
   */
  static async getResourcesStats(): Promise<DetailedStats['resources']> {
    try {
      const response = await axiosInstance.get<ApiResponse<DetailedStats['resources']>>(
        DASHBOARD_ENDPOINTS.RESOURCES_STATS
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de recursos');
    } catch (error) {
      console.error('Error obteniendo estadísticas de recursos:', error);
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
   * Obtener estadísticas de usuarios (solo admin)
   */
  static async getUsersStats(): Promise<DetailedStats['users']> {
    try {
      const response = await axiosInstance.get<ApiResponse<DetailedStats['users']>>(
        DASHBOARD_ENDPOINTS.USERS_STATS
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de usuarios');
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error);
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
   * Obtener estadísticas detalladas (para reportes)
   */
  static async getDetailedStats(): Promise<DetailedStats> {
    try {
      const [peopleStats, resourcesStats, usersStats] = await Promise.allSettled([
        DashboardService.getPeopleStats(),    
        DashboardService.getResourcesStats(), 
        DashboardService.getUsersStats(),     
      ]);

      return {
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
    } catch (error) {
      console.error('Error obteniendo estadísticas detalladas:', error);
      throw error;
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
      DashboardService.getResourcesStats(),
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
}