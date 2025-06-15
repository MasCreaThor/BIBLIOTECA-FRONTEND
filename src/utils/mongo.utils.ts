// src/utils/mongo.utils.ts
/**
 * Utilidades para trabajar con MongoDB ObjectIds y validaciones relacionadas
 */

/**
 * Validar si una cadena es un ObjectId válido de MongoDB
 * @param id - String a validar
 * @returns boolean - true si es un ObjectId válido
 */
export function isValidObjectId(id: string | undefined | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // ObjectId debe tener exactamente 24 caracteres hexadecimales
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Validar múltiples ObjectIds
 * @param ids - Array de strings a validar
 * @returns boolean - true si todos son ObjectIds válidos
 */
export function areValidObjectIds(ids: (string | undefined | null)[]): boolean {
  if (!Array.isArray(ids) || ids.length === 0) {
    return false;
  }

  return ids.every(id => isValidObjectId(id));
}

/**
 * Filtrar ObjectIds válidos de un array
 * @param ids - Array de strings
 * @returns Array de ObjectIds válidos
 */
export function filterValidObjectIds(ids: (string | undefined | null)[]): string[] {
  return ids.filter((id): id is string => isValidObjectId(id));
}

/**
 * Generar un ObjectId simulado (para testing o placeholders)
 * Nota: No usar en producción para crear ObjectIds reales
 * @returns string - ObjectId simulado
 */
export function generateMockObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomBytes = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return timestamp + randomBytes;
}

/**
 * Extraer timestamp de un ObjectId
 * @param objectId - ObjectId válido
 * @returns Date - Fecha de creación del ObjectId
 */
export function getObjectIdTimestamp(objectId: string): Date | null {
  if (!isValidObjectId(objectId)) {
    return null;
  }

  const timestamp = parseInt(objectId.substring(0, 8), 16);
  return new Date(timestamp * 1000);
}

/**
 * Comparar dos ObjectIds (útil para sorting)
 * @param a - Primer ObjectId
 * @param b - Segundo ObjectId
 * @returns number - Resultado de comparación (-1, 0, 1)
 */
export function compareObjectIds(a: string, b: string): number {
  if (!isValidObjectId(a) || !isValidObjectId(b)) {
    throw new Error('Invalid ObjectIds provided for comparison');
  }

  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Verificar si un ObjectId fue creado dentro de un rango de fechas
 * @param objectId - ObjectId a verificar
 * @param startDate - Fecha de inicio del rango
 * @param endDate - Fecha de fin del rango
 * @returns boolean - true si está dentro del rango
 */
export function isObjectIdInDateRange(
  objectId: string, 
  startDate: Date, 
  endDate: Date
): boolean {
  const timestamp = getObjectIdTimestamp(objectId);
  
  if (!timestamp) {
    return false;
  }

  return timestamp >= startDate && timestamp <= endDate;
}

/**
 * Convertir ObjectId a string de forma segura
 * @param objectId - ObjectId que puede ser string o objeto
 * @returns string - ObjectId como string
 */
export function toObjectIdString(objectId: any): string | null {
  if (typeof objectId === 'string') {
    return isValidObjectId(objectId) ? objectId : null;
  }

  if (objectId && typeof objectId === 'object' && objectId.toString) {
    const stringified = objectId.toString();
    return isValidObjectId(stringified) ? stringified : null;
  }

  return null;
}

/**
 * Crear un ObjectId de MongoDB válido desde timestamp
 * Útil para crear filtros de fecha usando ObjectIds
 * @param date - Fecha para crear el ObjectId
 * @returns string - ObjectId que representa esa fecha
 */
export function createObjectIdFromDate(date: Date): string {
  const timestamp = Math.floor(date.getTime() / 1000).toString(16).padStart(8, '0');
  // Rellenar con ceros para completar los 24 caracteres
  const padding = '0'.repeat(16);
  return timestamp + padding;
}

/**
 * Obtener el ObjectId más antiguo posible para una fecha
 * @param date - Fecha
 * @returns string - ObjectId mínimo para esa fecha
 */
export function getMinObjectIdForDate(date: Date): string {
  return createObjectIdFromDate(date);
}

/**
 * Obtener el ObjectId más reciente posible para una fecha
 * @param date - Fecha
 * @returns string - ObjectId máximo para esa fecha
 */
export function getMaxObjectIdForDate(date: Date): string {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const timestamp = Math.floor(nextDay.getTime() / 1000).toString(16).padStart(8, '0');
  // Rellenar con 'f' para obtener el máximo posible
  const padding = 'f'.repeat(16);
  return timestamp + padding;
}

/**
 * Validar y limpiar un array de ObjectIds
 * @param ids - Array de posibles ObjectIds
 * @returns Array de ObjectIds válidos únicos
 */
export function sanitizeObjectIdArray(ids: any[]): string[] {
  const validIds = new Set<string>();
  
  for (const id of ids) {
    const stringId = toObjectIdString(id);
    if (stringId) {
      validIds.add(stringId);
    }
  }
  
  return Array.from(validIds);
}

/**
 * Crear filtros de fecha usando ObjectIds (más eficiente para MongoDB)
 * @param startDate - Fecha de inicio (opcional)
 * @param endDate - Fecha de fin (opcional)
 * @returns Objeto con filtros $gte y $lt para _id
 */
export function createDateRangeFilter(startDate?: Date, endDate?: Date): Record<string, any> {
  const filter: Record<string, any> = {};
  
  if (startDate) {
    filter.$gte = getMinObjectIdForDate(startDate);
  }
  
  if (endDate) {
    filter.$lt = getMinObjectIdForDate(endDate);
  }
  
  return Object.keys(filter).length > 0 ? filter : {};
}

/**
 * Utilidades agrupadas para export
 */
export const MongoUtils = {
  isValidObjectId,
  areValidObjectIds,
  filterValidObjectIds,
  generateMockObjectId,
  getObjectIdTimestamp,
  compareObjectIds,
  isObjectIdInDateRange,
  toObjectIdString,
  createObjectIdFromDate,
  getMinObjectIdForDate,
  getMaxObjectIdForDate,
  sanitizeObjectIdArray,
  createDateRangeFilter,
} as const;

/**
 * Constantes útiles
 */
export const MONGO_CONSTANTS = {
  OBJECT_ID_LENGTH: 24,
  OBJECT_ID_REGEX: /^[0-9a-fA-F]{24}$/,
  MIN_OBJECT_ID: '000000000000000000000000',
  MAX_OBJECT_ID: 'ffffffffffffffffffffffff',
} as const;