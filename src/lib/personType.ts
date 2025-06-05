// src/lib/personType.ts
import { FiUser, FiUsers, FiBook } from 'react-icons/fi';
import type { Person, PersonType } from '@/types/api.types';

export interface PersonTypeConfig {
  label: string;
  color: string;
  icon: any;
  description: string;
  gradeLabel: string;
}

export interface PersonDisplayInfo {
  fullName: string;
  gradeArea: string;
  hasValidGrade: boolean;
}

/**
 * Manager centralizado para toda la lógica relacionada con tipos de persona
 * Consolida la lógica que estaba duplicada en múltiples componentes
 */
export class PersonTypeManager {
  
  /**
   * Configuraciones base para tipos de persona conocidos
   */
  private static readonly TYPE_CONFIGS: Record<string, Omit<PersonTypeConfig, 'description'>> = {
    student: {
      label: 'Estudiante',
      color: 'blue',
      icon: FiBook,
      gradeLabel: 'Grado',
    },
    teacher: {
      label: 'Docente',
      color: 'green',
      icon: FiUsers,
      gradeLabel: 'Área',
    },
  };

  /**
   * Configuración fallback para tipos desconocidos
   */
  private static readonly DEFAULT_CONFIG: PersonTypeConfig = {
    label: 'Tipo Desconocido',
    color: 'gray',
    icon: FiUser,
    description: 'Información del tipo de persona no disponible',
    gradeLabel: 'Info',
  };

  /**
   * Obtiene la configuración completa para el tipo de persona
   * Maneja todos los casos: con populate, sin populate, y fallbacks
   */
  static getConfig(person: Person, fallbackTypes?: PersonType[]): PersonTypeConfig {
    // 1. Si tiene personType poblado, usarlo directamente
    if (person.personType?.name) {
      const baseConfig = this.TYPE_CONFIGS[person.personType.name];
      if (baseConfig) {
        return {
          ...baseConfig,
          description: person.personType.description || `${baseConfig.label} registrado en la institución`,
        };
      }
      
      // Si el nombre no coincide con los esperados, usar la descripción
      return {
        label: person.personType.description || 'Tipo Personalizado',
        color: 'purple',
        icon: FiUser,
        description: person.personType.description || 'Tipo de persona personalizado',
        gradeLabel: 'Info',
      };
    }

    // 2. Si no está poblado pero tenemos personTypeId y la lista de tipos
    if (person.personTypeId && fallbackTypes) {
      const personType = fallbackTypes.find(type => type._id === person.personTypeId);
      if (personType) {
        const baseConfig = this.TYPE_CONFIGS[personType.name];
        if (baseConfig) {
          return {
            ...baseConfig,
            description: personType.description || `${baseConfig.label} registrado en la institución`,
          };
        }
        
        return {
          label: personType.description || 'Tipo Personalizado',
          color: 'purple',
          icon: FiUser,
          description: personType.description || 'Tipo de persona personalizado',
          gradeLabel: 'Info',
        };
      }
    }

    // 3. Fallback inteligente basado en si tiene grado o no
    if (person.grade && person.grade.trim()) {
      // Si tiene grado, probablemente es estudiante
      return {
        ...this.TYPE_CONFIGS.student,
        description: 'Estudiante registrado en la institución',
      };
    }

    // Si no tiene grado, probablemente es docente
    if (person.grade === undefined || person.grade === null || person.grade.trim() === '') {
      return {
        ...this.TYPE_CONFIGS.teacher,
        description: 'Docente de la institución',
      };
    }

    // 4. Fallback final
    return this.DEFAULT_CONFIG;
  }

  /**
   * Determina si una persona es estudiante
   */
  static isStudent(person: Person, fallbackTypes?: PersonType[]): boolean {
    const config = this.getConfig(person, fallbackTypes);
    return config.label === 'Estudiante' || config.gradeLabel === 'Grado';
  }

  /**
   * Determina si una persona es docente
   */
  static isTeacher(person: Person, fallbackTypes?: PersonType[]): boolean {
    const config = this.getConfig(person, fallbackTypes);
    return config.label === 'Docente' || config.gradeLabel === 'Área';
  }

  /**
   * Obtiene el nombre completo con fallback
   */
  static getFullName(person: Person): string {
    return person.fullName || `${person.firstName} ${person.lastName}`;
  }

  /**
   * Obtiene el label apropiado para el campo grado/área
   */
  static getGradeLabel(person: Person, fallbackTypes?: PersonType[]): string {
    const config = this.getConfig(person, fallbackTypes);
    return config.gradeLabel;
  }

  /**
   * Renderiza información del grado/área según el tipo de persona
   * Devuelve objeto con texto y si es válido
   */
  static getGradeDisplayInfo(person: Person, fallbackTypes?: PersonType[]): {
    text: string;
    isValid: boolean;
    label: string;
  } {
    const config = this.getConfig(person, fallbackTypes);
    const isStudent = this.isStudent(person, fallbackTypes);
    
    if (isStudent) {
      if (person.grade && person.grade.trim()) {
        return {
          text: person.grade,
          isValid: true,
          label: config.gradeLabel,
        };
      }
      
      return {
        text: 'No especificado',
        isValid: false,
        label: config.gradeLabel,
      };
    }
    
    // Para docentes y otros tipos
    return {
      text: 'N/A',
      isValid: true,
      label: 'No aplica',
    };
  }

  /**
   * Obtiene información completa de display para una persona
   */
  static getDisplayInfo(person: Person, fallbackTypes?: PersonType[]): PersonDisplayInfo {
    const fullName = this.getFullName(person);
    const gradeInfo = this.getGradeDisplayInfo(person, fallbackTypes);
    
    return {
      fullName,
      gradeArea: gradeInfo.text,
      hasValidGrade: gradeInfo.isValid,
    };
  }

  /**
   * Valida si los datos de una persona son consistentes con su tipo
   */
  static validatePersonData(person: Partial<Person>, fallbackTypes?: PersonType[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Si es estudiante, debe tener grado
    if (person.personTypeId && fallbackTypes) {
      const personType = fallbackTypes.find(type => type._id === person.personTypeId);
      if (personType?.name === 'student') {
        if (!person.grade || person.grade.trim() === '') {
          errors.push('Los estudiantes deben tener un grado especificado');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtiene el ícono apropiado para el tipo de persona
   */
  static getIcon(person: Person, fallbackTypes?: PersonType[]): any {
    const config = this.getConfig(person, fallbackTypes);
    return config.icon;
  }

  /**
   * Obtiene el color apropiado para el tipo de persona
   */
  static getColor(person: Person, fallbackTypes?: PersonType[]): string {
    const config = this.getConfig(person, fallbackTypes);
    return config.color;
  }

  /**
   * Verifica si dos personas tienen el mismo tipo
   */
  static hasSameType(person1: Person, person2: Person, fallbackTypes?: PersonType[]): boolean {
    const config1 = this.getConfig(person1, fallbackTypes);
    const config2 = this.getConfig(person2, fallbackTypes);
    return config1.label === config2.label;
  }
}