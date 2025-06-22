// src/utils/loanValidation.utils.ts - UTILIDADES DE VALIDACIÓN PARA PRÉSTAMOS
// ================================================================
// FUNCIONES DE VALIDACIÓN Y VERIFICACIÓN PARA SISTEMA DE PRÉSTAMOS
// ================================================================

import type { Resource, Person } from '@/types/api.types';

// ===== INTERFACES DE VALIDACIÓN =====

export interface LoanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

export interface ResourceLoanValidation extends LoanValidationResult {
  resourceInfo: {
    available: boolean;
    totalQuantity: number;
    currentLoans: number;
    availableQuantity: number;
    hasStock: boolean;
  };
  quantityInfo: {
    requested: number;
    maxAllowed: number;
    reason: string;
  };
}

export interface PersonLoanValidation extends LoanValidationResult {
  personInfo: {
    canBorrow: boolean;
    activeLoans: number;
    maxLoans: number;
    personType: string;
    hasOverdueLoans: boolean;
  };
}

export interface CompleteLoanValidation extends LoanValidationResult {
  resourceValidation: ResourceLoanValidation;
  personValidation: PersonLoanValidation;
  quantityValidation: {
    isValid: boolean;
    requestedQuantity: number;
    maxAllowedQuantity: number;
    reason: string;
  };
}

// ===== CONFIGURACIÓN DE LÍMITES =====

export const LOAN_LIMITS = {
  STUDENT: {
    MAX_CONCURRENT_LOANS: 3,
    MAX_QUANTITY_PER_RESOURCE: 1,
    LOAN_DURATION_DAYS: 14,
  },
  TEACHER: {
    MAX_CONCURRENT_LOANS: 10,
    MAX_QUANTITY_PER_RESOURCE: Infinity, // Los docentes pueden prestar toda la cantidad disponible
    LOAN_DURATION_DAYS: 30,
  },
  DEFAULT: {
    MAX_CONCURRENT_LOANS: 2,
    MAX_QUANTITY_PER_RESOURCE: 1,
    LOAN_DURATION_DAYS: 7,
  },
} as const;

export const RESOURCE_LIMITS = {
  MIN_STOCK_FOR_LOAN: 1,
  MAX_QUANTITY_PER_LOAN: 50,
  RESERVATION_THRESHOLD: 2, // Stock mínimo para permitir reservas
} as const;

// ===== FUNCIONES DE VALIDACIÓN DE RECURSOS =====

/**
 * Valida si un recurso está disponible para préstamo
 */
export function validateResourceAvailability(resource: Resource): {
  isAvailable: boolean;
  reason?: string;
  availableQuantity: number;
} {
  // Verificar disponibilidad general
  if (!resource.available) {
    return {
      isAvailable: false,
      reason: 'El recurso está marcado como no disponible para préstamo',
      availableQuantity: 0,
    };
  }

  // Verificar estado del recurso
  if (resource.state?.name === 'lost' || resource.state?.name === 'damaged') {
    return {
      isAvailable: false,
      reason: `El recurso está en estado: ${resource.state.description}`,
      availableQuantity: 0,
    };
  }

  // Calcular cantidad disponible
  const availableQuantity = Math.max(0, resource.totalQuantity - (resource.currentLoansCount || 0));

  if (availableQuantity === 0) {
    return {
      isAvailable: false,
      reason: 'No hay unidades disponibles (todas están prestadas)',
      availableQuantity: 0,
    };
  }

  return {
    isAvailable: true,
    availableQuantity,
  };
}

/**
 * Valida la cantidad solicitada para un recurso
 */
export function validateRequestedQuantity(
  resource: Resource,
  requestedQuantity: number,
  personType: 'student' | 'teacher' = 'student'
): {
  isValid: boolean;
  maxAllowed: number;
  reason?: string;
} {
  const availability = validateResourceAvailability(resource);
  
  if (!availability.isAvailable) {
    return {
      isValid: false,
      maxAllowed: 0,
      reason: availability.reason,
    };
  }

  // Verificar límites por tipo de persona
  const limits = personType === 'teacher' ? LOAN_LIMITS.TEACHER : LOAN_LIMITS.STUDENT;
  const maxPerResource = limits.MAX_QUANTITY_PER_RESOURCE;

  // Para docentes, el límite es la cantidad disponible del recurso
  if (personType === 'teacher') {
    if (requestedQuantity > availability.availableQuantity) {
      return {
        isValid: false,
        maxAllowed: availability.availableQuantity,
        reason: `Solo hay ${availability.availableQuantity} unidad(es) disponible(s)`,
      };
    }
  } else {
    // Para estudiantes, mantener el límite de 1 unidad
    if (requestedQuantity > maxPerResource) {
      return {
        isValid: false,
        maxAllowed: maxPerResource,
        reason: `Los estudiantes pueden prestar máximo ${maxPerResource} unidad(es) de este recurso`,
      };
    }
  }

  // Verificar disponibilidad de stock
  if (requestedQuantity > availability.availableQuantity) {
    return {
      isValid: false,
      maxAllowed: availability.availableQuantity,
      reason: `Solo hay ${availability.availableQuantity} unidad(es) disponible(s)`,
    };
  }

  // Verificar límites generales (solo para estudiantes)
  if (personType === 'student' && requestedQuantity > RESOURCE_LIMITS.MAX_QUANTITY_PER_LOAN) {
    return {
      isValid: false,
      maxAllowed: RESOURCE_LIMITS.MAX_QUANTITY_PER_LOAN,
      reason: `No se pueden prestar más de ${RESOURCE_LIMITS.MAX_QUANTITY_PER_LOAN} unidades en un solo préstamo`,
    };
  }

  return {
    isValid: true,
    maxAllowed: personType === 'teacher' 
      ? availability.availableQuantity 
      : Math.min(availability.availableQuantity, maxPerResource),
  };
}

/**
 * Validación completa de recurso para préstamo
 */
export function validateResourceForLoan(
  resource: Resource,
  requestedQuantity: number = 1,
  personType: 'student' | 'teacher' = 'student'
): ResourceLoanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar disponibilidad básica
  const availability = validateResourceAvailability(resource);
  if (!availability.isAvailable) {
    errors.push(availability.reason || 'Recurso no disponible');
  }

  // Validar cantidad solicitada
  const quantityValidation = validateRequestedQuantity(resource, requestedQuantity, personType);
  if (!quantityValidation.isValid) {
    errors.push(quantityValidation.reason || 'Cantidad no válida');
  }

  // Advertencias de stock bajo
  if (availability.availableQuantity > 0 && availability.availableQuantity <= 2) {
    warnings.push(`Quedan pocas unidades disponibles (${availability.availableQuantity})`);
  }

  // Advertencia si se está prestando una cantidad alta
  if (requestedQuantity > 1 && availability.availableQuantity <= 5) {
    warnings.push('Prestar múltiples unidades cuando el stock es bajo');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canProceed: errors.length === 0,
    resourceInfo: {
      available: resource.available,
      totalQuantity: resource.totalQuantity,
      currentLoans: resource.currentLoansCount || 0,
      availableQuantity: availability.availableQuantity,
      hasStock: availability.availableQuantity > 0,
    },
    quantityInfo: {
      requested: requestedQuantity,
      maxAllowed: quantityValidation.maxAllowed,
      reason: quantityValidation.reason || 'Cantidad válida',
    },
  };
}

// ===== FUNCIONES DE VALIDACIÓN DE PERSONAS =====

/**
 * Valida si una persona puede realizar préstamos
 */
export function validatePersonForLoan(
  person: Person,
  activeLoansCount: number = 0,
  hasOverdueLoans: boolean = false
): PersonLoanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar si la persona está activa
  if (!person.active) {
    errors.push('La persona no está activa en el sistema');
  }

  // Verificar préstamos vencidos
  if (hasOverdueLoans) {
    errors.push('La persona tiene préstamos vencidos. Debe devolverlos antes de solicitar nuevos préstamos');
  }

  // Determinar límites según tipo de persona
  const personType = person.personType?.name || 'student';
  const limits = personType === 'teacher' ? LOAN_LIMITS.TEACHER : LOAN_LIMITS.STUDENT;

  // Verificar límite de préstamos concurrentes
  if (activeLoansCount >= limits.MAX_CONCURRENT_LOANS) {
    errors.push(`Ha alcanzado el límite máximo de ${limits.MAX_CONCURRENT_LOANS} préstamos concurrentes`);
  }

  // Advertencias
  if (activeLoansCount > limits.MAX_CONCURRENT_LOANS * 0.8) {
    warnings.push(`Se acerca al límite de préstamos concurrentes (${activeLoansCount}/${limits.MAX_CONCURRENT_LOANS})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canProceed: errors.length === 0,
    personInfo: {
      canBorrow: errors.length === 0,
      activeLoans: activeLoansCount,
      maxLoans: limits.MAX_CONCURRENT_LOANS,
      personType,
      hasOverdueLoans,
    },
  };
}

// ===== VALIDACIÓN COMPLETA DE PRÉSTAMO =====

/**
 * Validación completa para un préstamo
 */
export function validateCompleteLoan(
  resource: Resource,
  person: Person,
  requestedQuantity: number,
  activeLoansCount: number = 0,
  hasOverdueLoans: boolean = false
): CompleteLoanValidation {
  const personType = person.personType?.name as 'student' | 'teacher' || 'student';

  // Validaciones individuales
  const resourceValidation = validateResourceForLoan(resource, requestedQuantity, personType);
  const personValidation = validatePersonForLoan(person, activeLoansCount, hasOverdueLoans);

  // Validación específica de cantidad
  const quantityValidation = validateRequestedQuantity(resource, requestedQuantity, personType);

  // Combinar errores y advertencias
  const allErrors = [
    ...resourceValidation.errors,
    ...personValidation.errors,
  ];

  const allWarnings = [
    ...resourceValidation.warnings,
    ...personValidation.warnings,
  ];

  // Validaciones adicionales combinadas
  if (personType === 'student' && requestedQuantity > 1) {
    allWarnings.push('Los estudiantes generalmente prestan 1 unidad por recurso');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    canProceed: allErrors.length === 0,
    resourceValidation,
    personValidation,
    quantityValidation: {
      isValid: quantityValidation.isValid,
      requestedQuantity,
      maxAllowedQuantity: quantityValidation.maxAllowed,
      reason: quantityValidation.reason || 'Cantidad válida',
    },
  };
}

// ===== UTILIDADES AUXILIARES =====

/**
 * Obtiene el límite máximo de préstamos para un tipo de persona
 */
export function getMaxLoansForPersonType(personType: 'student' | 'teacher'): number {
  return personType === 'teacher' 
    ? LOAN_LIMITS.TEACHER.MAX_CONCURRENT_LOANS 
    : LOAN_LIMITS.STUDENT.MAX_CONCURRENT_LOANS;
}

/**
 * Obtiene la duración del préstamo para un tipo de persona
 */
export function getLoanDurationForPersonType(personType: 'student' | 'teacher'): number {
  return personType === 'teacher' 
    ? LOAN_LIMITS.TEACHER.LOAN_DURATION_DAYS 
    : LOAN_LIMITS.STUDENT.LOAN_DURATION_DAYS;
}

/**
 * Obtiene la cantidad máxima por recurso para un tipo de persona
 */
export function getMaxQuantityPerResourceForPersonType(
  personType: 'student' | 'teacher', 
  availableQuantity?: number
): number {
  if (personType === 'teacher') {
    // Los docentes pueden prestar toda la cantidad disponible
    return availableQuantity || Infinity;
  }
  return LOAN_LIMITS.STUDENT.MAX_QUANTITY_PER_RESOURCE;
}

/**
 * Calcula la fecha de vencimiento de un préstamo
 */
export function calculateDueDate(
  loanDate: Date = new Date(),
  personType: 'student' | 'teacher' = 'student'
): Date {
  const duration = getLoanDurationForPersonType(personType);
  const dueDate = new Date(loanDate);
  dueDate.setDate(dueDate.getDate() + duration);
  return dueDate;
}

/**
 * Determina el estado de stock de un recurso
 */
export function getResourceStockStatus(resource: Resource): {
  status: 'no-stock' | 'low-stock' | 'medium-stock' | 'good-stock';
  label: string;
  color: 'red' | 'orange' | 'yellow' | 'green';
  canLoan: boolean;
} {
  const availability = validateResourceAvailability(resource);
  
  if (!availability.isAvailable || availability.availableQuantity === 0) {
    return {
      status: 'no-stock',
      label: 'Sin Stock',
      color: 'red',
      canLoan: false,
    };
  }

  if (availability.availableQuantity <= 2) {
    return {
      status: 'low-stock',
      label: 'Stock Bajo',
      color: 'orange',
      canLoan: true,
    };
  }

  if (availability.availableQuantity <= 5) {
    return {
      status: 'medium-stock',
      label: 'Stock Medio',
      color: 'yellow',
      canLoan: true,
    };
  }

  return {
    status: 'good-stock',
    label: 'Stock Bueno',
    color: 'green',
    canLoan: true,
  };
}

/**
 * Formatea mensajes de validación para mostrar al usuario
 */
export function formatValidationMessages(validation: LoanValidationResult): {
  errorMessage?: string;
  warningMessage?: string;
  hasErrors: boolean;
  hasWarnings: boolean;
} {
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  return {
    errorMessage: hasErrors ? validation.errors.join('. ') : undefined,
    warningMessage: hasWarnings ? validation.warnings.join('. ') : undefined,
    hasErrors,
    hasWarnings,
  };
}