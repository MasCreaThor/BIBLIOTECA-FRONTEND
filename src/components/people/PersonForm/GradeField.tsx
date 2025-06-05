// src/components/people/PersonForm/GradeField.tsx
'use client';

import {
    Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  HStack,
  Icon,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import { FiBook } from 'react-icons/fi';
import type { DynamicPersonFormData } from '@/lib/validation/personValidation';

interface GradeFieldProps {
  form: UseFormReturn<DynamicPersonFormData>;
  isStudent: boolean;
  isTeacher: boolean;
  selectedPersonType: any;
}

/**
 * Subcomponente para el campo de grado/área
 * Responsabilidad única: Captura de información académica según el tipo de persona
 */
export function GradeField({ 
  form, 
  isStudent, 
  isTeacher, 
  selectedPersonType 
}: GradeFieldProps) {
  const { register, formState: { errors } } = form;

  // No mostrar nada si no hay tipo seleccionado
  if (!selectedPersonType) {
    return null;
  }

  // Mostrar campo para estudiantes
  if (isStudent) {
    return (
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
    );
  }

  // Mostrar información para docentes
  if (isTeacher) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Información para Docentes</AlertTitle>
          <AlertDescription fontSize="sm">
            Los docentes no requieren información adicional de área o asignatura. 
            Esta información se gestiona a través del sistema académico principal.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return null;
}