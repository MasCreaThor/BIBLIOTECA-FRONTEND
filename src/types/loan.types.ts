// src/types/loan.types.ts
import type { ApiResponse, PaginatedResponse, Person, Resource, User } from './api.types';

// ===== INTERFACES PRINCIPALES =====

export interface LoanStatus {
  _id: string;
  name: 'active' | 'returned' | 'overdue' | 'lost';
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  _id: string;
  personId: string;
  resourceId: string;
  quantity: number;
  loanDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  statusId: string;
  loanedBy: string;
  returnedBy?: string;
  observations?: string;
  returnObservations?: string;
  
  // Datos populados (cuando están disponibles)
  person?: Person;
  resource?: Resource;
  status?: LoanStatus;
  loanedByUser?: User;
  returnedByUser?: User;
  
  // Campos calculados
  isOverdue?: boolean;
  daysOverdue?: number;
  daysUntilDue?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ===== REQUESTS =====

export interface CreateLoanRequest {
  personId: string;
  resourceId: string;
  quantity?: number;
  observations?: string;
  dueDate?: Date; // Opcional, si no se especifica usa default del sistema
}

export interface UpdateLoanRequest {
  quantity?: number;
  dueDate?: Date;
  observations?: string;
  statusId?: string;
}

export interface ReturnLoanRequest {
  loanId: string;
  returnObservations?: string;
  resourceCondition?: 'good' | 'deteriorated' | 'damaged';
  actualReturnDate?: Date; // Opcional, si no se especifica usa fecha actual
}

export interface RenewLoanRequest {
  loanId: string;
  additionalDays?: number; // Opcional, si no se especifica usa default del sistema
  observations?: string;
}

export interface MarkAsLostRequest {
  loanId: string;
  observations: string; // Requerido para préstamos perdidos
  lostDate?: Date; // Opcional, si no se especifica usa fecha actual
}

// ===== RESPONSES =====

export interface LoanResponse {
  loan: Loan;
  person: Person;
  resource: Resource;
  status: LoanStatus;
  loanedByUser?: User;
  returnedByUser?: User;
}

export interface ReturnLoanResponse {
  loan: Loan;
  message: string;
  wasOverdue: boolean;
  daysOverdue?: number;
  penalty?: {
    amount: number;
    currency: string;
    description: string;
  };
}

export interface RenewLoanResponse {
  loan: Loan;
  message: string;
  previousDueDate: Date;
  newDueDate: Date;
  renewalCount: number;
  maxRenewals: number;
}

// ===== FILTROS Y BÚSQUEDA =====

export interface LoanSearchFilters {
  search?: string; // Búsqueda general en persona o recurso
  personId?: string;
  resourceId?: string;
  statusId?: string;
  status?: 'active' | 'returned' | 'overdue' | 'lost';
  loanedBy?: string;
  returnedBy?: string;
  
  // Filtros por fecha
  loanDateFrom?: string | Date;
  loanDateTo?: string | Date;
  dueDateFrom?: string | Date;
  dueDateTo?: string | Date;
  returnDateFrom?: string | Date;
  returnDateTo?: string | Date;
  
  // Filtros especiales
  isOverdue?: boolean;
  daysOverdue?: number; // Préstamos con X días de retraso
  dueInDays?: number; // Préstamos que vencen en X días
  
  // Filtros por tipo de persona/recurso
  personType?: 'student' | 'teacher';
  resourceType?: 'book' | 'game' | 'map' | 'bible';
  resourceCategory?: string;
  grade?: string;
  
  // Paginación y ordenamiento
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== VERIFICACIONES Y VALIDACIONES =====

export interface CanBorrowResult {
  canBorrow: boolean;
  reason?: string;
  activeLoans: number;
  maxLoans: number;
  overdueLoans: number;
  availableSlots: number;
  restrictions?: {
    hasOverdueLoans: boolean;
    reachedMaxLoans: boolean;
    personInactive: boolean;
    systemRestriction: boolean;
  };
}

export interface LoanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  resourceAvailable: boolean;
  personCanBorrow: boolean;
  systemConfiguration: {
    maxLoansPerPerson: number;
    loanDurationDays: number;
    allowRenewals: boolean;
    maxRenewals: number;
  };
}

// ===== ESTADÍSTICAS =====

export interface LoanStats {
  total: number;
  active: number;
  returned: number;
  overdue: number;
  lost: number;
  
  // Estadísticas por período
  today: {
    newLoans: number;
    returns: number;
    renewals: number;
  };
  
  thisWeek: {
    newLoans: number;
    returns: number;
    renewals: number;
  };
  
  thisMonth: {
    newLoans: number;
    returns: number;
    renewals: number;
  };
  
  // Tendencias
  trends: Array<{
    period: string;
    loans: number;
    returns: number;
    overdue: number;
  }>;
  
  // Top recursos y personas
  topResources: Array<{
    resource: Resource;
    loanCount: number;
  }>;
  
  topBorrowers: Array<{
    person: Person;
    loanCount: number;
    overdueCount: number;
  }>;
}

export interface PersonLoanStats {
  personId: string;
  person: Person;
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  lostLoans: number;
  averageLoanDuration: number;
  onTimeReturnRate: number;
  currentCanBorrow: CanBorrowResult;
  loanHistory: Loan[];
}

export interface ResourceLoanStats {
  resourceId: string;
  resource: Resource;
  totalLoans: number;
  currentlyBorrowed: boolean;
  averageLoanDuration: number;
  popularityRank: number;
  lastBorrowed?: Date;
  mostFrequentBorrower?: Person;
  loanHistory: Loan[];
}

// ===== CONFIGURACIÓN DEL SISTEMA =====

export interface LoanSystemConfiguration {
  maxLoansPerPerson: number;
  loanDurationDays: number;
  allowRenewals: boolean;
  maxRenewals: number;
  renewalExtensionDays: number;
  overdueGracePeriodDays: number;
  
  // Restricciones
  requirePersonActive: boolean;
  requireResourceAvailable: boolean;
  allowBorrowingWithOverdue: boolean;
  
  // Notificaciones
  sendReminders: boolean;
  reminderDaysBeforeDue: number;
  sendOverdueNotifications: boolean;
  
  // Penalties
  enablePenalties: boolean;
  penaltyPerDay: number;
  penaltyCurrency: string;
}

// ===== REPORTES =====

export interface LoanReport {
  title: string;
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  
  summary: {
    totalLoans: number;
    totalReturns: number;
    totalOverdue: number;
    totalLost: number;
    averageLoanDuration: number;
    onTimeReturnRate: number;
  };
  
  detailsByPerson: Array<{
    person: Person;
    stats: PersonLoanStats;
  }>;
  
  detailsByResource: Array<{
    resource: Resource;
    stats: ResourceLoanStats;
  }>;
  
  detailsByDate: Array<{
    date: Date;
    newLoans: number;
    returns: number;
    overdue: number;
  }>;
}

// ===== NOTIFICACIONES =====

export interface LoanNotification {
  _id: string;
  type: 'reminder' | 'overdue' | 'returned' | 'renewed' | 'lost';
  loanId: string;
  personId: string;
  resourceId: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
  
  // Datos adicionales según el tipo
  metadata?: {
    daysUntilDue?: number;
    daysOverdue?: number;
    newDueDate?: Date;
    penaltyAmount?: number;
  };
}

// ===== TIPOS DE RESPUESTA DE LA API =====

export type LoanListResponse = ApiResponse<PaginatedResponse<Loan>>;
export type LoanDetailResponse = ApiResponse<LoanResponse>;
export type LoanStatsResponse = ApiResponse<LoanStats>;
export type CanBorrowResponse = ApiResponse<CanBorrowResult>;
export type LoanValidationResponse = ApiResponse<LoanValidationResult>;
export type PersonLoanStatsResponse = ApiResponse<PersonLoanStats>;
export type ResourceLoanStatsResponse = ApiResponse<ResourceLoanStats>;
export type LoanReportResponse = ApiResponse<LoanReport>;
export type LoanNotificationListResponse = ApiResponse<PaginatedResponse<LoanNotification>>;

// ===== OPERACIONES MASIVAS =====

export interface BulkLoanOperation {
  loans: CreateLoanRequest[];
  options: {
    validateOnly?: boolean;
    skipDuplicates?: boolean;
    continueOnError?: boolean;
    defaultDueDate?: Date;
  };
}

export interface BulkLoanResult {
  successful: Loan[];
  failed: Array<{
    request: CreateLoanRequest;
    error: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

export interface BulkReturnOperation {
  returns: Array<{
    loanId: string;
    returnObservations?: string;
    resourceCondition?: 'good' | 'deteriorated' | 'damaged';
  }>;
  options: {
    validateOnly?: boolean;
    continueOnError?: boolean;
    defaultReturnDate?: Date;
  };
}

export interface BulkReturnResult {
  successful: ReturnLoanResponse[];
  failed: Array<{
    loanId: string;
    error: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}