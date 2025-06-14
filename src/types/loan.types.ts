// src/types/loan.types.ts - IMPLEMENTACIÓN COMPLETA
import type { Person, Resource } from './api.types';

/**
 * Estado de un préstamo
 */
export interface LoanStatus {
  _id: string;
  name: 'active' | 'returned' | 'overdue' | 'lost';
  description: string;
  color: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Préstamo completo con información poblada
 */
export interface Loan {
  _id: string;
  personId: string;
  resourceId: string;
  quantity: number;
  loanDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  statusId: string;
  observations?: string;
  loanedBy: string;
  returnedBy?: string;
  daysOverdue?: number;
  isOverdue?: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Información poblada
  person?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    documentNumber?: string;
    grade?: string;
    personType?: {
      _id: string;
      name: string;
      description: string;
    };
  };
  resource?: {
    _id: string;
    title: string;
    isbn?: string;
    author?: string;
    category?: string;
    available?: boolean;
    state?: {
      _id: string;
      name: string;
      description: string;
      color: string;
    };
  };
  status?: {
    _id: string;
    name: string;
    description: string;
    color: string;
  };
  loanedByUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  returnedByUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
}

/**
 * Datos para crear un nuevo préstamo
 */
export interface CreateLoanRequest {
  personId: string;
  resourceId: string;
  quantity?: number;
  observations?: string;
}

/**
 * Datos para procesar una devolución
 */
export interface ReturnLoanRequest {
  loanId: string;
  returnDate?: string;
  resourceCondition?: 'good' | 'deteriorated' | 'damaged' | 'lost';
  returnObservations?: string;
}

/**
 * Respuesta de una devolución procesada
 */
export interface ReturnLoanResponse {
  loan: Loan;
  daysOverdue: number;
  wasOverdue: boolean;
  resourceConditionChanged: boolean;
  message: string;
  penalties?: {
    hasLateReturnPenalty: boolean;
    penaltyDays?: number;
    penaltyAmount?: number;
  };
}

/**
 * Filtros para búsqueda de préstamos
 */
export interface LoanSearchFilters {
  search?: string;
  status?: 'active' | 'returned' | 'overdue' | 'lost';
  personId?: string;
  resourceId?: string;
  statusId?: string;
  dateFrom?: string;
  dateTo?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  loanedBy?: string;
  returnedBy?: string;
  hasObservations?: boolean;
}

/**
 * Estadísticas de préstamos
 */
export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  lostResources: number;
  averageLoanDuration: number;
  totalPeople: number;
  totalResources: number;
  
  // Estadísticas por período
  thisMonth: {
    newLoans: number;
    returnedLoans: number;
    overdueLoans: number;
  };
  
  thisWeek: {
    newLoans: number;
    returnedLoans: number;
    overdueLoans: number;
  };
  
  today: {
    newLoans: number;
    returnedLoans: number;
    overdueLoans: number;
  };

  // Top recursos más prestados
  mostBorrowedResources: Array<{
    resourceId: string;
    title: string;
    author?: string;
    borrowCount: number;
    category?: string;
  }>;

  // Top personas con más préstamos
  topBorrowers: Array<{
    personId: string;
    fullName: string;
    borrowCount: number;
    activeLoans: number;
    overdueLoans: number;
  }>;

  // Distribución por estado
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;

  // Tendencias por mes (últimos 12 meses)
  monthlyTrends: Array<{
    month: string;
    year: number;
    newLoans: number;
    returnedLoans: number;
    overdueLoans: number;
  }>;
}

/**
 * Resultado de verificación si una persona puede pedir préstamos
 */
export interface CanBorrowResult {
  canBorrow: boolean;
  reason?: string;
  overdueCount?: number;
  activeCount?: number;
  maxLoansAllowed?: number;
  
  // Información adicional
  restrictions?: {
    hasOverdueLoans: boolean;
    hasReachedLimit: boolean;
    isPersonActive: boolean;
    hasActivePenalties: boolean;
  };
  
  // Información de préstamos actuales
  currentLoans?: Array<{
    _id: string;
    resourceTitle: string;
    dueDate: Date;
    isOverdue: boolean;
    daysOverdue?: number;
  }>;
  
  // Próximos vencimientos
  upcomingDueDates?: Array<{
    _id: string;
    resourceTitle: string;
    dueDate: Date;
    daysUntilDue: number;
  }>;
}

/**
 * Configuración de límites del sistema
 */
export interface LoanConfiguration {
  maxLoansPerPerson: number;
  maxLoanDays: number;
  minQuantity: number;
  maxQuantity: number;
  allowRenewals: boolean;
  maxRenewals: number;
  renewalDays: number;
  penaltyDaysThreshold: number;
  
  // Configuración por tipo de persona
  personTypeConfigs?: Array<{
    personType: string;
    maxLoans: number;
    maxDays: number;
    allowRenewals: boolean;
  }>;
  
  // Configuración por categoría de recurso
  resourceCategoryConfigs?: Array<{
    category: string;
    maxDays: number;
    allowRenewals: boolean;
    priority: number;
  }>;
}

/**
 * Notificación de préstamo
 */
export interface LoanNotification {
  _id: string;
  loanId: string;
  personId: string;
  type: 'due_soon' | 'overdue' | 'returned' | 'lost';
  message: string;
  sentDate: Date;
  isRead: boolean;
  
  // Información del préstamo
  loan?: {
    resourceTitle: string;
    dueDate: Date;
    daysOverdue?: number;
  };
  
  // Información de la persona
  person?: {
    fullName: string;
    email?: string;
    documentNumber?: string;
  };
}

/**
 * Reporte de préstamos
 */
export interface LoanReport {
  _id: string;
  title: string;
  description: string;
  generatedDate: Date;
  generatedBy: string;
  parameters: {
    dateFrom: Date;
    dateTo: Date;
    filters: LoanSearchFilters;
  };
  
  // Datos del reporte
  summary: {
    totalLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    lostResources: number;
  };
  
  // Detalles
  loans: Loan[];
  
  // Gráficos y estadísticas
  charts: Array<{
    type: 'bar' | 'pie' | 'line';
    title: string;
    data: any[];
  }>;
}

/**
 * Préstamo extendido (con información adicional para reportes)
 */
export interface ExtendedLoan extends Loan {
  // Información calculada
  loanDuration?: number; // días entre préstamo y devolución
  categoryName?: string;
  personTypeName?: string;
  locationName?: string;
  
  // Información de renovaciones
  renewals?: Array<{
    renewedDate: Date;
    previousDueDate: Date;
    newDueDate: Date;
    renewedBy: string;
    reason?: string;
  }>;
  
  // Historial de estados
  statusHistory?: Array<{
    status: string;
    changedDate: Date;
    changedBy: string;
    reason?: string;
  }>;
  
  // Penalizaciones aplicadas
  penalties?: Array<{
    type: 'late_return' | 'lost_resource' | 'damaged_resource';
    amount: number;
    appliedDate: Date;
    description: string;
    isPaid: boolean;
  }>;
}

/**
 * Estado de un recurso después de devolución
 */
export interface ResourceCondition {
  condition: 'good' | 'deteriorated' | 'damaged' | 'lost';
  description: string;
  requiresAction: boolean;
  suggestedAction?: string;
  estimatedRepairCost?: number;
}

/**
 * Resumen de préstamos por período
 */
export interface LoanSummary {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  totals: {
    newLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    activeLoans: number;
    lostResources: number;
  };
  comparisons: {
    previousPeriod: {
      newLoans: number;
      returnedLoans: number;
      changePercentage: number;
    };
  };
  topResources: Array<{
    resourceId: string;
    title: string;
    borrowCount: number;
  }>;
  topBorrowers: Array<{
    personId: string;
    fullName: string;
    borrowCount: number;
  }>;
}

/**
 * Métricas de rendimiento del sistema de préstamos
 */
export interface LoanMetrics {
  totalProcessedRequests: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  
  // Métricas por operación
  operations: {
    create: {
      count: number;
      averageTime: number;
      successRate: number;
    };
    return: {
      count: number;
      averageTime: number;
      successRate: number;
    };
    search: {
      count: number;
      averageTime: number;
      successRate: number;
    };
  };
  
  // Métricas de uso
  usage: {
    peakHours: string[];
    busyDays: string[];
    averageLoansPerDay: number;
    averageReturnsPerDay: number;
  };
}

// Exportaciones adicionales para compatibilidad
export type { Person, Resource };

// Enums útiles
export enum LoanStatusEnum {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost'
}

export enum ResourceConditionEnum {
  GOOD = 'good',
  DETERIORATED = 'deteriorated',
  DAMAGED = 'damaged',
  LOST = 'lost'
}

export enum NotificationTypeEnum {
  DUE_SOON = 'due_soon',
  OVERDUE = 'overdue',
  RETURNED = 'returned',
  LOST = 'lost'
}

// Validadores de tipo
export const isValidLoanStatus = (status: string): status is LoanStatusEnum => {
  return Object.values(LoanStatusEnum).includes(status as LoanStatusEnum);
};

export const isValidResourceCondition = (condition: string): condition is ResourceConditionEnum => {
  return Object.values(ResourceConditionEnum).includes(condition as ResourceConditionEnum);
};

// Utilidades de fecha para préstamos
export const LoanDateUtils = {
  calculateDueDate: (loanDate: Date, loanDays: number = 15): Date => {
    const due = new Date(loanDate);
    due.setDate(due.getDate() + loanDays);
    return due;
  },
  
  calculateDaysOverdue: (dueDate: Date, returnDate?: Date): number => {
    const compareDate = returnDate || new Date();
    if (compareDate <= dueDate) return 0;
    
    const diffTime = compareDate.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
  
  isOverdue: (dueDate: Date, returnDate?: Date): boolean => {
    const compareDate = returnDate || new Date();
    return compareDate > dueDate;
  },
  
  getDaysUntilDue: (dueDate: Date): number => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
  
  formatDueStatus: (dueDate: Date, returnDate?: Date): string => {
    if (returnDate) return 'Devuelto';
    
    const daysUntilDue = LoanDateUtils.getDaysUntilDue(dueDate);
    
    if (daysUntilDue < 0) {
      return `Vencido hace ${Math.abs(daysUntilDue)} día${Math.abs(daysUntilDue) > 1 ? 's' : ''}`;
    } else if (daysUntilDue === 0) {
      return 'Vence hoy';
    } else if (daysUntilDue === 1) {
      return 'Vence mañana';
    } else if (daysUntilDue <= 3) {
      return `Vence en ${daysUntilDue} días`;
    } else {
      return `Vence el ${dueDate.toLocaleDateString()}`;
    }
  }
};