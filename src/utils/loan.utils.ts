// utils/loan.utils.ts
// ================================================================
// UTILIDADES PARA SISTEMA DE PRÉSTAMOS - FRONTEND
// ================================================================

import type { LoanWithDetails } from '@/types/loan.types';
import { 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiXCircle, 
  FiClock 
} from 'react-icons/fi';

// ===== FUNCIONES DE VALIDACIÓN DE FECHAS =====

/**
 * Calcular días de retraso basándose en la fecha de vencimiento
 */
export const calculateDaysOverdue = (dueDate: Date | string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  
  if (now <= due) return 0;
  
  const diffTime = now.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verificar si un préstamo está vencido basándose en la fecha
 */
export const isLoanOverdueByDate = (loan: LoanWithDetails): boolean => {
  // Si ya tiene fecha de devolución, no está vencido
  if (loan.returnedDate) return false;
  
  // Si el estado es 'returned' o 'lost', no está vencido
  if (loan.status?.name === 'returned' || loan.status?.name === 'lost') return false;
  
  // Verificar si la fecha de vencimiento ya pasó
  return new Date() > new Date(loan.dueDate);
};

/**
 * Verificar si un préstamo vence hoy
 */
export const isLoanDueToday = (loan: LoanWithDetails): boolean => {
  if (loan.returnedDate) return false;
  
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  
  return today.toDateString() === dueDate.toDateString();
};

/**
 * Verificar si un préstamo vence pronto (en los próximos X días)
 */
export const isLoanDueSoon = (loan: LoanWithDetails, days: number = 3): boolean => {
  if (loan.returnedDate) return false;
  
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= days;
};

// ===== FUNCIONES DE PROCESAMIENTO DE DATOS =====

/**
 * Procesar y enriquecer los datos de préstamos con validaciones de fecha
 */
export const processLoansData = (loans: LoanWithDetails[]): LoanWithDetails[] => {
  return loans.map(loan => {
    const isOverdue = isLoanOverdueByDate(loan);
    const daysOverdue = isOverdue ? calculateDaysOverdue(loan.dueDate) : 0;
    const isDueToday = isLoanDueToday(loan);
    const isDueSoon = isLoanDueSoon(loan);
    
    return {
      ...loan,
      isOverdue,
      daysOverdue,
      isDueToday,
      isDueSoon
    };
  });
};

/**
 * Obtener información del estado de un préstamo para mostrar
 */
export const getLoanStatusInfo = (loan: LoanWithDetails) => {
  // Si está devuelto
  if (loan.status?.name === 'returned') {
    return {
      icon: FiCheckCircle,
      label: 'Devuelto',
      colorScheme: 'green',
      variant: 'solid' as const
    };
  }
  
  // Si está perdido
  if (loan.status?.name === 'lost') {
    return {
      icon: FiXCircle,
      label: 'Perdido',
      colorScheme: 'gray',
      variant: 'solid' as const
    };
  }
  
  // Si está vencido (validación local)
  if (loan.isOverdue) {
    return {
      icon: FiAlertTriangle,
      label: 'Vencido',
      colorScheme: 'red',
      variant: 'solid' as const
    };
  }
  
  // Si vence hoy
  if (loan.isDueToday) {
    return {
      icon: FiClock,
      label: 'Vence hoy',
      colorScheme: 'orange',
      variant: 'solid' as const
    };
  }
  
  // Si vence pronto
  if (loan.isDueSoon) {
    return {
      icon: FiClock,
      label: 'Vence pronto',
      colorScheme: 'yellow',
      variant: 'outline' as const
    };
  }
  
  // Activo
  return {
    icon: FiCheckCircle,
    label: 'Activo',
    colorScheme: 'green',
    variant: 'outline' as const
  };
};

// ===== FUNCIONES DE FILTRADO =====

/**
 * Filtrar préstamos vencidos
 */
export const filterOverdueLoans = (loans: LoanWithDetails[]): LoanWithDetails[] => {
  return loans.filter(loan => isLoanOverdueByDate(loan));
};

/**
 * Filtrar préstamos activos (no vencidos, no devueltos, no perdidos)
 */
export const filterActiveLoans = (loans: LoanWithDetails[]): LoanWithDetails[] => {
  return loans.filter(loan => 
    !loan.returnedDate && 
    loan.status?.name !== 'returned' && 
    loan.status?.name !== 'lost' && 
    !isLoanOverdueByDate(loan)
  );
};

/**
 * Filtrar préstamos que vencen pronto
 */
export const filterDueSoonLoans = (loans: LoanWithDetails[], days: number = 3): LoanWithDetails[] => {
  return loans.filter(loan => isLoanDueSoon(loan, days));
};

// ===== FUNCIONES DE FORMATO =====

/**
 * Formatear fecha para mostrar
 */
export const formatDisplayDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatear fecha y hora para mostrar
 */
export const formatDisplayDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtener texto descriptivo para días de retraso
 */
export const getDaysOverdueText = (days: number): string => {
  if (days === 0) return 'Vence hoy';
  if (days === 1) return '1 día de retraso';
  return `${days} días de retraso`;
}; 