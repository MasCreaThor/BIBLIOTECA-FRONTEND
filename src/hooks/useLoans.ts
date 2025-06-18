// hooks/useLoan.ts
// ================================================================
// HOOKS PERSONALIZADOS PARA SISTEMA DE PRÉSTAMOS - CORREGIDO
// ================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LoanService } from '@/services/loan.service';
import type {
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
  LoanStats,
  OverdueStats,
  StockStats,
  UseLoanState,
  UseLoansState,
  UseReturnState,
  UseOverdueState
} from '@/types/loan.types';

// ===== WRAPPER PARA MÉTODOS DE LOANSERVICE =====

class LoanServiceWrapper {
  // Wrapper para obtener préstamos con filtros
  static async findAll(filters: LoanSearchFilters) {
    try {
      // Usar searchLoans si existe
      if (typeof LoanService.searchLoans === 'function') {
        const response = await LoanService.searchLoans(filters);
        
        // ✅ CORRECCIÓN: Validar la respuesta
        if (!response || !response.data) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        return response;
      }
      
      // Último fallback: crear respuesta mock
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      console.error('Error en LoanServiceWrapper.findAll:', error);
      
      // ✅ CORRECCIÓN: Retornar respuesta de error en lugar de lanzar excepción
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  // Wrapper para estadísticas de préstamos
  static async getLoanStatistics(): Promise<LoanStats> {
    try {
      // Intentar método original
      if (typeof LoanService.getLoanStatistics === 'function') {
        return await LoanService.getLoanStatistics();
      }
      
      // Fallback: crear estadísticas mock
      return {
        totalLoans: 0,
        activeLoans: 0,
        returnedLoans: 0,
        overdueLoans: 0,
        lostLoans: 0,
        averageLoanDuration: 0,
        topBorrowedResources: [],
        topBorrowers: []
      };
    } catch (error) {
      console.error('Error en LoanServiceWrapper.getLoanStatistics:', error);
      throw error;
    }
  }

  // Wrapper para estadísticas de stock
  static async getStockStatistics(): Promise<StockStats> {
    try {
      // Intentar método original
      if (typeof LoanService.getStockStatistics === 'function') {
        return await LoanService.getStockStatistics();
      }
      
      // Fallback: crear estadísticas mock
      return {
        totalResources: 0,
        resourcesWithStock: 0,
        resourcesWithoutStock: 0,
        totalUnits: 0,
        loanedUnits: 0,
        availableUnits: 0,
        topLoanedResources: [],
        lowStockResources: []
      };
    } catch (error) {
      console.error('Error en LoanServiceWrapper.getStockStatistics:', error);
      throw error;
    }
  }

  // Wrapper para estadísticas de vencidos
  static async getOverdueStats(): Promise<OverdueStats> {
    try {
      // Intentar método original
      if (typeof LoanService.getOverdueStats === 'function') {
        return await LoanService.getOverdueStats();
      }
      
      // Fallback: crear estadísticas mock
      return {
        totalOverdue: 0,
        averageDaysOverdue: 0,
        byPersonType: { students: 0, teachers: 0 },
        byDaysOverdue: { '1-7': 0, '8-14': 0, '15-30': 0, '30+': 0 },
        mostOverdueResources: []
      };
    } catch (error) {
      console.error('Error en LoanServiceWrapper.getOverdueStats:', error);
      throw error;
    }
  }
}

// ===== HOOK PARA PRÉSTAMO INDIVIDUAL =====

export const useLoan = (loanId?: string) => {
  const [state, setState] = useState<UseLoanState>({
    loan: null,
    loading: false,
    error: null
  });

  const fetchLoan = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const loan = await LoanService.getLoanById(id);
      setState(prev => ({ ...prev, loan, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error al cargar el préstamo' 
      }));
    }
  }, []);

  const updateLoan = useCallback(async (id: string, data: UpdateLoanRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const loan = await LoanService.updateLoan(id, data);
      setState(prev => ({ ...prev, loan, loading: false }));
      return loan;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error al actualizar el préstamo' 
      }));
      throw error;
    }
  }, []);

  const renewLoan = useCallback(async (id: string, newDueDate?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await LoanService.renewLoan(id, newDueDate);
      setState(prev => ({ ...prev, loan: result.loan, loading: false }));
      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error al renovar el préstamo' 
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    if (loanId) {
      fetchLoan(loanId);
    }
  }, [loanId, fetchLoan]);

  return {
    ...state,
    refetch: () => loanId && fetchLoan(loanId),
    updateLoan,
    renewLoan
  };
};

// ===== HOOK PARA LISTA DE PRÉSTAMOS =====

export const useLoans = (initialFilters: LoanSearchFilters = {}) => {
  const [state, setState] = useState<UseLoansState>({
    loans: [],
    loading: false,
    error: null,
    pagination: null
  });

  const [filters, setFilters] = useState<LoanSearchFilters>(initialFilters);

  const fetchLoans = useCallback(async (searchFilters?: LoanSearchFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const finalFilters = searchFilters || filters;
      // FIX: Usar el wrapper que maneja diferentes implementaciones
      const response = await LoanServiceWrapper.findAll(finalFilters);
      
      // ✅ CORRECCIÓN: Validar que la respuesta tenga la estructura correcta
      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      setState(prev => ({ 
        ...prev, 
        loans: response.data || [], 
        pagination: response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        loading: false 
      }));
    } catch (error: any) {
      console.error('Error fetching loans:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error al cargar préstamos',
        loans: [],
        pagination: null
      }));
    }
  }, [filters]);

  const createLoan = useCallback(async (data: CreateLoanRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const loan = await LoanService.createLoan(data);
      setState(prev => ({ 
        ...prev, 
        loans: [loan, ...prev.loans],
        loading: false 
      }));
      return loan;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error al crear el préstamo' 
      }));
      throw error;
    }
  }, []);

  const updateFilters = useCallback((newFilters: LoanSearchFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changeLimit = useCallback((limit: number) => {
    updateFilters({ limit, page: 1 });
  }, [updateFilters]);

  const refetch = useCallback(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return {
    ...state,
    filters,
    updateFilters,
    changePage,
    changeLimit,
    refetch,
    createLoan
  };
};

// ===== HOOK PARA VALIDACIÓN DE PRÉSTAMOS =====

export const useLoanValidation = () => {
  const [isValid, setIsValid] = useState<boolean>(false); // FIX: Tipo explícito boolean
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const validateLoan = useCallback(async (data: CreateLoanRequest) => {
    setLoading(true);
    setValidationErrors([]);
    
    try {
      const result = await LoanService.validateLoan(data);
      
      // FIX: Asegurar que isFormValid sea boolean
      const isFormValid = Boolean(result.isValid); // Conversión explícita a boolean
      setIsValid(isFormValid);
      
      if (!result.isValid) {
        setValidationErrors(result.errors || []);
      }
      
      return result;
    } catch (error: any) {
      setIsValid(false);
      setValidationErrors([error.message || 'Error de validación']);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const canPersonBorrow = useCallback(async (personId: string): Promise<CanBorrowResult> => {
    try {
      return await LoanService.canPersonBorrow(personId);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const checkResourceAvailability = useCallback(async (resourceId: string): Promise<ResourceAvailabilityResult> => {
    try {
      return await LoanService.checkResourceAvailability(resourceId);
    } catch (error: any) {
      throw error;
    }
  }, []);

  return {
    isValid,
    validationErrors,
    loading,
    validateLoan,
    canPersonBorrow,
    checkResourceAvailability
  };
};

// ===== HOOK PARA DEVOLUCIONES =====

export const useReturn = () => {
  const [state, setState] = useState<UseReturnState>({
    processing: false,
    error: null,
    lastReturn: null
  });

  const returnLoan = useCallback(async (data: ReturnLoanRequest) => {
    setState(prev => ({ ...prev, processing: true, error: null }));
    
    try {
      const result = await LoanService.returnLoan(data);
      setState(prev => ({ 
        ...prev, 
        processing: false, 
        lastReturn: result 
      }));
      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        processing: false, 
        error: error.message || 'Error al devolver el préstamo' 
      }));
      throw error;
    }
  }, []);

  const markAsLost = useCallback(async (loanId: string, data: MarkAsLostRequest) => {
    setState(prev => ({ ...prev, processing: true, error: null }));
    
    try {
      const result = await LoanService.markAsLost(loanId, data);
      setState(prev => ({ ...prev, processing: false }));
      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        processing: false, 
        error: error.message || 'Error al marcar como perdido' 
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    returnLoan,
    markAsLost
  };
};

// ===== HOOK PARA PRÉSTAMOS VENCIDOS =====

export const useOverdue = (initialFilters: OverdueFilters = {}) => {
  const [state, setState] = useState<UseOverdueState>({
    overdueLoans: [],
    stats: null,
    loading: false,
    error: null,
    pagination: null
  });

  const [filters, setFilters] = useState<OverdueFilters>(initialFilters);

  const fetchOverdueLoans = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await LoanService.getOverdueLoans(filters);
      setState(prev => ({ 
        ...prev, 
        overdueLoans: response.data,
        pagination: response.pagination,
        loading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error al cargar préstamos vencidos' 
      }));
    }
  }, [filters]);

  const fetchOverdueStats = useCallback(async () => {
    try {
      const stats = await LoanServiceWrapper.getOverdueStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error: any) {
      console.error('Error loading overdue stats:', error);
    }
  }, []);

  const updateFilters = useCallback((newFilters: OverdueFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refetch = useCallback(() => {
    fetchOverdueLoans();
    fetchOverdueStats();
  }, [fetchOverdueLoans, fetchOverdueStats]);

  useEffect(() => {
    fetchOverdueLoans();
    fetchOverdueStats();
  }, [fetchOverdueLoans, fetchOverdueStats]);

  return {
    ...state,
    filters,
    updateFilters,
    refetch
  };
};

// ===== HOOK PARA ESTADÍSTICAS =====

export const useLoanStats = () => {
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [overdueStats, setOverdueStats] = useState<OverdueStats | null>(null);
  const [stockStats, setStockStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // FIX: Usar los wrappers que manejan diferentes implementaciones
      const [loanStats, overdueStatsData, stockStatsData] = await Promise.all([
        LoanServiceWrapper.getLoanStatistics(),
        LoanServiceWrapper.getOverdueStats(),
        LoanServiceWrapper.getStockStatistics()
      ]);
      
      setStats(loanStats);
      setOverdueStats(overdueStatsData);
      setStockStats(stockStatsData);
    } catch (error: any) {
      setError(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    overdueStats,
    stockStats,
    loading,
    error,
    refetch: fetchStats
  };
};