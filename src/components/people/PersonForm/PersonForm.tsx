// src/components/people/PersonForm/PersonForm.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { usePersonForm } from './usePersonForm';
import { PersonBasicFields } from './PersonBasicFields';
import { PersonTypeSelector } from './PersonTypeSelector';
import { DocumentValidation } from './DocumentValidation';
import { GradeField } from './GradeField';
import type { Person, CreatePersonRequest, UpdatePersonRequest } from '@/types/api.types';

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

/**
 * Componente principal del formulario de personas
 * 
 * Responsabilidades:
 * - Coordinación de subcomponentes
 * - Presentación de la UI principal
 * - Manejo de estados de carga y errores
 * 
 * Lógica de negocio delegada a:
 * - usePersonForm (hook personalizado)
 * - PersonValidationSchemaFactory (validaciones)
 * - PersonBusinessRules (reglas de negocio)
 */
export function PersonForm(props: PersonFormProps) {
  const {
    onSubmit,
    onCancel,
    isLoading = false,
  } = props;
  
  const person = 'person' in props ? props.person : undefined;
  const isEdit = 'isEdit' in props ? !!props.isEdit : false;

  const {
    form,
    selectedPersonType,
    isStudent,
    isTeacher,
    personTypes,
    documentValidation,
    isLoadingTypes,
    handleSubmit,
    businessRulesErrors,
  } = usePersonForm({
    person,
    isEdit,
    onSubmit,
    onCancel,
  });

  // Estados derivados para UI
  const { formState: { isValid, isDirty } } = form;
  const canSubmit = isValid && isDirty && !documentValidation.hasConflict && businessRulesErrors.length === 0;

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit}>
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

            {/* Errores de reglas de negocio */}
            {businessRulesErrors.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Errores de validación</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={1} mt={2}>
                      {businessRulesErrors.map((error, index) => (
                        <Text key={index} fontSize="sm">• {error}</Text>
                      ))}
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Información básica */}
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información Personal
              </Text>

              <PersonBasicFields form={form} />

              <HStack spacing={4} align="start">
                <PersonTypeSelector
                  form={form}
                  personTypes={personTypes}
                  isLoadingTypes={isLoadingTypes}
                  isEdit={isEdit}
                />

                <DocumentValidation
                  form={form}
                  documentValidation={documentValidation}
                />
              </HStack>

              <GradeField
                form={form}
                isStudent={isStudent}
                isTeacher={isTeacher}
                selectedPersonType={selectedPersonType}
              />
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
                disabled={!canSubmit}
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