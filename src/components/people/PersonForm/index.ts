// src/components/people/PersonForm/index.ts
// Barrel export para el módulo PersonForm

// Componente principal
export { PersonForm } from './PersonForm';

// Hook personalizado (exportado para testing si es necesario)
export { usePersonForm } from './usePersonForm';
export type { UsePersonFormOptions, UsePersonFormReturn } from './usePersonForm';

// Subcomponentes (exportados para reutilización si es necesario)
export { PersonBasicFields } from './PersonBasicFields';
export { PersonTypeSelector } from './PersonTypeSelector';
export { DocumentValidation } from './DocumentValidation';
export { GradeField } from './GradeField';