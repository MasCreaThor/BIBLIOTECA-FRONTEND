// src/hooks/useLoans.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { LoanService } from '@/services/loan.service';
import {
  Loan,
  LoanSearchFilters,
  CreateLoanRequest,
  ReturnLoanRequest,
  LoanStats,
  CanBorrowResult,
  ReturnLoanResponse,
} from '@/types/loan.types';
import { PaginatedResponse } from '@/types/api.types';

// Hook principal para gestión de préstamos
export function useLoans(initialFilters: LoanSearchFilters = {}) {
  const [loans, setLoans] = useState<PaginatedResponse<Loan>>({
    data: [],
    pagination: {
      total: 0,
      page: 1,
      totalPages: 0,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LoanSearchFilters>(initialFilters);
  const toast = useToast();

  const fetchLoans = useCallback(async (searchFilters?: LoanSearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const filtersToUse = searchFilters || filters;
      console.log('Fetching loans with filters:', filtersToUse);
      
      const response = await LoanService.getLoans(filtersToUse);
      setLoans(response);
      
      console.log('Loans fetched successfully:', response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar préstamos';
      console.error('Error fetching loans:', err);
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const updateFilters = useCallback((newFilters: Partial<LoanSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    console.log('Updating filters:', updatedFilters);
    
    setFilters(updatedFilters);
    fetchLoans(updatedFilters);
  }, [filters, fetchLoans]);

  const changePage = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    console.log('Changing page to:', page);
    
    setFilters(updatedFilters);
    fetchLoans(updatedFilters);
  }, [filters, fetchLoans]);

  const refresh = useCallback(() => {
    console.log('Refreshing loans...');
    fetchLoans();
  }, [fetchLoans]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchLoans();
  }, []);

  return {
    loans,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    refresh,
    clearError,
  };
}

// Hook para crear préstamos - VERSIÓN MEJORADA
export function useCreateLoan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const createLoan = useCallback(async (loanData: CreateLoanRequest): Promise<Loan | null> => {
    console.log('Creating loan with data:', loanData);
    setLoading(true);
    setError(null);

    try {
      // Validaciones del lado cliente
      if (!loanData.personId) {
        throw new Error('Debe seleccionar una persona');
      }

      if (!loanData.resourceId) {
        throw new Error('Debe seleccionar un recurso');
      }

      if (loanData.quantity && (loanData.quantity < 1 || loanData.quantity > 5)) {
        throw new Error('La cantidad debe estar entre 1 y 5');
      }

      if (loanData.observations && loanData.observations.length > 500) {
        throw new Error('Las observaciones no pueden exceder 500 caracteres');
      }

      // Limpiar observaciones vacías
      const cleanLoanData = {
        ...loanData,
        observations: loanData.observations?.trim() || undefined,
        quantity: loanData.quantity || 1
      };

      console.log('Sending cleaned loan data:', cleanLoanData);
      const newLoan = await LoanService.createLoan(cleanLoanData);
      
      console.log('Loan created successfully:', newLoan);
      
      toast({
        title: 'Préstamo creado',
        description: 'El préstamo se ha registrado exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return newLoan;
    } catch (err: any) {
      let errorMessage = 'Error al crear préstamo';
      
      console.error('Error creating loan:', err);
      
      // Manejo específico de errores del backend
      if (err?.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ')
          : err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      // Mostrar toast específico de error
      toast({
        title: 'Error al crear préstamo',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createLoan,
    loading,
    error,
    clearError
  };
}

// Hook para verificar si una persona puede pedir préstamos
export function useCanBorrow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCanBorrow = useCallback(async (personId: string): Promise<CanBorrowResult | null> => {
    if (!personId) {
      return null;
    }

    console.log('Checking if person can borrow:', personId);
    setLoading(true);
    setError(null);

    try {
      const result = await LoanService.canPersonBorrow(personId);
      console.log('Can borrow result:', result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al verificar disponibilidad';
      console.error('Error checking can borrow:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkCanBorrow,
    loading,
    error,
    clearError
  };
}

// Hook para gestión de devoluciones
export function useReturnLoan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const returnLoan = useCallback(async (returnData: ReturnLoanRequest): Promise<ReturnLoanResponse | null> => {
    console.log('Processing loan return:', returnData);
    setLoading(true);
    setError(null);

    try {
      // Validaciones del lado cliente
      if (!returnData.loanId) {
        throw new Error('ID de préstamo requerido');
      }

      if (returnData.returnObservations && returnData.returnObservations.length > 500) {
        throw new Error('Las observaciones de devolución no pueden exceder 500 caracteres');
      }

      const result = await LoanService.returnLoan(returnData);
      
      console.log('Loan returned successfully:', result);
      
      toast({
        title: 'Devolución procesada',
        description: result.message || 'La devolución se ha procesado exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return result;
    } catch (err: any) {
      let errorMessage = 'Error al procesar devolución';
      
      console.error('Error returning loan:', err);
      
      if (err?.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ')
          : err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      toast({
        title: 'Error en devolución',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const markAsLost = useCallback(async (loanId: string, observations: string): Promise<Loan | null> => {
    console.log('Marking loan as lost:', { loanId, observations });
    setLoading(true);
    setError(null);

    try {
      // Validaciones del lado cliente
      if (!loanId) {
        throw new Error('ID de préstamo requerido');
      }

      if (!observations || observations.trim().length === 0) {
        throw new Error('Las observaciones son requeridas para marcar como perdido');
      }

      if (observations.length > 500) {
        throw new Error('Las observaciones no pueden exceder 500 caracteres');
      }

      const result = await LoanService.markAsLost(loanId, observations.trim());
      
      console.log('Loan marked as lost successfully:', result);
      
      toast({
        title: 'Préstamo marcado como perdido',
        description: 'El préstamo se ha marcado como perdido exitosamente',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      return result;
    } catch (err: any) {
      let errorMessage = 'Error al marcar como perdido';
      
      console.error('Error marking loan as lost:', err);
      
      if (err?.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ')
          : err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      toast({
        title: 'Error al marcar como perdido',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    returnLoan,
    markAsLost,
    loading,
    error,
    clearError
  };
}

// Hook para estadísticas de préstamos
export function useLoanStats() {
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchStats = useCallback(async () => {
    console.log('Fetching loan statistics...');
    setLoading(true);
    setError(null);

    try {
      const result = await LoanService.getLoanStats();
      setStats(result);
      console.log('Loan stats fetched successfully:', result);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar estadísticas';
      console.error('Error fetching loan stats:', err);
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
    clearError
  };
}

// Hook para obtener préstamos de una persona específica
export function usePersonLoans(personId: string) {
  const [loans, setLoans] = useState<PaginatedResponse<Loan> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchPersonLoans = useCallback(async (filters: LoanSearchFilters = {}) => {
    if (!personId) {
      return;
    }

    console.log('Fetching loans for person:', personId);
    setLoading(true);
    setError(null);

    try {
      const result = await LoanService.getPersonLoans(personId, filters);
      setLoans(result);
      console.log('Person loans fetched successfully:', result);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar préstamos de la persona';
      console.error('Error fetching person loans:', err);
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [personId, toast]);

  const refresh = useCallback(() => {
    fetchPersonLoans();
  }, [fetchPersonLoans]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (personId) {
      fetchPersonLoans();
    }
  }, [fetchPersonLoans, personId]);

  return {
    loans,
    loading,
    error,
    refresh,
    clearError,
    fetchWithFilters: fetchPersonLoans
  };
}

// Hook para obtener préstamos de un recurso específico
export function useResourceLoans(resourceId: string) {
  const [loans, setLoans] = useState<PaginatedResponse<Loan> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchResourceLoans = useCallback(async (filters: LoanSearchFilters = {}) => {
    if (!resourceId) {
      return;
    }

    console.log('Fetching loans for resource:', resourceId);
    setLoading(true);
    setError(null);

    try {
      const result = await LoanService.getResourceLoans(resourceId, filters);
      setLoans(result);
      console.log('Resource loans fetched successfully:', result);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar préstamos del recurso';
      console.error('Error fetching resource loans:', err);
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [resourceId, toast]);

  const refresh = useCallback(() => {
    fetchResourceLoans();
  }, [fetchResourceLoans]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (resourceId) {
      fetchResourceLoans();
    }
  }, [fetchResourceLoans, resourceId]);

  return {
    loans,
    loading,
    error,
    refresh,
    clearError,
    fetchWithFilters: fetchResourceLoans
  };
}