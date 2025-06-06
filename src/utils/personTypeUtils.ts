// src/utils/personTypeUtils.ts
import { PersonTypeManager, type PersonTypeConfig as PersonTypeConfigType } from '@/lib/personType';
import type { Person, PersonType } from '@/types/api.types';

/**
 * @deprecated Use PersonTypeManager from '@/lib/personType' instead
 * This file is kept for backward compatibility and will be removed in v2.0
 */

/**
 * @deprecated Use PersonTypeConfig from '@/lib/personType' instead
 */
export type PersonTypeConfig = PersonTypeConfigType;

/**
 * Obtiene la configuración de tipo de persona basada en los datos disponibles
 * @deprecated Use PersonTypeManager.getConfig() instead
 */
export function getPersonTypeConfig(person: Person, fallbackTypes?: PersonType[]): PersonTypeConfig {
  console.warn('getPersonTypeConfig is deprecated. Use PersonTypeManager.getConfig() instead.');
  return PersonTypeManager.getConfig(person, fallbackTypes);
}

/**
 * Determina si una persona es estudiante basado en los datos disponibles
 * @deprecated Use PersonTypeManager.isStudent() instead
 */
export function isStudent(person: Person): boolean {
  console.warn('isStudent is deprecated. Use PersonTypeManager.isStudent() instead.');
  return PersonTypeManager.isStudent(person);
}

/**
 * Determina si una persona es docente basado en los datos disponibles
 * @deprecated Use PersonTypeManager.isTeacher() instead
 */
export function isTeacher(person: Person): boolean {
  console.warn('isTeacher is deprecated. Use PersonTypeManager.isTeacher() instead.');
  return PersonTypeManager.isTeacher(person);
}

/**
 * Obtiene el label apropiado para el campo grado/área
 * @deprecated Use PersonTypeManager.getGradeLabel() instead
 */
export function getGradeLabel(person: Person): string {
  console.warn('getGradeLabel is deprecated. Use PersonTypeManager.getGradeLabel() instead.');
  return PersonTypeManager.getGradeLabel(person);
}