/**
 * Utilidades para manejo de tipos de persona
 */

/**
 * Traduce el tipo de persona del inglés al español
 * @param personType - Tipo de persona en inglés (student, teacher, etc.)
 * @returns Tipo de persona traducido al español
 */
export const getPersonTypeLabel = (personType: string | undefined): string => {
  const typeMap: Record<string, string> = {
    'student': 'Estudiante',
    'teacher': 'Docente',
    'Student': 'Estudiante',
    'Teacher': 'Docente',
    'STUDENT': 'Estudiante',
    'TEACHER': 'Docente'
  };
  
  return typeMap[personType?.toLowerCase() || ''] || personType || 'No especificado';
};

/**
 * Obtiene el color del badge según el tipo de persona
 * @param personType - Tipo de persona
 * @returns Color del badge
 */
export const getPersonTypeBadgeColor = (personType: string | undefined): string => {
  const typeLower = personType?.toLowerCase() || '';
  
  if (typeLower === 'student' || typeLower === 'estudiante') {
    return 'blue';
  }
  
  if (typeLower === 'teacher' || typeLower === 'docente') {
    return 'purple';
  }
  
  return 'gray';
}; 