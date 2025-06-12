// src/components/admin/locations/LocationForm.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Switch,
  Grid,
  GridItem,
  Icon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiCheck, FiX, FiMapPin } from 'react-icons/fi';
import type { Location, CreateLocationRequest, UpdateLocationRequest } from '@/services/location.service';

// ✅ CORREGIDO: Schema que permite limpiar el campo code
const locationSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform(val => val.trim()),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .transform(val => val.trim()),
  code: z
    .string()
    .max(20, 'El código no puede exceder 20 caracteres')
    .optional()
    .transform(val => {
      // ✅ CORREGIDO: Permitir strings vacíos explícitamente
      if (!val || val.trim() === '') return '';
      return val.trim();
    }),
  active: z.boolean().default(true),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormCreateProps {
  location?: never;
  onSubmit: (data: CreateLocationRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: false;
}

interface LocationFormEditProps {
  location: Location;
  onSubmit: (data: UpdateLocationRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit: true;
}

type LocationFormProps = LocationFormCreateProps | LocationFormEditProps;

export function LocationForm(props: LocationFormProps) {
  const { onSubmit, onCancel, isLoading = false } = props;
  const location = 'location' in props ? props.location : undefined;
  const isEdit = 'isEdit' in props ? props.isEdit : false;

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      description: location?.description || '',
      // ✅ CORREGIDO: Manejar code como string vacío en lugar de undefined
      code: location?.code || '',
      active: location?.active ?? true,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState: { errors, isValid, isDirty } } = form;

  const handleFormSubmit = handleSubmit(async (data: LocationFormData) => {
    // ✅ CORREGIDO: Limpiar datos antes de enviar
    const cleanData = {
      name: data.name,
      description: data.description,
      // ✅ IMPORTANTE: Enviar code como string vacío si está vacío, no como undefined
      code: data.code || '',
      ...(isEdit && { active: data.active }),
    };

    if (isEdit) {
      await (onSubmit as (data: UpdateLocationRequest) => Promise<void>)(cleanData);
    } else {
      const { active, ...createData } = cleanData;
      await (onSubmit as (data: CreateLocationRequest) => Promise<void>)(createData);
    }
  });

  const canSubmit = isValid && isDirty;

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleFormSubmit}>
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={FiMapPin} color="green.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {isEdit ? 'Editar Ubicación' : 'Nueva Ubicación'}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {isEdit 
                  ? 'Modifica la información de la ubicación'
                  : 'Las ubicaciones ayudan a organizar físicamente los recursos'
                }
              </Text>
            </Box>

            <Divider />

            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información Básica
              </Text>

              <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!errors.name} isRequired>
                    <FormLabel>Nombre de la Ubicación</FormLabel>
                    <Input
                      {...register('name')}
                      placeholder="Ej: Estante Principal A, Armario de Mapas..."
                      size="lg"
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                    <FormHelperText>
                      Nombre descriptivo de la ubicación física
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={!!errors.code}>
                    <FormLabel>Código de Ubicación</FormLabel>
                    <Input
                      {...register('code')}
                      placeholder="EST-A, ARM-01... (opcional)"
                      maxLength={20}
                    />
                    <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
                    <FormHelperText>
                      Código corto para identificación rápida. Déjalo vacío si no necesitas uno.
                    </FormHelperText>
                  </FormControl>
                </GridItem>
              </Grid>

              <FormControl isInvalid={!!errors.description} isRequired>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Describe la ubicación física y qué recursos contiene..."
                  rows={3}
                  resize="vertical"
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                <FormHelperText>
                  Describe dónde se encuentra y qué recursos almacena
                </FormHelperText>
              </FormControl>

              {isEdit && (
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <FormLabel mb={0}>Estado de la Ubicación</FormLabel>
                      <FormHelperText mt={0}>
                        Las ubicaciones inactivas no aparecen en los formularios
                      </FormHelperText>
                    </VStack>
                    <Switch
                      {...register('active')}
                      colorScheme="green"
                      size="lg"
                    />
                  </HStack>
                </FormControl>
              )}
            </VStack>

            <Box>
              <Text fontWeight="medium" color="gray.700" fontSize="md" mb={3}>
                Vista Previa
              </Text>
              <Card bg="gray.50" size="sm">
                <CardBody>
                  <HStack spacing={3}>
                    <FiMapPin color="#38A169" size={16} />
                    <VStack align="start" spacing={0} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium" fontSize="sm">
                          {watch('name') || 'Nombre de la ubicación'}
                        </Text>
                        {/* ✅ CORREGIDO: Mostrar badge solo si code tiene contenido real */}
                        {watch('code') && watch('code').trim() && (
                          <Badge colorScheme="green" variant="subtle" fontSize="xs">
                            {watch('code')}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {watch('description') || 'Descripción de la ubicación'}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </Box>

            <Divider />

            <HStack spacing={3} justify="flex-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                leftIcon={<Icon as={FiX} />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                isLoading={isLoading}
                loadingText={isEdit ? 'Actualizando...' : 'Creando...'}
                disabled={!canSubmit}
                leftIcon={<Icon as={FiCheck} />}
              >
                {isEdit ? 'Actualizar Ubicación' : 'Crear Ubicación'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}