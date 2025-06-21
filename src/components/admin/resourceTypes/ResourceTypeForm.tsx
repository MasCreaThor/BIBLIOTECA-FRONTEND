// src/components/admin/resourceTypes/ResourceTypeForm.tsx - ACTUALIZADO PARA TIPOS PERSONALIZADOS
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
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiCheck, FiX, FiBook } from 'react-icons/fi';
import type { 
  ResourceType, 
  CreateResourceTypeRequest, 
  UpdateResourceTypeRequest 
} from '@/services/resourceType.service';

const resourceTypeSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .transform(val => val.trim().toLowerCase()),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .transform(val => val.trim()),
  active: z.boolean().default(true),
});

type ResourceTypeFormData = z.infer<typeof resourceTypeSchema>;

interface ResourceTypeFormCreateProps {
  resourceType?: never;
  onSubmit: (data: CreateResourceTypeRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: false;
}

interface ResourceTypeFormEditProps {
  resourceType: ResourceType;
  onSubmit: (data: UpdateResourceTypeRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit: true;
}

type ResourceTypeFormProps = ResourceTypeFormCreateProps | ResourceTypeFormEditProps;

// ✅ TIPOS PREDEFINIDOS DEL SISTEMA PARA REFERENCIA
const SYSTEM_RESOURCE_TYPES = [
  {
    value: 'book',
    label: '📚 Libros',
    description: 'Libros de texto, novelas, ensayos, literatura, etc.',
    color: 'blue'
  },
  {
    value: 'game',
    label: '🎲 Juegos',
    description: 'Juegos educativos, de mesa, didácticos, lúdicos',
    color: 'green'
  },
  {
    value: 'map',
    label: '🗺️ Mapas',
    description: 'Mapas geográficos, atlas, planos, cartografía',
    color: 'orange'
  },
  {
    value: 'bible',
    label: '📖 Biblias',
    description: 'Biblias, textos religiosos, estudios bíblicos',
    color: 'purple'
  },
] as const;

export function ResourceTypeForm(props: ResourceTypeFormProps) {
  const { onSubmit, onCancel, isLoading = false } = props;
  const resourceType = 'resourceType' in props ? props.resourceType : undefined;
  const isEdit = 'isEdit' in props ? props.isEdit : false;

  const form = useForm<ResourceTypeFormData>({
    resolver: zodResolver(resourceTypeSchema),
    defaultValues: {
      name: resourceType?.name || '',
      description: resourceType?.description || '',
      active: resourceType?.active ?? true,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState: { errors, isValid, isDirty } } = form;
  
  const selectedName = watch('name');
  const isSystemType = resourceType?.isSystem || SYSTEM_RESOURCE_TYPES.some(type => type.value === selectedName);

  const handleFormSubmit = handleSubmit(async (data: ResourceTypeFormData) => {
    const cleanData = {
      name: data.name,
      description: data.description,
      ...(isEdit && { active: data.active }),
    };

    if (isEdit) {
      // Para edición, permitir cambiar nombre, descripción y estado activo
      const updateData: UpdateResourceTypeRequest = {
        name: cleanData.name,
        description: cleanData.description,
        active: cleanData.active,
      };
      await (onSubmit as (data: UpdateResourceTypeRequest) => Promise<void>)(updateData);
    } else {
      // Para creación, enviar nombre y descripción
      const createData: CreateResourceTypeRequest = {
        name: cleanData.name,
        description: cleanData.description,
      };
      await (onSubmit as (data: CreateResourceTypeRequest) => Promise<void>)(createData);
    }
  });

  const canSubmit = isValid && isDirty;

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleFormSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={FiBook} color="purple.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {isEdit ? 'Editar Tipo de Recurso' : 'Nuevo Tipo de Recurso'}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {isEdit 
                  ? 'Modifica la información del tipo de recurso'
                  : 'Crea un nuevo tipo de recurso para categorizar los materiales de la biblioteca'
                }
              </Text>
            </Box>

            <Divider />

            {/* Información sobre tipos del sistema */}
            {isSystemType && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Tipo del Sistema
                  </Text>
                  <Text fontSize="xs">
                    Este es un tipo de recurso predefinido del sistema. 
                    {isEdit && ' Solo puedes modificar la descripción y el estado activo.'}
                  </Text>
                </Box>
              </Alert>
            )}

            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información del Tipo
              </Text>

              {/* Nombre del tipo de recurso */}
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Nombre del Tipo</FormLabel>
                <Input
                  {...register('name')}
                  placeholder="Ej: revista, dvd, cd, revista, etc."
                  size="lg"
                  isDisabled={isEdit && isSystemType}
                />
                <FormHelperText>
                  {isEdit && isSystemType 
                    ? 'No se puede cambiar el nombre de un tipo del sistema'
                    : 'Ingresa un nombre corto y descriptivo (ej: revista, dvd, cd)'
                  }
                </FormHelperText>
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* Descripción */}
              <FormControl isInvalid={!!errors.description} isRequired>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Describe brevemente este tipo de recurso..."
                  size="lg"
                  rows={3}
                />
                <FormHelperText>
                  Explica qué tipo de materiales incluye esta categoría
                </FormHelperText>
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>

              {/* Estado activo (solo para edición) */}
              {isEdit && (
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <HStack spacing={4}>
                    <Switch
                      {...register('active')}
                      colorScheme="green"
                      size="lg"
                    />
                    <Text fontSize="sm" color="gray.600">
                      {watch('active') ? 'Activo' : 'Inactivo'}
                    </Text>
                  </HStack>
                  <FormHelperText>
                    Los tipos inactivos no aparecerán en las listas de selección
                  </FormHelperText>
                </FormControl>
              )}
            </VStack>

            <Divider />

            {/* Tipos predefinidos del sistema (solo para referencia) */}
            {!isEdit && (
              <Box>
                <Text fontWeight="medium" color="gray.700" fontSize="md" mb={3}>
                  Tipos Predefinidos del Sistema
                </Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Estos tipos ya están disponibles automáticamente:
                </Text>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
                  {SYSTEM_RESOURCE_TYPES.map((type) => (
                    <GridItem key={type.value}>
                      <Box
                        p={3}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="gray.50"
                      >
                        <HStack spacing={2} mb={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {type.label}
                          </Text>
                          <Badge colorScheme="blue" size="sm">Sistema</Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          {type.description}
                        </Text>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            )}

            <Divider />

            {/* Botones de acción */}
            <HStack spacing={3} justify="flex-end">
              <Button
                onClick={onCancel}
                variant="outline"
                leftIcon={<FiX />}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="purple"
                leftIcon={<FiCheck />}
                isLoading={isLoading}
                loadingText="Guardando..."
                isDisabled={!canSubmit}
              >
                {isEdit ? 'Actualizar' : 'Crear'} Tipo
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}