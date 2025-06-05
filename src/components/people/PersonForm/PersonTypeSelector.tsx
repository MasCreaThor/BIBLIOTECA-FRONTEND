// src/components/people/PersonForm/PersonTypeSelector.tsx
'use client';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
  Skeleton,
} from '@chakra-ui/react';
import { Controller, UseFormReturn } from 'react-hook-form';
import type { DynamicPersonFormData } from '@/lib/validation/personValidation';
import type { PersonType } from '@/types/api.types';

interface PersonTypeSelectorProps {
  form: UseFormReturn<DynamicPersonFormData>;
  personTypes?: PersonType[];
  isLoadingTypes: boolean;
  isEdit: boolean; // ✅ VERIFICADO: Esperamos boolean estricto
}

/**
 * Subcomponente para selección de tipo de persona
 * Responsabilidad única: Selección y validación del tipo de persona
 */
export function PersonTypeSelector({ 
  form, 
  personTypes, 
  isLoadingTypes, 
  isEdit 
}: PersonTypeSelectorProps) {
  const { control, formState: { errors } } = form;

  return (
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
  );
}