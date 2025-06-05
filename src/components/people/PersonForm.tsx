// src/components/people/PersonForm.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Button,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Text,
  Badge,
  Skeleton,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiUser, FiUsers, FiBook, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { usePersonTypes, usePersonByDocument } from '@/hooks/usePeople';
import type { Person, CreatePersonRequest, UpdatePersonRequest } from '@/types/api.types';
import { TextUtils, ValidationUtils } from '@/utils';

// Schema de validación base
const basePersonSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  personTypeId: z
    .string()
    .min(1, 'Debes seleccionar un tipo de persona'),
  documentNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Opcional
      return ValidationUtils.isValidColombiannDocument(val);
    }, 'El número de documento debe tener entre 6 y 11 dígitos'),
});

// Schema extendido para estudiantes
const studentSchema = basePersonSchema.extend({
  grade: z
    .string()
    .min(1, 'El grado es requerido para estudiantes')
    .max(50, 'El grado no puede exceder 50 caracteres'),
});

// Schema para docentes (grade es opcional)
const teacherSchema = basePersonSchema.extend({
  grade: z.string().optional(),
});

// Tipos para los props del formulario
interface PersonFormCreateProps {
  person?: never;
  onSubmit: (data: CreatePersonRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: false;
}

interface PersonFormEditProps {
  person: Person;
  onSubmit: (data: UpdatePersonRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit: true;
}

type PersonFormProps = PersonFormCreateProps | PersonFormEditProps;

type PersonFormData = z.infer<typeof basePersonSchema> & {
  grade?: string;
};

export function PersonForm(props: PersonFormProps) {
  const {
    onSubmit,
    onCancel,
    isLoading = false,
  } = props;
  
  const person = 'person' in props ? props.person : undefined;
  const isEdit = 'isEdit' in props ? props.isEdit : false;
  const [selectedPersonTypeId, setSelectedPersonTypeId] = useState<string>(
    person?.personTypeId || ''
  );
  const [documentToValidate, setDocumentToValidate] = useState<string>('');
  const [showDocumentValidation, setShowDocumentValidation] = useState(false);

  // Queries
  const { data: personTypes, isLoading: isLoadingTypes } = usePersonTypes();
  const { 
    data: existingPerson, 
    isLoading: isValidatingDocument,
    error: documentError 
  } = usePersonByDocument(
    documentToValidate,
    showDocumentValidation && documentToValidate.length >= 6
  );

  // Determinar el tipo de persona seleccionado
  const selectedPersonType = personTypes?.find(type => type._id === selectedPersonTypeId);
  const isStudent = selectedPersonType?.name === 'student';
  const isTeacher = selectedPersonType?.name === 'teacher';

  // Determinar schema a usar
  const validationSchema = isStudent ? studentSchema : teacherSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<PersonFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: person?.firstName || '',
      lastName: person?.lastName || '',
      personTypeId: person?.personTypeId || '',
      documentNumber: person?.documentNumber || '',
      grade: person?.grade || '',
    },
    mode: 'onChange',
  });

  // Observar cambios en el tipo de persona
  const watchedPersonTypeId = watch('personTypeId');
  const watchedDocumentNumber = watch('documentNumber');

  useEffect(() => {
    setSelectedPersonTypeId(watchedPersonTypeId);
    
    // Limpiar grado si cambia a docente
    if (personTypes) {
      const selectedType = personTypes.find(type => type._id === watchedPersonTypeId);
      if (selectedType?.name === 'teacher') {
        setValue('grade', '');
      }
    }
  }, [watchedPersonTypeId, personTypes, setValue]);

  // Manejar validación de documento
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

  // Resetear formulario cuando cambia la persona
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

  const handleFormSubmit = (data: PersonFormData) => {
    // Limpiar datos antes de enviar
    const cleanData = {
      firstName: TextUtils.capitalize(data.firstName.trim()),
      lastName: TextUtils.capitalize(data.lastName.trim()),
      personTypeId: data.personTypeId,
      documentNumber: data.documentNumber?.trim() || undefined,
      grade: isStudent && data.grade ? data.grade.trim() : undefined,
    };

    // Type assertion basada en el modo (create vs edit)
    if (isEdit) {
      (onSubmit as (data: UpdatePersonRequest) => void)(cleanData);
    } else {
      (onSubmit as (data: CreatePersonRequest) => void)(cleanData);
    }
  };

  const hasDocumentConflict = existingPerson && (!person || existingPerson._id !== person._id);

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={FiUser} color="blue.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {isEdit ? 'Editar Persona' : 'Registrar Nueva Persona'}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {isEdit 
                  ? 'Modifica la información de la persona registrada'
                  : 'Completa la información para registrar una nueva persona en el sistema'
                }
              </Text>
            </Box>

            <Divider />

            {/* Información básica */}
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información Personal
              </Text>

              <HStack spacing={4} align="start">
                <FormControl isInvalid={!!errors.firstName} flex={1}>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    {...register('firstName')}
                    placeholder="Ej: Juan Carlos"
                    autoComplete="given-name"
                  />
                  <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.lastName} flex={1}>
                  <FormLabel>Apellido</FormLabel>
                  <Input
                    {...register('lastName')}
                    placeholder="Ej: Pérez González"
                    autoComplete="family-name"
                  />
                  <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              <HStack spacing={4} align="start">
                <FormControl isInvalid={!!errors.personTypeId} flex={1}>
                  <FormLabel>Tipo de Persona</FormLabel>
                  {isLoadingTypes ? (
                    <Skeleton height="40px" />
                  ) : (
                    <Controller
                      name="personTypeId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Selecciona el tipo"
                          disabled={isEdit} // No permitir cambiar tipo en edición
                        >
                          {personTypes?.map((type) => (
                            <option key={type._id} value={type._id}>
                              {type.description}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  )}
                  <FormErrorMessage>{errors.personTypeId?.message}</FormErrorMessage>
                  {isEdit && (
                    <FormHelperText>
                      El tipo de persona no se puede modificar después del registro
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.documentNumber} flex={1}>
                  <FormLabel>
                    Número de Documento
                    <Badge ml={2} colorScheme="gray" fontSize="xs">
                      Opcional
                    </Badge>
                  </FormLabel>
                  <Input
                    {...register('documentNumber')}
                    placeholder="Ej: 1234567890"
                    type="text"
                    autoComplete="off"
                  />
                  <FormErrorMessage>{errors.documentNumber?.message}</FormErrorMessage>
                  <FormHelperText>
                    Entre 6 y 11 dígitos. Opcional para estudiantes.
                  </FormHelperText>
                </FormControl>
              </HStack>

              {/* Validación de documento */}
              {showDocumentValidation && (
                <Box>
                  {isValidatingDocument && (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>Validando documento...</AlertTitle>
                    </Alert>
                  )}

                  {!isValidatingDocument && hasDocumentConflict && (
                    <Alert status="error">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Documento ya registrado</AlertTitle>
                        <AlertDescription>
                          Este número de documento ya está registrado para:{' '}
                          <strong>{existingPerson.fullName}</strong>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {!isValidatingDocument && !hasDocumentConflict && existingPerson === null && (
                    <Alert status="success">
                      <AlertIcon />
                      <AlertTitle>Documento disponible</AlertTitle>
                    </Alert>
                  )}
                </Box>
              )}

              {/* Campo grado para estudiantes */}
              {selectedPersonType && (
                <Box>
                  {isStudent && (
                    <FormControl isInvalid={!!errors.grade} isRequired>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Icon as={FiBook} color="blue.500" />
                          <Text>Grado</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        {...register('grade')}
                        placeholder="Ej: 10A, Jardín, Preescolar"
                      />
                      <FormErrorMessage>{errors.grade?.message}</FormErrorMessage>
                      <FormHelperText>
                        Especifica el grado o nivel académico del estudiante
                      </FormHelperText>
                    </FormControl>
                  )}

                  {isTeacher && (
                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Icon as={FiUsers} color="green.500" />
                          <Text>Área o Asignatura</Text>
                          <Badge colorScheme="gray" fontSize="xs">
                            Opcional
                          </Badge>
                        </HStack>
                      </FormLabel>
                      <Input
                        {...register('grade')}
                        placeholder="Ej: Matemáticas, Coordinador, Rector"
                      />
                      <FormHelperText>
                        Puedes especificar el área de enseñanza o cargo del docente
                      </FormHelperText>
                    </FormControl>
                  )}
                </Box>
              )}
            </VStack>

            <Divider />

            {/* Botones de acción */}
            <HStack spacing={3} justify="flex-end">
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText={isEdit ? 'Actualizando...' : 'Registrando...'}
                disabled={!isValid || !isDirty || hasDocumentConflict}
                leftIcon={<Icon as={FiCheck} />}
              >
                {isEdit ? 'Actualizar Persona' : 'Registrar Persona'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}