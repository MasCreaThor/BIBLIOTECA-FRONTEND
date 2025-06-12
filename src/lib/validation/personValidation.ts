// src/lib/validation/personValidation.ts
import { z } from 'zod';
import { ValidationUtils } from '@/utils';

/**
 * Sistema de validaciones para personas
 * Separa la lógica de validación de los componentes UI
 */

// Validaciones base para campos comunes
const baseFieldValidations = {
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .transform(val => val.trim()),

  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
    .transform(val => val.trim()),

  personTypeId: z
    .string()
    .min(1, 'Debes seleccionar un tipo de persona'),

  documentNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Opcional
      return ValidationUtils.isValidColombianDocument(val);
    }, 'El número de documento debe tener entre 6 y 11 dígitos')
    .transform(val => val?.trim() || undefined),

  grade: z
    .string()
    .min(1, 'El grado es requerido para estudiantes')
    .max(50, 'El grado no puede exceder 50 caracteres')
    .transform(val => val.trim()),

  gradeOptional: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),
};

// Schema base para todos los tipos de persona
export const basePersonSchema = z.object({
  firstName: baseFieldValidations.firstName,
  lastName: baseFieldValidations.lastName,
  personTypeId: baseFieldValidations.personTypeId,
  documentNumber: baseFieldValidations.documentNumber,
});

// Schema específico para estudiantes (requiere grado)
export const studentPersonSchema = basePersonSchema.extend({
  grade: baseFieldValidations.grade,
});

// Schema específico para docentes (grado opcional)
export const teacherPersonSchema = basePersonSchema.extend({
  grade: baseFieldValidations.gradeOptional,
});

// Schema dinámico que se ajusta según el tipo de persona
export const dynamicPersonSchema = basePersonSchema.extend({
  grade: baseFieldValidations.gradeOptional,
});

// Tipos derivados de los schemas
export type BasePersonFormData = z.infer<typeof basePersonSchema>;
export type StudentPersonFormData = z.infer<typeof studentPersonSchema>;
export type TeacherPersonFormData = z.infer<typeof teacherPersonSchema>;
export type DynamicPersonFormData = z.infer<typeof dynamicPersonSchema>;

/**
 * Factory para obtener el schema apropiado según el tipo de persona
 */
export class PersonValidationSchemaFactory {
  /**
   * Obtiene el schema de validación apropiado para un tipo específico
   */
  static getSchema(isStudent: boolean): z.ZodSchema {
    return isStudent ? studentPersonSchema : teacherPersonSchema;
  }

  /**
   * Valida datos de persona según su tipo
   */
  static validatePersonData(
    data: any, 
    isStudent: boolean
  ): { success: boolean; data?: any; error?: z.ZodError } {
    const schema = this.getSchema(isStudent);
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  }

  /**
   * Obtiene mensajes de error formateados
   */
  static getFormattedErrors(error: z.ZodError): Record<string, string> {
    const formattedErrors: Record<string, string> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      formattedErrors[path] = err.message;
    });
    
    return formattedErrors;
  }

  /**
   * Valida si un campo específico es válido
   */
  static validateField(
    fieldName: keyof BasePersonFormData,
    value: any,
    isStudent: boolean
  ): { isValid: boolean; error?: string } {
    try {
      const tempData = { [fieldName]: value };
      
      const schema = this.getSchema(isStudent);
      const result = schema.safeParse(tempData);
      
      if (result.success) {
        return { isValid: true };
      }
      
      // Buscar errores específicos del campo
      const fieldError = result.error.errors.find(err => 
        err.path.length > 0 && err.path[0] === fieldName
      );
      
      if (fieldError) {
        return { 
          isValid: false, 
          error: fieldError.message 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Error de validación' };
    }
  }
}

/**
 * Reglas de negocio para validación de personas
 */
export class PersonBusinessRules {
  /**
   * Valida reglas de negocio específicas para estudiantes
   */
  static validateStudentRules(data: Partial<DynamicPersonFormData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Los estudiantes deben tener grado
    if (!data.grade || data.grade.trim() === '') {
      errors.push('Los estudiantes deben tener un grado especificado');
    }

    // Validaciones adicionales para estudiantes
    if (data.grade) {
      // El grado no debe ser demasiado largo
      if (data.grade.length > 50) {
        errors.push('El grado no puede exceder 50 caracteres');
      }

      // El grado debe tener un formato válido (opcional: agregar regex)
      if (!/^[a-zA-Z0-9\s\-\.°]+$/.test(data.grade)) {
        errors.push('El grado contiene caracteres no válidos');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida reglas de negocio específicas para docentes
   */
  static validateTeacherRules(data: Partial<DynamicPersonFormData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Los docentes deberían tener documento (recomendado)
    if (!data.documentNumber || data.documentNumber.trim() === '') {
      // Solo advertencia, no error
      console.warn('Se recomienda que los docentes tengan número de documento');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida reglas generales de negocio
   */
  static validateGeneralRules(data: Partial<DynamicPersonFormData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validar que nombre y apellido no sean iguales
    if (data.firstName && data.lastName && 
        data.firstName.toLowerCase().trim() === data.lastName.toLowerCase().trim()) {
      errors.push('El nombre y apellido no pueden ser iguales');
    }

    // Validar longitud total del nombre completo
    if (data.firstName && data.lastName) {
      const fullNameLength = data.firstName.length + data.lastName.length;
      if (fullNameLength > 150) {
        errors.push('El nombre completo es demasiado largo');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validación completa de reglas de negocio
   */
  static validateAllRules(
    data: Partial<DynamicPersonFormData>, 
    isStudent: boolean
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const generalValidation = this.validateGeneralRules(data);
    const specificValidation = isStudent 
      ? this.validateStudentRules(data)
      : this.validateTeacherRules(data);

    return {
      isValid: generalValidation.isValid && specificValidation.isValid,
      errors: [...generalValidation.errors, ...specificValidation.errors],
    };
  }
}