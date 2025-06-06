// src/lib/validation/index.ts
// Barrel export para el sistema de validaciones

// Validaciones de personas
export {
    basePersonSchema,
    studentPersonSchema,
    teacherPersonSchema,
    dynamicPersonSchema,
    PersonValidationSchemaFactory,
    PersonBusinessRules,
  } from './personValidation';
  
  export type {
    BasePersonFormData,
    StudentPersonFormData,
    TeacherPersonFormData,
    DynamicPersonFormData,
  } from './personValidation';