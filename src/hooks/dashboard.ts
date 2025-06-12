// src/hooks/dashboard.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DashboardService, DashboardStats, DetailedStats } from '@/services/dashboard.service';
import type { BaseDashboardData, AdminDashboardData } from '@/types/dashboard.types';

// Query keys para React Query
export const DASHBOARD_QUERY_KEYS = {
  stats: ['dashboard', 'stats'] as const,
  peopleStats: ['dashboard', 'people', 'stats'] as const,
  resourcesStats: ['dashboard', 'resources', 'stats'] as const,
  usersStats: ['dashboard', 'users', 'stats'] as const,
  detailedStats: ['dashboard', 'detailed', 'stats'] as const,
  systemHealth: ['dashboard', 'system', 'health'] as const,
} as const;

/**
 * Hook para obtener estadísticas principales del dashboard
 */
export function useDashboardStats(
  options?: Omit<UseQueryOptions<DashboardStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: DashboardService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de personas
 */
export function usePeopleStats(
  options?: Omit<UseQueryOptions<DetailedStats['people']>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.peopleStats,
    queryFn: DashboardService.getPeopleStats,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de recursos
 */
export function useResourcesStats(
  options?: Omit<UseQueryOptions<DetailedStats['resources']>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.resourcesStats,
    queryFn: DashboardService.getResourcesStatsLocal,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de usuarios (solo admin)
 */
export function useUsersStats(
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<DetailedStats['users']>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.usersStats,
    queryFn: DashboardService.getUsersStats,
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 20 * 60 * 1000, // 20 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas detalladas
 */
export function useDetailedStats(
  options?: Omit<UseQueryOptions<DetailedStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.detailedStats,
    queryFn: DashboardService.getDetailedStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para verificar salud del sistema
 */
export function useSystemHealth(
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof DashboardService.getSystemHealth>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.systemHealth,
    queryFn: DashboardService.getSystemHealth,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
    retry: 1,
    ...options,
  });
}

/**
 * Hook combinado para obtener todas las estadísticas necesarias en el dashboard
 */
export function useDashboardData(): BaseDashboardData {
  const statsQuery = useDashboardStats();
  const peopleQuery = usePeopleStats();
  const resourcesQuery = useResourcesStats();
  
  return {
    // Queries individuales
    stats: statsQuery,
    people: peopleQuery,
    resources: resourcesQuery,
    
    // Estados combinados
    isLoading: statsQuery.isLoading || peopleQuery.isLoading || resourcesQuery.isLoading,
    isError: statsQuery.isError || peopleQuery.isError || resourcesQuery.isError,
    error: statsQuery.error || peopleQuery.error || resourcesQuery.error,
    
    // Datos combinados
    data: {
      stats: statsQuery.data,
      people: peopleQuery.data,
      resources: resourcesQuery.data,
    },
    
    // Funciones de utilidad
    refetchAll: () => {
      statsQuery.refetch();
      peopleQuery.refetch();
      resourcesQuery.refetch();
    },
    
    // Estado de frescura de los datos
    isStale: statsQuery.isStale || peopleQuery.isStale || resourcesQuery.isStale,
  };
}

/**
 * Hook para administradores que incluye estadísticas de usuarios
 */
export function useAdminDashboardData(): AdminDashboardData {
  const baseData = useDashboardData();
  const usersQuery = useUsersStats(true);
  
  return {
    // Heredar datos base
    stats: baseData.stats,
    people: baseData.people,
    resources: baseData.resources,
    users: usersQuery, // Query específica de usuarios
    
    // Estados actualizados incluyendo usuarios
    isLoading: baseData.isLoading || usersQuery.isLoading,
    isError: baseData.isError || usersQuery.isError,
    error: baseData.error || usersQuery.error,
    
    // Datos actualizados
    data: {
      stats: baseData.data.stats,
      people: baseData.data.people,
      resources: baseData.data.resources,
      users: usersQuery.data,
    },
    
    // Refetch actualizado
    refetchAll: () => {
      baseData.refetchAll();
      usersQuery.refetch();
    },
    
    // Estado de frescura actualizado
    isStale: baseData.isStale || usersQuery.isStale,
  };
}