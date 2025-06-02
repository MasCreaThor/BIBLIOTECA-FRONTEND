// src/hooks/useDashboard.ts

export {
    useDashboardStats,
    usePeopleStats,
    useResourcesStats,
    useUsersStats,
    useDetailedStats,
    useSystemHealth,
    useDashboardData,
    useAdminDashboardData,
    DASHBOARD_QUERY_KEYS,
  } from './dashboard';
  
  // Re-export types if needed
  export type {
    DashboardStats,
    DetailedStats,
  } from '@/services/dashboard.service';

  export type {
    BaseDashboardData,
    AdminDashboardData,
    StatCardProps,
    QuickActionProps,
  } from '@/types/dashboard.types';