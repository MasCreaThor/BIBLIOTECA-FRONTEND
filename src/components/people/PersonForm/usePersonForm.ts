// src/components/people/PersonForm/usePersonForm.ts
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  PersonValidationSchemaFactory,
  PersonBusinessRules,
  type DynamicPersonFormData 
} from '@/lib/validation/personValidation';
import { PersonTypeManager } from '@/lib/personType';
import { TextUtils } from '@/utils';
import { usePersonTypes, usePersonByDocument } from '@/hooks/usePeople';
import type { Person, CreatePersonRequest, UpdatePersonRequest } from '@/types/api.types';

export interface UsePersonFormOptions {
  person?: Person;
  isEdit?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export interface UsePersonFormReturn {
  // Form state
  form: ReturnType<typeof useForm<DynamicPersonFormData>>;
  
  // Person type state
  selectedPersonType: any;
  isStudent: boolean;
  isTeacher: boolean;
  personTypes: any[];
  
  // Document validation state
  documentValidation: {
    isValidating: boolean;
    hasConflict: boolean;
    existingPerson: Person | null;
    showValidation: boolean;
  };
  
  // Loading states
  isLoadingTypes: boolean;
  
  // Handlers
  handleSubmit: () => void;
  resetForm: () => void;
  
  // Validation
  businessRulesErrors: string[];
}

/**
 * Custom hook que maneja toda la lógica del formulario de personas
 */
export function usePersonForm({
  person,
  isEdit = false,
  onSubmit,
  onCancel,
}: UsePersonFormOptions): UsePersonFormReturn {
  
  // Estados locales
  const [selectedPersonTypeId, setSelectedPersonTypeId] = useState<string>(
    person?.personTypeId || ''
  );
  const [documentToValidate, setDocumentToValidate] = useState<string>('');
  const [showDocumentValidation, setShowDocumentValidation] = useState(false);
  const [businessRulesErrors, setBusinessRulesErrors] = useState<string[]>([]);

  // Queries
  const { data: personTypes, isLoading: isLoadingTypes } = usePersonTypes();
  const { 
    data: existingPerson, 
    isLoading: isValidatingDocument,
  } = usePersonByDocument(
    documentToValidate,
    showDocumentValidation && documentToValidate.length >= 6
  );

  // Determinar el tipo de persona seleccionado
  const selectedPersonType = personTypes?.find(type => type._id === selectedPersonTypeId);
  const isStudent = selectedPersonType ? PersonTypeManager.isStudent(
    { personTypeId: selectedPersonType._id, personType: selectedPersonType } as Person, 
    personTypes
  ) : false;
  const isTeacher = !isStudent && !!selectedPersonType;

  // Configurar formulario con schema dinámico
  const form = useForm<DynamicPersonFormData>({
    resolver: zodResolver(PersonValidationSchemaFactory.getSchema(isStudent)),
    defaultValues: {
      firstName: person?.firstName || '',
      lastName: person?.lastName || '',
      personTypeId: person?.personTypeId || '',
      documentNumber: person?.documentNumber || '',
      grade: person?.grade || '',
    },
    mode: 'onChange',
  });

  const { watch, setValue, reset, handleSubmit: handleFormSubmit } = form;

  // Observar cambios en campos críticos
  const watchedPersonTypeId = watch('personTypeId');
  const watchedDocumentNumber = watch('documentNumber');

  // Efecto para manejar cambios en el tipo de persona
  useEffect(() => {
    setSelectedPersonTypeId(watchedPersonTypeId);
    
    // Limpiar grado si cambia a docente
    if (personTypes) {
      const selectedType = personTypes.find(type => type._id === watchedPersonTypeId);
      if (selectedType?.name === 'teacher') {
        setValue('grade', '');
      }
    }

    // Revalidar reglas de negocio cuando cambia el tipo
    if (watchedPersonTypeId) {
      validateBusinessRules();
    }
  }, [watchedPersonTypeId, personTypes, setValue]);

  // Efecto para manejar validación de documento
  useEffect(() => {
    const document = watchedDocumentNumber?.trim();
    if (document && document.length >= 6) {
      // Solo validar si es diferente al documento original (en caso de edición)
      if (!person || document !== person.documentNumber) {
        setDocumentToValidate(document);
        setShowDocumentValidation(true);
      } else {
        setShowDocumentValidation(false);
      }
    } else {
      setShowDocumentValidation(false);
    }
  }, [watchedDocumentNumber, person]);

  // Efecto para resetear formulario cuando cambia la persona
  useEffect(() => {
    if (person) {
      reset({
        firstName: person.firstName,
        lastName: person.lastName,
        personTypeId: person.personTypeId,
        documentNumber: person.documentNumber || '',
        grade: person.grade || '',
      });
    }
  }, [person, reset]);

  // Validar reglas
  const validateBusinessRules = useCallback(() => {
    const formData = form.getValues();
    const validation = PersonBusinessRules.validateAllRules(formData, isStudent);
    setBusinessRulesErrors(validation.errors);
  }, [form, isStudent]);

  // Ejecutar validación de reglas
  useEffect(() => {
    const subscription = form.watch(() => {
      validateBusinessRules();
    });
    return () => subscription.unsubscribe();
  }, [form, validateBusinessRules]);

  // Handler para envío del formulario
  const handleSubmit = handleFormSubmit((data: DynamicPersonFormData) => {
    // Validar reglas de negocio antes del envío
    const businessValidation = PersonBusinessRules.validateAllRules(data, isStudent);
    if (!businessValidation.isValid) {
      setBusinessRulesErrors(businessValidation.errors);
      return;
    }

    // Limpiar y formatear datos antes de enviar
    const cleanData = {
      firstName: TextUtils.capitalize(data.firstName.trim()),
      lastName: TextUtils.capitalize(data.lastName.trim()),
      personTypeId: isEdit ? person?.personTypeId : data.personTypeId, // Mantener el ID original en edición
      documentNumber: data.documentNumber?.trim() || undefined,
      grade: isStudent && data.grade ? data.grade.trim() : undefined,
    };

    onSubmit(cleanData);
  });

  // Reset del formulario
  const resetForm = useCallback(() => {
    reset();
    setBusinessRulesErrors([]);
    setShowDocumentValidation(false);
    setDocumentToValidate('');
  }, [reset]);

  // Verificar si hay conflicto de documento
  const hasDocumentConflict = existingPerson && (!person || existingPerson._id !== person._id);

  return {
    // Form state
    form,
    
    // Person type state
    selectedPersonType,
    isStudent,
    isTeacher,
    personTypes: personTypes || [],
    
    // Document validation state
    documentValidation: {
      isValidating: isValidatingDocument,
      hasConflict: !!hasDocumentConflict,
      existingPerson: existingPerson || null,
      showValidation: showDocumentValidation,
    },
    
    // Loading states
    isLoadingTypes,
    
    // Handlers
    handleSubmit,
    resetForm,
    
    // Validation
    businessRulesErrors,
  };
}