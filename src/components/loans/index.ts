// src/components/loans/index.ts
// ================================================================
// EXPORTACIONES DE COMPONENTES DEL SISTEMA DE PRÉSTAMOS - CORREGIDO
// ================================================================

// Componente principal de gestión
export { default as LoanManagement } from './LoanManagement';

// Componentes de gestión básica
export { default as LoansList } from './LoansList';
export { default as LoanRow } from './LoanRow';
export { default as CreateLoanModal } from './CreateLoanModal';

// Componentes de devoluciones y vencidos
export { default as ReturnsManagement } from './ReturnsManagement';
export { default as OverdueManagement } from './OverdueManagement';
export { default as ReturnModal } from './ReturnModal';

// Componente de estadísticas
export { default as LoanStatistics } from './LoanStatistics';

// Exportaciones alternativas para compatibilidad
export { default as LoanList } from './LoansList';
export { default as LoanFilters } from './LoansList'; // Si tienes un componente separado de filtros

// Re-exportar tipos principales para facilitar importación
export type {
  LoanWithDetails,
  CreateLoanRequest,
  UpdateLoanRequest,
  ReturnLoanRequest,
  MarkAsLostRequest,
  LoanSearchFilters,
  OverdueFilters,
  LoanStats,
  OverdueStats,
  StockStats,
  UseLoanState,
  UseLoansState,
  UseReturnState,
  UseOverdueState
} from '@/types/loan.types';