// src/types/dashboard.types.ts
import { UseQueryResult } from '@tanstack/react-query';
import { DetailedStats } from '@/services/dashboard.service';

// Tipos para los hooks de dashboard
export interface BaseDashboardData {
  stats: UseQueryResult<DashboardStats>;
  people: UseQueryResult<DetailedStats['people']>;
  resources: UseQueryResult<DetailedStats['resources']>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: {
    stats: DashboardStats | undefined;
    people: DetailedStats['people'] | undefined;
    resources: DetailedStats['resources'] | undefined;
  };
  refetchAll: () => void;
  isStale: boolean;
}

export interface AdminDashboardData extends BaseDashboardData {
  users: UseQueryResult<DetailedStats['users']>;
  data: {
    stats: DashboardStats | undefined;
    people: DetailedStats['people'] | undefined;
    resources: DetailedStats['resources'] | undefined;
    users: DetailedStats['users'] | undefined;
  };
}

// Tipos para componentes
export interface StatCardProps {
  label: string;
  value: string | number;
  helpText?: string;
  icon: any;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  href?: string;
  isLoading?: boolean;
}

export interface QuickActionProps {
  name: string;
  href: string;
  icon: any;
  description: string;
  color: string;
}

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