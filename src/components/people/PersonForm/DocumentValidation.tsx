// src/components/people/PersonForm/DocumentValidation.tsx
'use client';

import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import { PersonTypeManager } from '@/lib/personType';
import type { DynamicPersonFormData } from '@/lib/validation/personValidation';
import type { Person } from '@/types/api.types';

interface DocumentValidationProps {
  form: UseFormReturn<DynamicPersonFormData>;
  documentValidation: {
    isValidating: boolean;
    hasConflict: boolean;
    existingPerson: Person | null;
    showValidation: boolean;
  };
}

/**
 * Subcomponente para validación de número de documento
 * Responsabilidad única: Validación y verificación de unicidad del documento
 */
export function DocumentValidation({ 
  form, 
  documentValidation 
}: DocumentValidationProps) {
  const { register, formState: { errors } } = form;
  const { isValidating, hasConflict, existingPerson, showValidation } = documentValidation;

  return (
    <Box>
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

      {/* Validación de documento */}
      {showValidation && (
        <Box mt={4}>
          {isValidating && (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>Validando documento...</AlertTitle>
            </Alert>
          )}

          {!isValidating && hasConflict && existingPerson && (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Documento ya registrado</AlertTitle>
                <AlertDescription>
                  Este número de documento ya está registrado para:{' '}
                  <strong>{PersonTypeManager.getFullName(existingPerson)}</strong>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {!isValidating && !hasConflict && existingPerson === null && (
            <Alert status="success">
              <AlertIcon />
              <AlertTitle>Documento disponible</AlertTitle>
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}