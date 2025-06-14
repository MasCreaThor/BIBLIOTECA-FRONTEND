// src/services/loan.service.ts
import axiosInstance from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/types/api.types';
import {
  Loan,
  LoanStatus,
  CreateLoanRequest,
  ReturnLoanRequest,
  LoanSearchFilters,
  LoanStats,
  CanBorrowResult,
  ReturnLoanResponse,
} from '@/types/loan.types';

const LOAN_ENDPOINTS = {
  LOANS: '/loans',
  LOAN_BY_ID: (id: string) => `/loans/${id}`,
  RETURN_LOAN: '/returns',
  MARK_AS_LOST: (id: string) => `/returns/${id}/mark-lost`,
  OVERDUE_LOANS: '/loans/overdue',
  ACTIVE_LOANS: '/loans/active',
  LOAN_HISTORY: '/loans/history',
  LOAN_STATS: '/loans/stats',
  LOAN_STATUSES: '/loan-statuses',
  PERSON_LOANS: (personId: string) => `/loans/person/${personId}`,
  RESOURCE_LOANS: (resourceId: string) => `/loans/resource/${resourceId}`,
  CAN_BORROW: (personId: string) => `/loans/can-borrow/${personId}`,
  UPDATE_OVERDUE: '/loans/update-overdue',
} as const;

export class LoanService {
  /**
   * Crear un nuevo préstamo con validación mejorada
   */
  static async createLoan(loanData: CreateLoanRequest): Promise<Loan> {
    console.log('LoanService.createLoan called with:', loanData);

    // Validaciones del lado cliente
    if (!loanData.personId) {
      throw new Error('Debe especificar una persona');
    }

    if (!loanData.resourceId) {
      throw new Error('Debe especificar un recurso');
    }

    if (loanData.quantity && (loanData.quantity < 1 || loanData.quantity > 5)) {
      throw new Error('La cantidad debe estar entre 1 y 5');
    }

    if (loanData.observations && loanData.observations.length > 500) {
      throw new Error('Las observaciones no pueden exceder 500 caracteres');
    }

    // Limpiar y preparar datos
    const cleanData: CreateLoanRequest = {
      personId: loanData.personId.trim(),
      resourceId: loanData.resourceId.trim(),
      quantity: loanData.quantity || 1,
      observations: loanData.observations?.trim() || undefined,
    };

    console.log('Sending cleaned loan data to backend:', cleanData);

    try {
      const response = await axiosInstance.post<ApiResponse<Loan>>(
        LOAN_ENDPOINTS.LOANS,
        cleanData
      );

      console.log('Backend response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al crear préstamo');
    } catch (error: any) {
      console.error('Error in createLoan:', error);
      
      // Mejorar el manejo de errores específicos
      if (error.response?.data?.message) {
        const backendMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message;
        throw new Error(backendMessage);
      }
      
      if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Error de conexión al crear préstamo');
    }
  }

  /**
   * Obtener todos los préstamos con filtros
   */
  static async getLoans(filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    console.log('LoanService.getLoans called with filters:', filters);

    const params = new URLSearchParams();

    // Agregar parámetros de filtro
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.personId) params.append('personId', filters.personId);
    if (filters.resourceId) params.append('resourceId', filters.resourceId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.isOverdue !== undefined) params.append('isOverdue', filters.isOverdue.toString());
    if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.LOANS}?${params.toString()}`
      );

      console.log('getLoans response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener préstamos');
    } catch (error: any) {
      console.error('Error in getLoans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener préstamos');
    }
  }

  /**
   * Obtener préstamo por ID
   */
  static async getLoanById(id: string): Promise<Loan> {
    console.log('LoanService.getLoanById called with ID:', id);

    if (!id || id.trim().length === 0) {
      throw new Error('ID de préstamo requerido');
    }

    try {
      const response = await axiosInstance.get<ApiResponse<Loan>>(
        LOAN_ENDPOINTS.LOAN_BY_ID(id.trim())
      );

      console.log('getLoanById response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener préstamo');
    } catch (error: any) {
      console.error('Error in getLoanById:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener préstamo');
    }
  }

  /**
   * Procesar devolución de préstamo
   */
  static async returnLoan(returnData: ReturnLoanRequest): Promise<ReturnLoanResponse> {
    console.log('LoanService.returnLoan called with:', returnData);

    // Validaciones del lado cliente
    if (!returnData.loanId) {
      throw new Error('ID de préstamo requerido');
    }

    if (returnData.returnObservations && returnData.returnObservations.length > 500) {
      throw new Error('Las observaciones de devolución no pueden exceder 500 caracteres');
    }

    // Limpiar datos
    const cleanData: ReturnLoanRequest = {
      loanId: returnData.loanId.trim(),
      returnDate: returnData.returnDate,
      resourceCondition: returnData.resourceCondition,
      returnObservations: returnData.returnObservations?.trim() || undefined,
    };

    try {
      const response = await axiosInstance.post<ApiResponse<ReturnLoanResponse>>(
        LOAN_ENDPOINTS.RETURN_LOAN,
        cleanData
      );

      console.log('returnLoan response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al procesar devolución');
    } catch (error: any) {
      console.error('Error in returnLoan:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al procesar devolución');
    }
  }

  /**
   * Marcar préstamo como perdido
   */
  static async markAsLost(id: string, observations: string): Promise<Loan> {
    console.log('LoanService.markAsLost called with:', { id, observations });

    // Validaciones del lado cliente
    if (!id || id.trim().length === 0) {
      throw new Error('ID de préstamo requerido');
    }

    if (!observations || observations.trim().length === 0) {
      throw new Error('Las observaciones son requeridas para marcar como perdido');
    }

    if (observations.length > 500) {
      throw new Error('Las observaciones no pueden exceder 500 caracteres');
    }

    try {
      const response = await axiosInstance.put<ApiResponse<Loan>>(
        LOAN_ENDPOINTS.MARK_AS_LOST(id.trim()),
        { observations: observations.trim() }
      );

      console.log('markAsLost response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al marcar como perdido');
    } catch (error: any) {
      console.error('Error in markAsLost:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al marcar como perdido');
    }
  }

  /**
   * Verificar si una persona puede pedir préstamos
   */
  static async canPersonBorrow(personId: string): Promise<CanBorrowResult> {
    console.log('LoanService.canPersonBorrow called with personId:', personId);

    if (!personId || personId.trim().length === 0) {
      throw new Error('ID de persona requerido');
    }

    try {
      const response = await axiosInstance.get<ApiResponse<CanBorrowResult>>(
        LOAN_ENDPOINTS.CAN_BORROW(personId.trim())
      );

      console.log('canPersonBorrow response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al verificar disponibilidad de préstamo');
    } catch (error: any) {
      console.error('Error in canPersonBorrow:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al verificar disponibilidad de préstamo');
    }
  }

  /**
   * Obtener préstamos vencidos
   */
  static async getOverdueLoans(filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    console.log('LoanService.getOverdueLoans called with filters:', filters);

    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.OVERDUE_LOANS}?${params.toString()}`
      );

      console.log('getOverdueLoans response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener préstamos vencidos');
    } catch (error: any) {
      console.error('Error in getOverdueLoans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener préstamos vencidos');
    }
  }

  /**
   * Obtener préstamos activos
   */
  static async getActiveLoans(filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    console.log('LoanService.getActiveLoans called with filters:', filters);

    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.personId) params.append('personId', filters.personId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.ACTIVE_LOANS}?${params.toString()}`
      );

      console.log('getActiveLoans response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener préstamos activos');
    } catch (error: any) {
      console.error('Error in getActiveLoans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener préstamos activos');
    }
  }

  /**
   * Obtener préstamos de una persona
   */
  static async getPersonLoans(personId: string, filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    console.log('LoanService.getPersonLoans called with:', { personId, filters });

    if (!personId || personId.trim().length === 0) {
      throw new Error('ID de persona requerido');
    }

    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.PERSON_LOANS(personId.trim())}?${params.toString()}`
      );

      console.log('getPersonLoans response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener préstamos de la persona');
    } catch (error: any) {
      console.error('Error in getPersonLoans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener préstamos de la persona');
    }
  }

  /**
   * Obtener préstamos de un recurso
   */
  static async getResourceLoans(resourceId: string, filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    console.log('LoanService.getResourceLoans called with:', { resourceId, filters });

    if (!resourceId || resourceId.trim().length === 0) {
      throw new Error('ID de recurso requerido');
    }

    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.RESOURCE_LOANS(resourceId.trim())}?${params.toString()}`
      );

      console.log('getResourceLoans response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener préstamos del recurso');
    } catch (error: any) {
      console.error('Error in getResourceLoans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener préstamos del recurso');
    }
  }

  /**
   * Obtener estadísticas de préstamos
   */
  static async getLoanStats(): Promise<LoanStats> {
    console.log('LoanService.getLoanStats called');

    try {
      const response = await axiosInstance.get<ApiResponse<LoanStats>>(
        LOAN_ENDPOINTS.LOAN_STATS
      );

      console.log('getLoanStats response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estadísticas de préstamos');
    } catch (error: any) {
      console.error('Error in getLoanStats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener estadísticas de préstamos');
    }
  }

  /**
   * Obtener estados de préstamos
   */
  static async getLoanStatuses(): Promise<LoanStatus[]> {
    console.log('LoanService.getLoanStatuses called');

    try {
      const response = await axiosInstance.get<ApiResponse<LoanStatus[]>>(
        LOAN_ENDPOINTS.LOAN_STATUSES
      );

      console.log('getLoanStatuses response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener estados de préstamos');
    } catch (error: any) {
      console.error('Error in getLoanStatuses:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener estados de préstamos');
    }
  }

  /**
   * Actualizar préstamos vencidos
   */
  static async updateOverdueLoans(): Promise<{ updatedCount: number }> {
    console.log('LoanService.updateOverdueLoans called');

    try {
      const response = await axiosInstance.post<ApiResponse<{ updatedCount: number }>>(
        LOAN_ENDPOINTS.UPDATE_OVERDUE
      );

      console.log('updateOverdueLoans response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al actualizar préstamos vencidos');
    } catch (error: any) {
      console.error('Error in updateOverdueLoans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al actualizar préstamos vencidos');
    }
  }

  /**
   * Renovar préstamo (extender fecha de vencimiento)
   */
  static async renewLoan(loanId: string, additionalDays: number = 15): Promise<Loan> {
    console.log('LoanService.renewLoan called with:', { loanId, additionalDays });

    if (!loanId || loanId.trim().length === 0) {
      throw new Error('ID de préstamo requerido');
    }

    if (additionalDays < 1 || additionalDays > 30) {
      throw new Error('Los días adicionales deben estar entre 1 y 30');
    }

    try {
      const response = await axiosInstance.post<ApiResponse<Loan>>(
        `${LOAN_ENDPOINTS.LOAN_BY_ID(loanId.trim())}/renew`,
        { additionalDays }
      );

      console.log('renewLoan response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al renovar préstamo');
    } catch (error: any) {
      console.error('Error in renewLoan:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al renovar préstamo');
    }
  }

  /**
   * Buscar préstamos por rango de fechas
   */
  static async getLoansByDateRange(
    startDate: string, 
    endDate: string, 
    filters: LoanSearchFilters = {}
  ): Promise<PaginatedResponse<Loan>> {
    console.log('LoanService.getLoansByDateRange called with:', { startDate, endDate, filters });

    if (!startDate || !endDate) {
      throw new Error('Fechas de inicio y fin son requeridas');
    }

    const searchFilters: LoanSearchFilters = {
      ...filters,
      dateFrom: startDate,
      dateTo: endDate
    };

    return this.getLoans(searchFilters);
  }

  /**
   * Obtener resumen de préstamos por período
   */
  static async getLoanSummary(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalLoans: number;
    newLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    activeLoans: number;
  }> {
    console.log('LoanService.getLoanSummary called with period:', period);

    try {
      const response = await axiosInstance.get<ApiResponse<any>>(
        `${LOAN_ENDPOINTS.LOAN_STATS}/summary?period=${period}`
      );

      console.log('getLoanSummary response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener resumen de préstamos');
    } catch (error: any) {
      console.error('Error in getLoanSummary:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener resumen de préstamos');
    }
  }
}