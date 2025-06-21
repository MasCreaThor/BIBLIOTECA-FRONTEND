// services/loan.service.ts
// ================================================================
// SERVICIO DE PRÉSTAMOS - FRONTEND CORREGIDO
// ================================================================

import axiosInstance from '@/lib/axios';
import type {
  Loan,
  LoanWithDetails,
  CreateLoanRequest,
  UpdateLoanRequest,
  ReturnLoanRequest,
  MarkAsLostRequest,
  LoanSearchFilters,
  OverdueFilters,
  CanBorrowResult,
  ResourceAvailabilityResult,
  LoanValidationResult,
  ReturnLoanResponse,
  RenewLoanResponse,
  LoanStats,
  OverdueStats,
  StockStats,
  ApiResponse,
  PaginatedResponse
} from '@/types/loan.types';

// ===== ENDPOINTS CORREGIDOS =====
const LOAN_ENDPOINTS = {
  // Préstamos principales
  LOANS: '/loans',
  LOAN_BY_ID: (id: string) => `/loans/${id}`,
  VALIDATE_LOAN: '/loans/validate',
  PERSON_LOANS: (personId: string) => `/loans/person/${personId}`,
  RESOURCE_LOANS: (resourceId: string) => `/loans/resource/${resourceId}`,
  
  // Validaciones - CORREGIDO
  CAN_BORROW: (personId: string) => `/loans/can-borrow/${personId}`,
  RESOURCE_AVAILABILITY: (resourceId: string) => `/loans/resource-availability/${resourceId}`,
  
  // Devoluciones - ENDPOINTS CORREGIDOS
  RETURNS: '/returns',
  MARK_AS_LOST: (loanId: string) => `/returns/${loanId}/mark-lost`,
  RENEW_LOAN: (loanId: string) => `/returns/${loanId}/renew`,
  RETURN_HISTORY: '/returns/history',
  PENDING_RETURNS: '/returns/pending',
  
  // Préstamos vencidos
  OVERDUE: '/overdue',
  OVERDUE_STATS: '/overdue/stats',
  LOANS_DUE_SOON: '/overdue/near-due',
  
  // Estadísticas
  LOAN_STATISTICS: '/loans/statistics',
  LOAN_SUMMARY: '/loans/summary',
  STOCK_STATISTICS: '/loans/stock-stats'
} as const;

// ===== HELPER PARA MANEJAR RESPUESTAS API =====
const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (response.success && response.data !== undefined) {
    return response.data;
  }
  throw new Error(response.message || 'Error en la operación');
};

// ===== HELPER PARA FORMATEAR FECHAS =====
const formatDateForApi = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

// ===== SERVICIO PRINCIPAL =====
export class LoanService {
  
  // ===== OPERACIONES DE PRÉSTAMOS =====
  
  /**
   * Crear un nuevo préstamo
   */
  static async createLoan(data: CreateLoanRequest): Promise<LoanWithDetails> {
    try {
      console.log('🔄 LoanService: Creando préstamo:', data);

      // ✅ CORRECCIÓN: Asegurar que quantity esté presente
      const requestData = {
        personId: data.personId,
        resourceId: data.resourceId,
        quantity: data.quantity || 1, // Default a 1 si no se proporciona
        observations: data.observations?.trim() || undefined
      };

      const response = await axiosInstance.post<ApiResponse<LoanWithDetails>>(
        LOAN_ENDPOINTS.LOANS,
        requestData
      );
      
      const loan = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamo creado exitosamente:', loan._id);
      return loan;
    } catch (error: any) {
      console.error('❌ LoanService: Error al crear préstamo:', error);
      throw error;
    }
  }

  /**
   * Obtener préstamo por ID
   */
  static async getLoanById(id: string): Promise<LoanWithDetails> {
    try {
      console.log('🔍 LoanService: Obteniendo préstamo:', id);

      const response = await axiosInstance.get<ApiResponse<LoanWithDetails>>(
        LOAN_ENDPOINTS.LOAN_BY_ID(id)
      );
      
      const loan = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamo obtenido exitosamente');
      return loan;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamo:', error);
      throw error;
    }
  }

  /**
   * Buscar préstamos con filtros y paginación
   */
  static async searchLoans(filters: LoanSearchFilters = {}): Promise<PaginatedResponse<LoanWithDetails>> {
    try {
      console.log('🔍 LoanService: Buscando préstamos con filtros:', filters);

      // ✅ CORRECCIÓN: Formatear fechas correctamente
      const params = {
        ...filters,
        dateFrom: formatDateForApi(filters.dateFrom),
        dateTo: formatDateForApi(filters.dateTo)
      };

      console.log('🔍 LoanService: Parámetros enviados al backend:', params);
      console.log('🔍 LoanService: URL del endpoint:', LOAN_ENDPOINTS.LOANS);

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<LoanWithDetails>>>(
        LOAN_ENDPOINTS.LOANS,
        { params }
      );
      
      console.log('🔍 LoanService: Respuesta del backend:', response.data);
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Búsqueda completada:', result.pagination.total, 'préstamos');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al buscar préstamos:', error);
      console.error('❌ LoanService: Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Actualizar préstamo
   */
  static async updateLoan(id: string, data: UpdateLoanRequest): Promise<LoanWithDetails> {
    try {
      console.log('📝 LoanService: Actualizando préstamo:', id, data);

      // ✅ CORRECCIÓN: Formatear fecha de vencimiento
      const requestData = {
        ...data,
        dueDate: formatDateForApi(data.dueDate),
        observations: data.observations?.trim() || undefined
      };

      const response = await axiosInstance.put<ApiResponse<LoanWithDetails>>(
        LOAN_ENDPOINTS.LOAN_BY_ID(id),
        requestData
      );
      
      const loan = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamo actualizado exitosamente');
      return loan;
    } catch (error: any) {
      console.error('❌ LoanService: Error al actualizar préstamo:', error);
      throw error;
    }
  }

  // ===== VALIDACIONES =====

  /**
   * Verificar si una persona puede pedir préstamos
   */
  static async canPersonBorrow(personId: string): Promise<CanBorrowResult> {
    try {
      console.log('🔍 LoanService: Verificando elegibilidad de persona:', personId);

      const response = await axiosInstance.get<ApiResponse<CanBorrowResult>>(
        LOAN_ENDPOINTS.CAN_BORROW(personId)
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Verificación completada. Puede prestar:', result.canBorrow);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al verificar elegibilidad:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de recurso
   */
  static async checkResourceAvailability(resourceId: string): Promise<ResourceAvailabilityResult> {
    try {
      console.log('🔍 LoanService: Verificando disponibilidad de recurso:', resourceId);

      const response = await axiosInstance.get<ApiResponse<ResourceAvailabilityResult>>(
        LOAN_ENDPOINTS.RESOURCE_AVAILABILITY(resourceId)
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Disponibilidad verificada. Puede prestar:', result.canLoan);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al verificar disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Validar préstamo antes de crear
   */
  static async validateLoan(data: CreateLoanRequest): Promise<LoanValidationResult> {
    try {
      console.log('🔍 LoanService: Validando datos de préstamo:', data);

      // ✅ CORRECCIÓN: Asegurar quantity
      const requestData = {
        ...data,
        quantity: data.quantity || 1
      };

      const response = await axiosInstance.post<ApiResponse<LoanValidationResult>>(
        LOAN_ENDPOINTS.VALIDATE_LOAN,
        requestData
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Validación completada. Es válido:', result.isValid);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al validar préstamo:', error);
      throw error;
    }
  }

  // ===== OPERACIONES DE DEVOLUCIÓN =====

  /**
   * Procesar devolución de préstamo
   */
  static async returnLoan(data: ReturnLoanRequest): Promise<ReturnLoanResponse> {
    try {
      console.log('📝 LoanService: Procesando devolución:', data);

      // ✅ CORRECCIÓN: Usar estructura correcta y formatear fecha
      const requestData = {
        loanId: data.loanId,
        returnDate: formatDateForApi(data.returnDate) || new Date().toISOString(),
        resourceCondition: data.resourceCondition?.trim(),
        returnObservations: data.returnObservations?.trim()
      };

      const response = await axiosInstance.post<ApiResponse<ReturnLoanResponse>>(
        LOAN_ENDPOINTS.RETURNS, // ✅ ENDPOINT CORREGIDO
        requestData
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Devolución procesada exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al procesar devolución:', error);
      throw error;
    }
  }

  /**
   * Marcar préstamo como perdido
   */
  static async markAsLost(loanId: string, data: MarkAsLostRequest): Promise<LoanWithDetails> {
    try {
      console.log('📝 LoanService: Marcando como perdido:', loanId, 'lostQuantity:', data.lostQuantity);

      const response = await axiosInstance.put<ApiResponse<LoanWithDetails>>(
        LOAN_ENDPOINTS.MARK_AS_LOST(loanId),
        {
          observations: data.observations.trim(),
          lostQuantity: data.lostQuantity
        }
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Marcado como perdido exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al marcar como perdido:', error);
      throw error;
    }
  }

  /**
   * Renovar préstamo
   */
  static async renewLoan(loanId: string, newDueDate?: string): Promise<RenewLoanResponse> {
    try {
      console.log('🔄 LoanService: Renovando préstamo:', loanId);

      const requestData = newDueDate ? {
        newDueDate: formatDateForApi(newDueDate)
      } : {};

      const response = await axiosInstance.put<ApiResponse<RenewLoanResponse>>(
        LOAN_ENDPOINTS.RENEW_LOAN(loanId),
        requestData
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamo renovado exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al renovar préstamo:', error);
      throw error;
    }
  }

  // ===== GESTIÓN DE PRÉSTAMOS VENCIDOS =====

  /**
   * Obtener préstamos vencidos
   */
  static async getOverdueLoans(filters: OverdueFilters = {}): Promise<PaginatedResponse<LoanWithDetails>> {
    try {
      console.log('🔍 LoanService: Obteniendo préstamos vencidos:', filters);

      // ✅ CORRECCIÓN: Formatear fechas
      const params = {
        ...filters,
        dateFrom: formatDateForApi(filters.dateFrom),
        dateTo: formatDateForApi(filters.dateTo)
      };

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<LoanWithDetails>>>(
        LOAN_ENDPOINTS.OVERDUE,
        { params }
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamos vencidos obtenidos:', result.pagination.total);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos vencidos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de préstamos vencidos
   */
  static async getOverdueStats(): Promise<OverdueStats> {
    try {
      console.log('📊 LoanService: Obteniendo estadísticas de vencidos');

      const response = await axiosInstance.get<ApiResponse<OverdueStats>>(
        LOAN_ENDPOINTS.OVERDUE_STATS
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Estadísticas de vencidos obtenidas');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener estadísticas de vencidos:', error);
      throw error;
    }
  }

  /**
   * Obtener préstamos próximos a vencer
   */
  static async getLoansDueSoon(days: number = 3): Promise<LoanWithDetails[]> {
    try {
      console.log('⏰ LoanService: Obteniendo préstamos próximos a vencer');

      const response = await axiosInstance.get<ApiResponse<LoanWithDetails[]>>(
        LOAN_ENDPOINTS.LOANS_DUE_SOON,
        { params: { days } }
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamos próximos a vencer obtenidos:', result.length);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos próximos a vencer:', error);
      throw error;
    }
  }

  /**
   * ✅ NUEVO: Actualizar estados de préstamos vencidos manualmente
   */
  static async updateOverdueStatuses(): Promise<{ updatedCount: number }> {
    try {
      console.log('🔄 LoanService: Actualizando estados de préstamos vencidos');

      const response = await axiosInstance.post<ApiResponse<{ updatedCount: number }>>(
        '/overdue/update-statuses'
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Estados de préstamos vencidos actualizados:', result.updatedCount);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al actualizar estados de préstamos vencidos:', error);
      throw error;
    }
  }

  // ===== ESTADÍSTICAS Y REPORTES =====

  /**
   * Obtener estadísticas generales de préstamos
   */
  static async getLoanStatistics(): Promise<LoanStats> {
    try {
      console.log('📊 LoanService: Obteniendo estadísticas generales');

      const response = await axiosInstance.get<ApiResponse<LoanStats>>(
        LOAN_ENDPOINTS.LOAN_STATISTICS
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Estadísticas generales obtenidas');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener estadísticas generales:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de stock
   */
  static async getStockStatistics(): Promise<StockStats> {
    try {
      console.log('📊 LoanService: Obteniendo estadísticas de stock');

      const response = await axiosInstance.get<ApiResponse<StockStats>>(
        LOAN_ENDPOINTS.STOCK_STATISTICS
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Estadísticas de stock obtenidas');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener estadísticas de stock:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen rápido de préstamos
   */
  static async getLoanSummary(): Promise<{
    totalActive: number;
    totalOverdue: number;
    totalDueSoon: number;
    totalReturnsToday: number;
  }> {
    try {
      console.log('📋 LoanService: Obteniendo resumen de préstamos');

      const response = await axiosInstance.get<ApiResponse<{
        totalActive: number;
        totalOverdue: number;
        totalDueSoon: number;
        totalReturnsToday: number;
      }>>(LOAN_ENDPOINTS.LOAN_SUMMARY);
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Resumen obtenido');
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener resumen:', error);
      throw error;
    }
  }

  // ===== OPERACIONES POR PERSONA/RECURSO =====

  /**
   * Obtener préstamos de una persona específica
   */
  static async getPersonLoans(personId: string, filters: Partial<LoanSearchFilters> = {}): Promise<PaginatedResponse<LoanWithDetails>> {
    try {
      console.log('👤 LoanService: Obteniendo préstamos de persona:', personId);

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<LoanWithDetails>>>(
        LOAN_ENDPOINTS.PERSON_LOANS(personId),
        { params: filters }
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamos de persona obtenidos:', result.pagination.total);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos de persona:', error);
      throw error;
    }
  }

  /**
   * Obtener préstamos de un recurso específico
   */
  static async getResourceLoans(resourceId: string, filters: Partial<LoanSearchFilters> = {}): Promise<PaginatedResponse<LoanWithDetails>> {
    try {
      console.log('📚 LoanService: Obteniendo préstamos de recurso:', resourceId);

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<LoanWithDetails>>>(
        LOAN_ENDPOINTS.RESOURCE_LOANS(resourceId),
        { params: filters }
      );
      
      const result = handleApiResponse(response.data);
      console.log('✅ LoanService: Préstamos de recurso obtenidos:', result.pagination.total);
      return result;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos de recurso:', error);
      throw error;
    }
  }

  // ===== UTILIDADES =====

  /**
   * Obtener configuración de límites del sistema
   */
  static getSystemLimits() {
    return {
      maxLoansPerPerson: 5,
      maxLoanDays: 15,
      maxQuantityStudent: 3,
      maxQuantityTeacher: 10,
      maxQuantityAbsolute: 50
    };
  }

  /**
   * Calcular días de retraso
   */
  static calculateDaysOverdue(dueDate: Date | string): number {
    const due = new Date(dueDate);
    const now = new Date();
    
    if (now <= due) return 0;
    
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verificar si un préstamo está vencido
   */
  static isLoanOverdue(loan: Loan): boolean {
    return !loan.returnedDate && new Date() > new Date(loan.dueDate);
  }

  /**
   * Formatear fecha para mostrar
   */
  static formatDisplayDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

export default LoanService;