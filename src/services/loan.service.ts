// src/services/loan.service.ts - VERSIÓN CORREGIDA SIN DUPLICADOS
import axiosInstance from '@/lib/axios';
import type {
  Loan,
  CreateLoanRequest,
  UpdateLoanRequest,
  ReturnLoanRequest,
  RenewLoanRequest,
  MarkAsLostRequest,
  LoanSearchFilters,
  LoanResponse,
  ReturnLoanResponse,
  RenewLoanResponse,
  CanBorrowResult,
  LoanValidationResult,
  LoanStats,
  PersonLoanStats,
  ResourceLoanStats,
  LoanListResponse,
  LoanDetailResponse,
  LoanStatsResponse,
  CanBorrowResponse,
  LoanValidationResponse,
  PersonLoanStatsResponse,
  ResourceLoanStatsResponse,
} from '@/types/loan.types';
import type { ApiResponse, PaginatedResponse, Person, Resource } from '@/types/api.types'; // ✅ AGREGAR PERSON Y RESOURCE

const LOAN_ENDPOINTS = {
  LOANS: '/loans',
  LOAN_BY_ID: (id: string) => `/loans/${id}`,
  CAN_BORROW: (personId: string) => `/loans/can-borrow/${personId}`,
  VALIDATE_LOAN: '/loans/validate',
  PERSON_LOANS: (personId: string) => `/loans/person/${personId}`,
  RESOURCE_LOANS: (resourceId: string) => `/loans/resource/${resourceId}`,
  
  // Operaciones de préstamo
  RETURN_LOAN: '/returns',
  RENEW_LOAN: (id: string) => `/returns/${id}/renew`,
  MARK_AS_LOST: (id: string) => `/returns/${id}/mark-lost`,
  
  // CORRECCIÓN
  LOAN_STATISTICS: '/loans/statistics',      // ✅ Existe
  LOAN_SUMMARY: '/loans/summary',           // ✅ Existe
  OVERDUE_STATS: '/overdue/stats',          // ✅ Existe
  PERSON_LOAN_STATS: (personId: string) => `/loans/person/${personId}/history`,
  RESOURCE_LOAN_STATS: (resourceId: string) => `/loans/resource/${resourceId}`,
  OVERDUE_LOANS: '/overdue',                // ✅ Existe
  LOANS_DUE_SOON: '/overdue/near-due',      // ✅ Existe

   // 🔧 NUEVOS ENDPOINTS para devoluciones
   RETURN_HISTORY: '/returns/history',                   // ✅ GET /api/returns/history
   PENDING_RETURNS: '/returns/pending',                  // ✅ GET /api/returns/pending
   RETURN_STATISTICS: (period: string) => `/returns/statistics/${period}`, // ✅ GET /api/returns/statistics/:period
   BATCH_RETURNS: '/returns/batch', 
  
  // Operaciones masivas
  BULK_CREATE: '/loans/bulk-create',
  BULK_RETURN: '/loans/bulk-return',
} as const;

export class LoanService {
  // ===== OPERACIONES BÁSICAS DE PRÉSTAMOS =====
  
  /**
   * Obtener préstamos con filtros
   */
  static async getLoans(filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    try {
      const params = new URLSearchParams();
      
      // Parámetros básicos
      if (filters.page && filters.page > 0) params.append('page', filters.page.toString());
      if (filters.limit && filters.limit > 0) params.append('limit', Math.min(filters.limit, 100).toString());
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      // Filtros específicos
      if (filters.personId) params.append('personId', filters.personId);
      if (filters.resourceId) params.append('resourceId', filters.resourceId);
      if (filters.statusId) params.append('statusId', filters.statusId);
      if (filters.status) params.append('status', filters.status);
      if (filters.loanedBy) params.append('loanedBy', filters.loanedBy);
      if (filters.returnedBy) params.append('returnedBy', filters.returnedBy);
      
      // Filtros por fecha
      if (filters.loanDateFrom) params.append('loanDateFrom', filters.loanDateFrom.toString());
      if (filters.loanDateTo) params.append('loanDateTo', filters.loanDateTo.toString());
      if (filters.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom.toString());
      if (filters.dueDateTo) params.append('dueDateTo', filters.dueDateTo.toString());
      if (filters.returnDateFrom) params.append('returnDateFrom', filters.returnDateFrom.toString());
      if (filters.returnDateTo) params.append('returnDateTo', filters.returnDateTo.toString());
      
      // Filtros especiales
      if (filters.isOverdue !== undefined) params.append('isOverdue', filters.isOverdue.toString());
      if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue.toString());
      if (filters.dueInDays) params.append('dueInDays', filters.dueInDays.toString());
      
      // Filtros por tipo
      if (filters.personType) params.append('personType', filters.personType);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.resourceCategory) params.append('resourceCategory', filters.resourceCategory);
      if (filters.grade) params.append('grade', filters.grade);

      const url = `${LOAN_ENDPOINTS.LOANS}?${params.toString()}`;
      
      console.log('🔍 LoanService: Obteniendo préstamos:', {
        url,
        filters,
        params: params.toString()
      });

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(url);

      console.log('✅ LoanService: Préstamos obtenidos:', {
        success: response.data.success,
        dataLength: response.data.data?.data?.length || 0,
        total: response.data.data?.pagination?.total || 0,
        status: response.status
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener préstamos');
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        filters
      });
      
      // Si hay problema de conectividad, crear respuesta vacía válida
      if (!error.response) {
        console.warn('🌐 LoanService: Error de conectividad, devolviendo respuesta vacía');
        return this.createEmptyLoansResponse(filters);
      }
      
      throw error;
    }
  }
  
  /**
   * Crear respuesta vacía válida para préstamos
   */
  private static createEmptyLoansResponse(filters: LoanSearchFilters): PaginatedResponse<Loan> {
    console.warn('🆘 LoanService: Creando respuesta vacía como fallback');
    return {
      data: [],
      pagination: {
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
  
  /**
   * Obtener préstamo por ID
   */
  static async getLoanById(id: string): Promise<LoanResponse> {
    try {
      console.log('🔍 LoanService: Obteniendo préstamo por ID:', id);
  
      const response = await axiosInstance.get<LoanDetailResponse>(
        LOAN_ENDPOINTS.LOAN_BY_ID(id)
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamo obtenido exitosamente');
        
        // CORRECCIÓN: Verificar que la respuesta tiene la estructura correcta
        const loanResponse = response.data.data;
        
        // Validar que la respuesta contiene las propiedades esperadas
        if (!loanResponse.loan) {
          console.error('❌ LoanService: Respuesta del servidor no contiene propiedad "loan"');
          throw new Error('Respuesta del servidor inválida: falta información del préstamo');
        }
        
        if (!loanResponse.person) {
          console.error('❌ LoanService: Respuesta del servidor no contiene propiedad "person"');
          throw new Error('Respuesta del servidor inválida: falta información de la persona');
        }
        
        if (!loanResponse.resource) {
          console.error('❌ LoanService: Respuesta del servidor no contiene propiedad "resource"');
          throw new Error('Respuesta del servidor inválida: falta información del recurso');
        }
        
        if (!loanResponse.status) {
          console.error('❌ LoanService: Respuesta del servidor no contiene propiedad "status"');
          throw new Error('Respuesta del servidor inválida: falta información del estado');
        }
        
        console.log('✅ LoanService: Estructura de respuesta validada correctamente');
        return loanResponse;
      }
      
      throw new Error(response.data.message || 'Error al obtener préstamo');
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamo por ID:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        loanId: id
      });
      throw error;
    }
  }
  
  /**
   * Crear nuevo préstamo
   */
  static async createLoan(loanData: CreateLoanRequest): Promise<Loan> {
    try {
      console.log('📝 LoanService: Creando préstamo:', loanData);

      const response = await axiosInstance.post<ApiResponse<Loan>>(
        LOAN_ENDPOINTS.LOANS,
        loanData
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamo creado exitosamente:', response.data.data._id);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear préstamo');
    } catch (error: any) {
      console.error('❌ LoanService: Error al crear préstamo:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar préstamo
   */
  static async updateLoan(id: string, loanData: UpdateLoanRequest): Promise<Loan> {
    try {
      console.log('📝 LoanService: Actualizando préstamo:', { id, loanData });

      const response = await axiosInstance.put<ApiResponse<Loan>>(
        LOAN_ENDPOINTS.LOAN_BY_ID(id),
        loanData
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamo actualizado exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al actualizar préstamo');
    } catch (error: any) {
      console.error('❌ LoanService: Error al actualizar préstamo:', error);
      throw error;
    }
  }
  
  // ===== VERIFICACIONES Y VALIDACIONES =====
  
  /**
   * Verificar si una persona puede pedir préstamos
   */
  static async canPersonBorrow(personId: string): Promise<CanBorrowResult> {
    try {
      console.log('🔍 LoanService: Verificando si la persona puede pedir préstamos:', personId);

      const response = await axiosInstance.get<CanBorrowResponse>(
        LOAN_ENDPOINTS.CAN_BORROW(personId)
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Verificación completada:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al verificar disponibilidad de préstamo');
    } catch (error: any) {
      console.error('❌ LoanService: Error al verificar disponibilidad:', error);
      throw error;
    }
  }
  
  /**
   * Validar datos de préstamo antes de crear
   */
  static async validateLoan(loanData: CreateLoanRequest): Promise<LoanValidationResult> {
    try {
      console.log('🔍 LoanService: Validando datos de préstamo:', loanData);

      const response = await axiosInstance.post<LoanValidationResponse>(
        LOAN_ENDPOINTS.VALIDATE_LOAN,
        loanData
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Validación completada');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al validar préstamo');
    } catch (error: any) {
      console.error('❌ LoanService: Error al validar préstamo:', error);
      throw error;
    }
  }
  
  // ===== OPERACIONES DE DEVOLUCIÓN =====
  
  /**
   * Procesar devolución de préstamo
   */
  static async returnLoan(returnData: ReturnLoanRequest): Promise<ReturnLoanResponse> {
    try {
      console.log('📝 LoanService: Procesando devolución:', returnData);
  
      // 🔧 CORRECCIÓN: Usar la estructura correcta que espera el backend
      const requestData = {
        loanId: returnData.loanId,
        returnDate: returnData.actualReturnDate,
        resourceCondition: returnData.resourceCondition,
        returnObservations: returnData.returnObservations
      };
  
      const response = await axiosInstance.post<ApiResponse<ReturnLoanResponse>>(
        LOAN_ENDPOINTS.RETURN_LOAN, // ← Ahora apunta a '/returns'
        requestData
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Devolución procesada exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al procesar devolución');
    } catch (error: any) {
      console.error('❌ LoanService: Error al procesar devolución:', error);
      throw error;
    }
  }
  
  /**
   * Renovar préstamo
   */
  static async renewLoan(id: string, renewData?: RenewLoanRequest): Promise<RenewLoanResponse> {
    try {
      console.log('🔄 LoanService: Renovando préstamo:', { id, renewData });
  
      const response = await axiosInstance.put<ApiResponse<RenewLoanResponse>>(
        LOAN_ENDPOINTS.RENEW_LOAN(id), // ← Ahora apunta a '/returns/:id/renew'
        renewData || {}
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamo renovado exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al renovar préstamo');
    } catch (error: any) {
      console.error('❌ LoanService: Error al renovar préstamo:', error);
      throw error;
    }
  }
  
  /**
   * Marcar préstamo como perdido
   */
  static async markAsLost(id: string, observations: string): Promise<Loan> {
    try {
      console.log('⚠️ LoanService: Marcando préstamo como perdido:', { id, observations });
  
      const response = await axiosInstance.put<ApiResponse<Loan>>(
        LOAN_ENDPOINTS.MARK_AS_LOST(id), // ← Ahora apunta a '/returns/:id/mark-lost'
        { observations }
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamo marcado como perdido');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al marcar como perdido');
    } catch (error: any) {
      console.error('❌ LoanService: Error al marcar como perdido:', error);
      throw error;
    }
  }
  
  // ===== CONSULTAS ESPECÍFICAS =====
  
  /**
   * Obtener préstamos de una persona
   */
  static async getPersonLoans(personId: string, filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    try {
      console.log('🔍 LoanService: Obteniendo préstamos de persona:', personId);

      return await this.getLoans({ ...filters, personId });
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos de persona:', error);
      throw error;
    }
  }
  
  /**
   * Obtener préstamos de un recurso
   */
  static async getResourceLoans(resourceId: string, filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    try {
      console.log('🔍 LoanService: Obteniendo préstamos de recurso:', resourceId);

      return await this.getLoans({ ...filters, resourceId });
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos de recurso:', error);
      throw error;
    }
  }
  
  /**
   * Obtener préstamos vencidos
   */
  static async getOverdueLoans(filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    try {
      console.log('⚠️ LoanService: Obteniendo préstamos vencidos');

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.daysOverdue) params.append('daysOverdue', filters.daysOverdue.toString());

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.OVERDUE_LOANS}?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamos vencidos obtenidos');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener préstamos vencidos');
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos vencidos:', error);
      throw error;
    }
  }
  
  /**
   * Obtener préstamos que vencen pronto
   */
  static async getLoansDueSoon(days: number = 3, filters: LoanSearchFilters = {}): Promise<PaginatedResponse<Loan>> {
    try {
      console.log('⏰ LoanService: Obteniendo préstamos que vencen pronto:', { days });

      const params = new URLSearchParams();
      params.append('days', days.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Loan>>>(
        `${LOAN_ENDPOINTS.LOANS_DUE_SOON}?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Préstamos que vencen pronto obtenidos');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener préstamos que vencen pronto');
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener préstamos que vencen pronto:', error);
      throw error;
    }
  }
  
  // ===== ESTADÍSTICAS - CORREGIDO PARA USAR ENDPOINTS REALES =====
  
  /**
   * Obtener estadísticas generales de préstamos - USANDO ENDPOINTS REALES
   */
  static async getLoanStats(): Promise<LoanStats> {
    try {
      console.log('📊 LoanService: Obteniendo estadísticas de préstamos desde múltiples endpoints');

      // Obtener datos de diferentes endpoints que SÍ existen
      const [statisticsResult, summaryResult, overdueResult] = await Promise.allSettled([
        axiosInstance.get<ApiResponse<any>>(LOAN_ENDPOINTS.LOAN_STATISTICS),
        axiosInstance.get<ApiResponse<any>>(LOAN_ENDPOINTS.LOAN_SUMMARY),
        axiosInstance.get<ApiResponse<any>>(LOAN_ENDPOINTS.OVERDUE_STATS)
      ]);

      // Procesar resultados de manera segura
      const statistics = statisticsResult.status === 'fulfilled' && statisticsResult.value.data.success 
        ? statisticsResult.value.data.data 
        : null;

      const summary = summaryResult.status === 'fulfilled' && summaryResult.value.data.success 
        ? summaryResult.value.data.data 
        : null;

      const overdueStats = overdueResult.status === 'fulfilled' && overdueResult.value.data.success 
        ? overdueResult.value.data.data 
        : null;

      // Combinar estadísticas de diferentes endpoints
      const combinedStats: LoanStats = {
        total: statistics?.totalLoans || summary?.totalLoans || 0,
        active: statistics?.activeLoans || summary?.activeLoans || 0,
        returned: summary?.returnedLoans || 0,
        overdue: statistics?.overdueLoans || summary?.overdueLoans || overdueStats?.totalOverdue || 0,
        lost: 0, // No disponible en endpoints actuales
        
        // Estadísticas por período (desde summary)
        today: {
          newLoans: summary?.period === 'today' ? summary.newLoans || 0 : 0,
          returns: summary?.period === 'today' ? summary.returnedLoans || 0 : 0,
          renewals: 0, // No disponible
        },
        
        thisWeek: {
          newLoans: summary?.period === 'week' ? summary.newLoans || 0 : 0,
          returns: summary?.period === 'week' ? summary.returnedLoans || 0 : 0,
          renewals: 0, // No disponible
        },
        
        thisMonth: {
          newLoans: summary?.period === 'month' ? summary.newLoans || 0 : 0,
          returns: summary?.period === 'month' ? summary.returnedLoans || 0 : 0,
          renewals: 0, // No disponible
        },
        
        // Tendencias (datos limitados disponibles)
        trends: [],
        
        // Top recursos (desde statistics si está disponible)
        topResources: (statistics?.mostBorrowedResources || []).map((item: any) => ({
          resource: { _id: item.resourceId, title: 'Recurso', available: true } as any,
          loanCount: item.count || 0
        })),
        
        // Top borrowers (no disponible en endpoints actuales)
        topBorrowers: [],
      };

      console.log('✅ LoanService: Estadísticas combinadas exitosamente:', combinedStats);
      return combinedStats;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener estadísticas:', error);
      
      // En caso de error total, devolver estadísticas vacías pero válidas
      const fallbackStats: LoanStats = {
        total: 0,
        active: 0,
        returned: 0,
        overdue: 0,
        lost: 0,
        today: { newLoans: 0, returns: 0, renewals: 0 },
        thisWeek: { newLoans: 0, returns: 0, renewals: 0 },
        thisMonth: { newLoans: 0, returns: 0, renewals: 0 },
        trends: [],
        topResources: [],
        topBorrowers: [],
      };
      
      console.warn('🆘 LoanService: Devolviendo estadísticas de fallback');
      return fallbackStats;
    }
  }
  
  /**
   * Obtener resumen de préstamos por período
   */
  static async getLoanSummary(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    try {
      console.log('📊 LoanService: Obteniendo resumen de préstamos para período:', period);

      const response = await axiosInstance.get<ApiResponse<any>>(
        `${LOAN_ENDPOINTS.LOAN_SUMMARY}?period=${period}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ LoanService: Resumen obtenido exitosamente');
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al obtener resumen de préstamos');
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener resumen:', error);
      
      // Fallback con datos vacíos
      return {
        totalLoans: 0,
        newLoans: 0,
        returnedLoans: 0,
        overdueLoans: 0,
        activeLoans: 0,
        period,
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() }
      };
    }
  }
  
  /**
   * Obtener estadísticas de préstamos de una persona - CORREGIDO
   */
  static async getPersonLoanStats(personId: string): Promise<PersonLoanStats> {
    try {
      console.log('📊 LoanService: Obteniendo estadísticas de préstamos de persona:', personId);

      // Usar endpoint de historial que SÍ existe
      const response = await axiosInstance.get<ApiResponse<any>>(
        LOAN_ENDPOINTS.PERSON_LOAN_STATS(personId)
      );
      
      if (response.data.success && response.data.data) {
        const loans = response.data.data;
        
        // Calcular estadísticas desde los datos de préstamos
        const stats: PersonLoanStats = {
          personId,
          person: {} as Person, // ✅ CORREGIDO: Ahora Person está importado
          totalLoans: loans.length,
          activeLoans: loans.filter((l: any) => l.status?.name === 'active').length,
          returnedLoans: loans.filter((l: any) => l.status?.name === 'returned').length,
          overdueLoans: loans.filter((l: any) => l.status?.name === 'overdue').length,
          lostLoans: loans.filter((l: any) => l.status?.name === 'lost').length,
          averageLoanDuration: 0, // Calcular si es necesario
          onTimeReturnRate: 0, // Calcular si es necesario
          currentCanBorrow: { canBorrow: true, activeLoans: 0, maxLoans: 5, overdueLoans: 0, availableSlots: 5 },
          loanHistory: loans
        };
        
        console.log('✅ LoanService: Estadísticas de persona calculadas');
        return stats;
      }
      
      throw new Error(response.data.message || 'Error al obtener estadísticas de persona');
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener estadísticas de persona:', error);
      
      // Fallback con estadísticas vacías
      return {
        personId,
        person: {} as Person,
        totalLoans: 0,
        activeLoans: 0,
        returnedLoans: 0,
        overdueLoans: 0,
        lostLoans: 0,
        averageLoanDuration: 0,
        onTimeReturnRate: 0,
        currentCanBorrow: { canBorrow: true, activeLoans: 0, maxLoans: 5, overdueLoans: 0, availableSlots: 5 },
        loanHistory: []
      };
    }
  }
  
  /**
   * Obtener estadísticas de préstamos de un recurso - CORREGIDO
   */
  static async getResourceLoanStats(resourceId: string): Promise<ResourceLoanStats> {
    try {
      console.log('📊 LoanService: Obteniendo estadísticas de préstamos de recurso:', resourceId);

      // Usar getLoans con filtro de recurso
      const response = await this.getLoans({ resourceId, limit: 100 });
      const loans = response.data;
      
      const stats: ResourceLoanStats = {
        resourceId,
        resource: {} as Resource, // ✅ CORREGIDO: Ahora Resource está importado
        totalLoans: loans.length,
        currentlyBorrowed: loans.some(l => l.status?.name === 'active'),
        averageLoanDuration: 0, // Calcular si es necesario
        popularityRank: 0, // No disponible
        lastBorrowed: loans.length > 0 ? new Date(loans[0].loanDate) : undefined,
        mostFrequentBorrower: undefined, // No disponible
        loanHistory: loans
      };
      
      console.log('✅ LoanService: Estadísticas de recurso calculadas');
      return stats;
    } catch (error: any) {
      console.error('❌ LoanService: Error al obtener estadísticas de recurso:', error);
      
      // Fallback con estadísticas vacías
      return {
        resourceId,
        resource: {} as Resource,
        totalLoans: 0,
        currentlyBorrowed: false,
        averageLoanDuration: 0,
        popularityRank: 0,
        lastBorrowed: undefined,
        mostFrequentBorrower: undefined,
        loanHistory: []
      };
    }
  }
}

// Exportar clase e instancia para compatibilidad
// The LoanService class is already exported above, so this line can be removed.
export const loanService = LoanService;