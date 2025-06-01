import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Utilidades para formateo de fechas
 */
export class DateUtils {
  /**
   * Formatear fecha en formato legible
   */
  static formatDate(date: string | Date, formatStr = 'dd/MM/yyyy'): string {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Fecha inválida';
    return format(parsedDate, formatStr, { locale: es });
  }

  /**
   * Formatear fecha y hora
   */
  static formatDateTime(date: string | Date): string {
    return this.formatDate(date, 'dd/MM/yyyy HH:mm');
  }

  /**
   * Formatear fecha relativa (hace X tiempo)
   */
  static formatRelative(date: string | Date): string {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Fecha inválida';
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale: es });
  }

  /**
   * Verificar si una fecha es hoy
   */
  static isToday(date: string | Date): boolean {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return (
      parsedDate.getDate() === today.getDate() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Calcular días entre fechas
   */
  static daysBetween(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verificar si una fecha ya pasó
   */
  static isPast(date: string | Date): boolean {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return parsedDate < new Date();
  }
}

/**
 * Utilidades para formateo de texto
 */
export class TextUtils {
  /**
   * Capitalizar primera letra
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Truncar texto
   */
  static truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Limpiar y normalizar texto para búsqueda
   */
  static normalizeForSearch(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .trim();
  }

  /**
   * Formatear nombre completo
   */
  static formatFullName(firstName: string, lastName: string): string {
    return `${firstName.trim()} ${lastName.trim()}`;
  }

  /**
   * Extraer iniciales de un nombre
   */
  static getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  }

  /**
   * Formatear número de documento
   */
  static formatDocument(doc: string): string {
    // Remover caracteres no numéricos y formatear
    const cleaned = doc.replace(/\D/g, '');
    return cleaned.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1.');
  }

  /**
   * Generar slug a partir de texto
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

/**
 * Utilidades para validaciones
 */
export class ValidationUtils {
  /**
   * Validar email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar longitud de contraseña
   */
  static isValidPasswordLength(password: string, minLength = 8): boolean {
    return password.length >= minLength;
  }

  /**
   * Validar fortaleza de contraseña
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar número de documento colombiano
   */
  static isValidColombiannDocument(doc: string): boolean {
    const cleaned = doc.replace(/\D/g, '');
    return cleaned.length >= 6 && cleaned.length <= 11;
  }

  /**
   * Validar ISBN
   */
  static isValidISBN(isbn: string): boolean {
    const cleaned = isbn.replace(/[-\s]/g, '');
    return /^(?:\d{10}|\d{13})$/.test(cleaned);
  }
}

/**
 * Utilidades para arrays
 */
export class ArrayUtils {
  /**
   * Remover duplicados de array
   */
  static removeDuplicates<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Agrupar array por propiedad
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Ordenar array por propiedad
   */
  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Paginar array
   */
  static paginate<T>(array: T[], page: number, limit: number): {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const startIndex = (page - 1) * limit;
    const data = array.slice(startIndex, startIndex + limit);
    
    return {
      data,
      total: array.length,
      page,
      totalPages: Math.ceil(array.length / limit),
    };
  }
}

/**
 * Utilidades para números
 */
export class NumberUtils {
  /**
   * Formatear número con separadores de miles
   */
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CO').format(num);
  }

  /**
   * Formatear porcentaje
   */
  static formatPercentage(num: number, decimals = 1): string {
    return `${num.toFixed(decimals)}%`;
  }

  /**
   * Generar número aleatorio en rango
   */
  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Redondear a decimales específicos
   */
  static roundTo(num: number, decimals: number): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

/**
 * Utilidades para URLs y navegación
 */
export class UrlUtils {
  /**
   * Construir URL con parámetros de consulta
   */
  static buildUrl(baseUrl: string, params: Record<string, any>): string {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    
    return url.toString();
  }

  /**
   * Obtener parámetros de consulta actuales
   */
  static getQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  /**
   * Navegar con parámetros
   */
  static navigateWithParams(baseUrl: string, params: Record<string, any>): void {
    const url = this.buildUrl(baseUrl, params);
    window.history.pushState({}, '', url);
  }
}

/**
 * Utilidades para almacenamiento local
 */
export class StorageUtils {
  /**
   * Guardar en localStorage con manejo de errores
   */
  static setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  }

  /**
   * Obtener de localStorage con manejo de errores
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error leyendo de localStorage:', error);
      return defaultValue || null;
    }
  }

  /**
   * Remover de localStorage
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removiendo de localStorage:', error);
      return false;
    }
  }

  /**
   * Limpiar localStorage
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }
}

/**
 * Utilidades para archivos
 */
export class FileUtils {
  /**
   * Formatear tamaño de archivo
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtener extensión de archivo
   */
  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  /**
   * Validar tipo de archivo
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validar tamaño de archivo
   */
  static isValidFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}

/**
 * Constantes de la aplicación
 */
export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  LOAN: {
    MAX_DAYS: 15,
    WARNING_DAYS: 12,
  },
  FILE: {
    MAX_SIZE_MB: 5,
    ALLOWED_IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENTS: ['application/pdf'],
  },
  ROLES: {
    ADMIN: 'admin',
    LIBRARIAN: 'librarian',
  },
  PERSON_TYPES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
  },
  RESOURCE_TYPES: {
    BOOK: 'book',
    GAME: 'game',
    MAP: 'map',
    BIBLE: 'bible',
  },
} as const;