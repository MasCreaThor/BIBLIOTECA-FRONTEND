import axiosInstance from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResponse,
  Loan,
  LoanStatus,
  CreateLoanRequest,
  ReturnLoanRequest,
  SearchFilters,
} from '@/types/api.types';

const LOAN_ENDPOINTS = {
  LOANS: '/loans',
  LOAN_BY_ID: (id: string) => `/loans/${id}`,
  RETURN_LOAN: (id: string) => `/loans/${id}/return`,
  OVERDUE_LOANS: '/loans/overdue',
  ACTIVE_LOANS: '/loans/active',
  LOAN_HISTORY: '/loans/history',
  LOAN_STATS: '/loans/stats',
  LOAN_STATUSES: '/loans/statuses',
  PERSON_LOANS: (personId: string) => `/loans/person/${personId}`,
  RESOURCE_LOANS: (resourceId: string) => `/loans/resource/${resourceId}`,
} as const;

export interface LoanFilters extends SearchFilters {
  status?: 'active' | 'returned' | 'overdue' | 'lost';
  personId?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  daysOverdue?: number;
}

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  averageLoanDuration: number;
  mostBorrowedResources: Array<{
    resourceId: string;
    title: string;
    borrowCount: number;
  }>;
}

export class LoanService {
  /**
   * Crear un nuevo préstamo
   */
  static async createLoan(loanData: CreateLoanRequest): Promise<Loan> {
    const response = await axiosInstance.post<ApiResponse<Loan>>(
      LOAN_ENDPOINTS.LOANS,
      loanData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear préstamo');
  }

  /**
   * Obtener todos los préstamos con filtros
   */
  static async getLoans(filters: LoanFilters = {}): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();

    // Agregar parámetros de filtro
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.personId) params.append('personId', filters.personId);
    if (filters.resourceId) params.append('resourceId', filters.resourceId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
      `${LOAN_ENDPOINTS.LOANS}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener préstamos');
  }

  /**
   * Obtener préstamo por ID
   */
  static async getLoanById(id: string): Promise<Loan> {
    const response = await axiosInstance.get<ApiResponse<Loan>>(
      LOAN_ENDPOINTS.LOAN_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener préstamo');
  }

  /**
   * Procesar devolución de préstamo
   */
  static async returnLoan(id: string, returnData: ReturnLoanRequest): Promise<Loan> {
    const response = await axiosInstance.post<ApiResponse<Loan>>(
      LOAN_ENDPOINTS.RETURN_LOAN(id),
      returnData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al procesar devolución');
  }

  /**
   * Obtener préstamos vencidos
   */
  static async getOverdueLoans(filters: LoanFilters = {}): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
      `${LOAN_ENDPOINTS.OVERDUE_LOANS}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener préstamos vencidos');
  }

  /**
   * Obtener préstamos activos
   */
  static async getActiveLoans(filters: LoanFilters = {}): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.personId) params.append('personId', filters.personId);
    if (filters.resourceId) params.append('resourceId', filters.resourceId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
      `${LOAN_ENDPOINTS.ACTIVE_LOANS}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener préstamos activos');
  }

  /**
   * Obtener historial de préstamos
   */
  static async getLoanHistory(filters: LoanFilters = {}): Promise<PaginatedResponse<Loan>> {
    return this.getLoans({
      ...filters,
      status: 'returned',
    });
  }

  /**
   * Obtener préstamos de una persona
   */
  static async getPersonLoans(personId: string, filters: LoanFilters = {}): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
      `${LOAN_ENDPOINTS.PERSON_LOANS(personId)}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener préstamos de la persona');
  }

  /**
   * Obtener préstamos de un recurso
   */
  static async getResourceLoans(resourceId: string, filters: LoanFilters = {}): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
      `${LOAN_ENDPOINTS.RESOURCE_LOANS(resourceId)}?${params.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener préstamos del recurso');
  }

  /**
   * Obtener estadísticas de préstamos
   */
  static async getLoanStats(): Promise<LoanStats> {
    const response = await axiosInstance.get<ApiResponse<LoanStats>>(
      LOAN_ENDPOINTS.LOAN_STATS
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estadísticas de préstamos');
  }

  /**
   * Obtener estados de préstamos
   */
  static async getLoanStatuses(): Promise<LoanStatus[]> {
    const response = await axiosInstance.get<ApiResponse<LoanStatus[]>>(
      LOAN_ENDPOINTS.LOAN_STATUSES
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estados de préstamos');
  }

  /**
   * Verificar si una persona puede pedir préstamos
   */
  static async canPersonBorrow(personId: string): Promise<{
    canBorrow: boolean;
    reason?: string;
    overdueCount?: number;
    activeCount?: number;
  }> {
    try {
      // Obtener préstamos activos de la persona
      const activeLoans = await this.getPersonLoans(personId, { status: 'active', limit: 100 });
      
      // Obtener préstamos vencidos
      const overdueLoans = await this.getPersonLoans(personId, { status: 'overdue', limit: 100 });

      const overdueCount = overdueLoans.pagination.total;
      const activeCount = activeLoans.pagination.total;

      // Verificar si tiene préstamos vencidos
      if (overdueCount > 0) {
        return {
          canBorrow: false,
          reason: 'Tiene préstamos vencidos pendientes',
          overdueCount,
          activeCount,
        };
      }

      // Verificar límite de préstamos activos (ejemplo: máximo 3)
      const maxActiveLoans = 3;
      if (activeCount >= maxActiveLoans) {
        return {
          canBorrow: false,
          reason: `Ha alcanzado el límite máximo de ${maxActiveLoans} préstamos activos`,
          overdueCount,
          activeCount,
        };
      }

      return {
        canBorrow: true,
        overdueCount,
        activeCount,
      };
    } catch (error) {
      return {
        canBorrow: false,
        reason: 'Error al verificar el estado de préstamos',
      };
    }
  }

  /**
   * Calcular días de retraso
   */
  static calculateOverdueDays(dueDate: string | Date): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Verificar si un préstamo está vencido
   */
  static isLoanOverdue(dueDate: string | Date): boolean {
    return this.calculateOverdueDays(dueDate) > 0;
  }

  /**
   * Calcular fecha de vencimiento (15 días después de la fecha de préstamo)
   */
  static calculateDueDate(loanDate: string | Date = new Date()): Date {
    const loan = new Date(loanDate);
    const due = new Date(loan);
    due.setDate(due.getDate() + 15); // 15 días como se especifica en el backend
    return due;
  }
}