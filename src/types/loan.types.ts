// types/loan.types.ts
// ================================================================
// TIPOS TYPESCRIPT PARA SISTEMA DE PRÉSTAMOS
// ================================================================

// ===== TIPOS BASE =====

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
  renewedBy?: string;
  renewedAt?: Date;
  daysOverdue?: number;
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanStatus {
  _id: string;
  name: 'active' | 'returned' | 'overdue' | 'lost';
  description: string;
  color: string;
  active: boolean;
}

// ===== TIPOS DE RESPUESTA CON DATOS POBLADOS =====

export interface LoanWithDetails extends Loan {
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
    totalQuantity?: number;
    currentLoansCount?: number;
    availableQuantity?: number;
    state?: {
      _id: string;
      name: string;
      description: string;
      color: string;
    };
    location?: {
      _id: string;
      name: string;
      description: string;
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

// ===== DTOs DE ENTRADA =====

export interface CreateLoanRequest {
  personId: string;
  resourceId: string;
  quantity?: number;
  observations?: string;
}

export interface UpdateLoanRequest {
  dueDate?: string;
  observations?: string;
  statusId?: string;
}

export interface ReturnLoanRequest {
  loanId: string;
  returnDate?: string;
  resourceCondition?: string;
  returnObservations?: string;
}

export interface MarkAsLostRequest {
  observations: string;
}

// ===== FILTROS Y BÚSQUEDA =====

export interface LoanSearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  personId?: string;
  resourceId?: string;
  statusId?: string;
  status?: 'active' | 'returned' | 'overdue' | 'lost';
  isOverdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  loanedBy?: string;
  returnedBy?: string;
  daysOverdue?: number;
  hasObservations?: boolean;
}

export interface OverdueFilters {
  page?: number;
  limit?: number;
  search?: string;
  personId?: string;
  personType?: 'student' | 'teacher';
  minDaysOverdue?: number;
  dateFrom?: string;
  dateTo?: string;
  grade?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== VALIDACIONES =====

export interface CanBorrowResult {
  canBorrow: boolean;
  reason?: string;
  activeLoansCount?: number;
  hasOverdueLoans?: boolean;
  maxLoansAllowed?: number;
  restrictions?: {
    hasOverdueLoans: boolean;
    hasReachedLimit: boolean;
    isPersonActive: boolean;
    hasActivePenalties: boolean;
  };
  currentLoans?: Array<{
    _id: string;
    resourceTitle: string;
    dueDate: Date;
    isOverdue: boolean;
    daysOverdue?: number;
  }>;
}

export interface ResourceAvailabilityResult {
  totalQuantity: number;
  currentLoans: number;
  availableQuantity: number;
  canLoan: boolean;
  resource: {
    _id: string;
    title: string;
    available: boolean;
  };
}

export interface LoanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  personInfo: {
    canBorrow: boolean;
    activeLoans: number;
    maxLoans: number;
    personType: string;
  };
  resourceInfo: {
    available: boolean;
    totalQuantity: number;
    currentLoans: number;
    availableQuantity: number;
  };
  quantityInfo: {
    requested: number;
    maxAllowed: number;
    reason: string;
  };
}

// ===== RESPUESTAS DE OPERACIONES =====

export interface ReturnLoanResponse {
  loan: LoanWithDetails;
  message: string;
  wasOverdue: boolean;
  daysOverdue?: number;
  fineAmount?: number;
}

export interface RenewLoanResponse {
  loan: LoanWithDetails;
  message: string;
  newDueDate: Date;
  renewCount: number;
}

// ===== ESTADÍSTICAS =====

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  lostLoans: number;
  averageLoanDuration: number;
  onTimeReturnRate: number;
  returnedThisMonth: number;
  topBorrowedResources: Array<{
    resourceId: string;
    title: string;
    author?: string;
    count: number;
  }>;
  topBorrowers: Array<{
    personId: string;
    fullName: string;
    count: number;
    activeLoans: number;
    overdueLoans: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

export interface OverdueStats {
  totalOverdue: number;
  averageDaysOverdue: number;
  byPersonType: {
    students: number;
    teachers: number;
  };
  byDaysOverdue: {
    '1-7': number;
    '8-14': number;
    '15-30': number;
    '30+': number;
  };
  mostOverdueResources: Array<{
    resourceId: string;
    title: string;
    count: number;
    averageDaysOverdue: number;
  }>;
}

export interface StockStats {
  totalResources: number;
  resourcesWithStock: number;
  resourcesWithoutStock: number;
  totalUnits: number;
  loanedUnits: number;
  availableUnits: number;
  topLoanedResources: Array<{
    resourceId: string;
    title: string;
    currentLoans: number;
    totalQuantity: number;
  }>;
  lowStockResources: Array<{
    resourceId: string;
    title: string;
    availableQuantity: number;
    totalQuantity: number;
  }>;
}

// ===== RESPUESTAS DE API =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== TIPOS PARA HOOKS Y ESTADO =====

export interface UseLoansState {
  loans: LoanWithDetails[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

export interface UseLoanState {
  loan: LoanWithDetails | null;
  loading: boolean;
  error: string | null;
}

export interface UseReturnState {
  processing: boolean;
  error: string | null;
  lastReturn: ReturnLoanResponse | null;
}

export interface UseOverdueState {
  overdueLoans: LoanWithDetails[];
  stats: OverdueStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

// ===== TIPOS PARA FORMULARIOS =====

export interface LoanFormData {
  personId: string;
  resourceId: string;
  quantity: number;
  observations?: string;
}

export interface ReturnFormData {
  returnDate?: string;
  resourceCondition?: string;
  returnObservations?: string;
}

export interface LoanFiltersData {
  search?: string;
  status?: string;
  personId?: string;
  resourceId?: string;
  isOverdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ===== ENUMS Y CONSTANTES =====

export enum LoanStatusEnum {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost'
}

export enum PersonTypeEnum {
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export const LOAN_LIMITS = {
  MAX_LOANS_PER_PERSON: 5,
  MAX_LOAN_DAYS: 15,
  MAX_QUANTITY_STUDENT: 3,
  MAX_QUANTITY_TEACHER: 10,
  MAX_QUANTITY_ABSOLUTE: 50
} as const;

// ===== TIPOS DE UTILIDAD =====

export type LoanSortField = 'loanDate' | 'dueDate' | 'returnedDate' | 'createdAt' | 'person.lastName' | 'resource.title';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: LoanSortField;
  order: SortOrder;
}

// ===== VALIDACIONES DE FORMULARIO =====

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}