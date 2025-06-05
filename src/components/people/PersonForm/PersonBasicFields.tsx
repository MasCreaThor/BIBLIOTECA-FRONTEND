// src/components/people/PersonForm/PersonBasicFields.tsx
'use client';

import {
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
} from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import type { DynamicPersonFormData } from '@/lib/validation/personValidation';

interface PersonBasicFieldsProps {
  form: UseFormReturn<DynamicPersonFormData>;
}

/**
 * Subcomponente para los campos básicos de nombre y apellido
 * Responsabilidad única: Captura de información personal básica
 */
export function PersonBasicFields({ form }: PersonBasicFieldsProps) {
  const { register, formState: { errors } } = form;

  return (
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
  );
}