// src/components/resources/ResourceForm/MetadataSection.tsx
'use client';

import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Text,
  Alert,
  AlertIcon,
  Badge,
  InputGroup,
  InputRightElement,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FiBook, FiSearch, FiCheck, FiX } from 'react-icons/fi';
import { useResourceByISBN } from '@/hooks/useResources';

interface MetadataSectionProps {
  form: UseFormReturn<any>;
}

export function MetadataSection({ form }: MetadataSectionProps) {
  const { register, watch, formState: { errors } } = form;
  const [isbnToCheck, setIsbnToCheck] = useState('');
  const [showIsbnValidation, setShowIsbnValidation] = useState(false);
  
  const currentIsbn = watch('isbn');
  
  // Query para verificar ISBN existente
  const {
    data: existingResource,
    isLoading: isCheckingIsbn,
    error: isbnError,
  } = useResourceByISBN(
    isbnToCheck,
    showIsbnValidation && isbnToCheck.length >= 10
  );

  // Validar formato de ISBN
  const validateISBN = (isbn: string): { isValid: boolean; message?: string } => {
    if (!isbn || isbn.trim() === '') {
      return { isValid: true }; // ISBN es opcional
    }

    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    if (!/^\d+$/.test(cleanISBN)) {
      return { isValid: false, message: 'El ISBN solo puede contener números, guiones y espacios' };
    }

    if (cleanISBN.length === 10) {
      return { isValid: true };
    } else if (cleanISBN.length === 13) {
      return { isValid: true };
    } else {
      return { isValid: false, message: 'El ISBN debe tener 10 o 13 dígitos' };
    }
  };

  // Efecto para validar ISBN cuando cambia
  useEffect(() => {
    if (currentIsbn && currentIsbn.trim()) {
      const cleanISBN = currentIsbn.replace(/[-\s]/g, '');
      if (cleanISBN.length >= 10) {
        setIsbnToCheck(cleanISBN);
        setShowIsbnValidation(true);
      } else {
        setShowIsbnValidation(false);
      }
    } else {
      setShowIsbnValidation(false);
    }
  }, [currentIsbn]);

  const isbnValidation = validateISBN(currentIsbn || '');
  const hasExistingResource = existingResource && !isbnError;

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="medium" color="gray.700" fontSize="md">
        Información Adicional
      </Text>

      {/* ISBN */}
      <FormControl isInvalid={!!errors.isbn || !isbnValidation.isValid}>
        <FormLabel>
          ISBN
          <Badge ml={2} colorScheme="gray" fontSize="xs">
            Opcional
          </Badge>
        </FormLabel>
        <InputGroup>
          <Input
            {...register('isbn')}
            placeholder="978-84-376-0494-7 o 84-376-0494-X"
            maxLength={17} // Máximo con guiones
          />
          <InputRightElement>
            {isCheckingIsbn ? (
              <FiSearch color="gray.400" />
            ) : hasExistingResource ? (
              <FiX color="red" />
            ) : showIsbnValidation && isbnValidation.isValid ? (
              <FiCheck color="green" />
            ) : null}
          </InputRightElement>
        </InputGroup>
        
        <FormErrorMessage>
          {(errors.isbn?.message as string) || isbnValidation.message}
        </FormErrorMessage>
        
        <FormHelperText>
          Código ISBN-10 o ISBN-13. Útil para libros y algunas publicaciones.
        </FormHelperText>

        {/* Validación de ISBN existente */}
        {showIsbnValidation && isbnValidation.isValid && (
          <VStack spacing={2} mt={2} align="stretch">
            {isCheckingIsbn && (
              <Alert status="info" size="sm">
                <AlertIcon />
                <Text fontSize="sm">Verificando ISBN...</Text>
              </Alert>
            )}

            {!isCheckingIsbn && hasExistingResource && (
              <Alert status="warning" size="sm">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    Ya existe un recurso con este ISBN
                  </Text>
                  <Text fontSize="xs">
                    Título: {existingResource.title}
                  </Text>
                </VStack>
              </Alert>
            )}

            {!isCheckingIsbn && !hasExistingResource && !isbnError && (
              <Alert status="success" size="sm">
                <AlertIcon />
                <Text fontSize="sm">ISBN disponible</Text>
              </Alert>
            )}
          </VStack>
        )}
      </FormControl>

      {/* Notas */}
      <FormControl isInvalid={!!errors.notes}>
        <FormLabel>
          Notas y Observaciones
          <Badge ml={2} colorScheme="gray" fontSize="xs">
            Opcional
          </Badge>
        </FormLabel>
        <Textarea
          {...register('notes')}
          placeholder="Información adicional sobre el recurso, estado especial, restricciones de uso, etc."
          rows={4}
          resize="vertical"
        />
        <FormErrorMessage>{errors.notes?.message as string}</FormErrorMessage>
        <FormHelperText>
          Información adicional que pueda ser útil sobre este recurso (máximo 500 caracteres)
        </FormHelperText>
      </FormControl>

      {/* Información sobre campos opcionales */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" fontWeight="medium">
            Campos opcionales
          </Text>
          <Text fontSize="xs">
            El ISBN y las notas son completamente opcionales. Solo agrégalos si tienes la información disponible.
            Para libros, es recomendable incluir el ISBN si está disponible.
          </Text>
        </VStack>
      </Alert>
    </VStack>
  );
}