// types/index.ts - ACTUALIZADO para evitar ambigüedad en tipos de préstamos
// Re-export all types
export * from './api.types';
export type {
  Loan,
  CreateLoanRequest,
  ReturnLoanRequest
} from './loan.types';
