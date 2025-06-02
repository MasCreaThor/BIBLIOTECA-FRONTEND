// src/utils/personTypeUtils.ts
import { FiUser, FiUsers, FiBook } from 'react-icons/fi';
import type { Person, PersonType } from '@/types/api.types';

export interface PersonTypeConfig {
  label: string;
  color: string;
  icon: any;
  description?: string;
}

/**
 * Obtiene la configuración de tipo de persona basada en los datos disponibles
 */
export function getPersonTypeConfig(person: Person, fallbackTypes?: PersonType[]): PersonTypeConfig {
  // Si tiene personType poblado, usarlo directamente
  if (person.personType) {
    const typeConfigs = {
      student: {
        label: 'Estudiante',
        color: 'blue',
        icon: FiBook,
        description: 'Estudiante registrado en la institución',
      },
      teacher: {
        label: 'Docente',
        color: 'green',
        icon: FiUsers,
        description: 'Docente de la institución',
      },
    };

    return typeConfigs[person.personType.name as keyof typeof typeConfigs] || {
      label: person.personType.description || 'Tipo Desconocido',
      color: 'gray',
      icon: FiUser,
      description: person.personType.description,
    };
  }

  // Si no tiene personType pero tiene personTypeId, intentar buscar en fallbackTypes
  if (person.personTypeId && fallbackTypes) {
    const personType = fallbackTypes.find(type => type._id === person.personTypeId);
    if (personType) {
      const typeConfigs = {
        student: {
          label: 'Estudiante',
          color: 'blue',
          icon: FiBook,
          description: 'Estudiante registrado en la institución',
        },
        teacher: {
          label: 'Docente',
          color: 'green',
          icon: FiUsers,
          description: 'Docente de la institución',
        },
      };

      return typeConfigs[personType.name as keyof typeof typeConfigs] || {
        label: personType.description || 'Tipo Desconocido',
        color: 'gray',
        icon: FiUser,
        description: personType.description,
      };
    }
  }

  // Fallback por defecto
  return {
    label: 'Tipo Desconocido',
    color: 'gray',
    icon: FiUser,
    description: 'Tipo de persona no especificado',
  };
}

/**
 * Determina si una persona es estudiante basado en los datos disponibles
 */
export function isStudent(person: Person): boolean {
  if (person.personType) {
    return person.personType.name === 'student';
  }
  
  // Fallback: si tiene grado, probablemente es estudiante
  return !!person.grade;
}

/**
 * Determina si una persona es docente basado en los datos disponibles
 */
export function isTeacher(person: Person): boolean {
  if (person.personType) {
    return person.personType.name === 'teacher';
  }
  
  // Fallback: si no tiene grado específico y no es claramente estudiante
  return !person.grade;
}

/**
 * Obtiene el label apropiado para el campo grado/área
 */
export function getGradeLabel(person: Person): string {
  if (isStudent(person)) {
    return 'Grado';
  }
  return 'Área/Cargo';
}