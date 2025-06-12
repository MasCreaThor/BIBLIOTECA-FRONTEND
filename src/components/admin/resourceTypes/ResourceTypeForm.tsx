// src/components/admin/resourceTypes/ResourceTypeForm.tsx - CORREGIDO
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
  Select,
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
  name: z.enum(['book', 'game', 'map', 'bible'], {
    errorMap: () => ({ message: 'Selecciona un tipo de recurso válido' })
  }),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(100, 'La descripción no puede exceder 100 caracteres')
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

const RESOURCE_TYPE_OPTIONS = [
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
      name: resourceType?.name || 'book',
      description: resourceType?.description || '',
      active: resourceType?.active ?? true,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState: { errors, isValid, isDirty } } = form;
  
  const selectedType = watch('name');
  const selectedTypeConfig = RESOURCE_TYPE_OPTIONS.find(opt => opt.value === selectedType);

  const handleFormSubmit = handleSubmit(async (data: ResourceTypeFormData) => {
    const cleanData = {
      name: data.name,
      description: data.description,
      ...(isEdit && { active: data.active }),
    };

    if (isEdit) {
      // Para edición, solo enviar descripción y estado activo
      const updateData: UpdateResourceTypeRequest = {
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
                  ? 'Modifica la descripción del tipo de recurso'
                  : 'Los tipos de recursos definen las categorías principales de materiales en la biblioteca'
                }
              </Text>
            </Box>

            <Divider />

            {/* Información sobre sistema */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  Configuración del Sistema
                </Text>
                <Text fontSize="xs">
                  Los tipos de recursos son configuraciones fundamentales. 
                  {isEdit 
                    ? ' Solo puedes modificar la descripción y el estado.'
                    : ' Selecciona el tipo apropiado y personaliza su descripción.'
                  }
                </Text>
              </Box>
            </Alert>

            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información del Tipo
              </Text>

              {/* Tipo de recurso (solo para crear) */}
              {!isEdit && (
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Tipo de Recurso</FormLabel>
                  <Select
                    {...register('name')}
                    size="lg"
                  >
                    {RESOURCE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  <FormHelperText>
                    Selecciona el tipo de recurso que quieres configurar
                  </FormHelperText>
                </FormControl>
              )}

              {/* Mostrar tipo actual si es edición - CORREGIDO */}
              {isEdit && selectedTypeConfig && (
                <FormControl>
                  <FormLabel>Tipo de Recurso (No editable)</FormLabel>
                  <HStack spacing={3} p={3} bg="gray.50" borderRadius="md">
                    <Badge colorScheme={selectedTypeConfig.color} variant="solid">
                      {selectedTypeConfig.label}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {selectedTypeConfig.description}
                    </Text>
                  </HStack>
                  <FormHelperText>
                    El tipo no se puede cambiar una vez creado
                  </FormHelperText>
                </FormControl>
              )}

              {/* Descripción personalizada */}
              <FormControl isInvalid={!!errors.description} isRequired>
                <FormLabel>Descripción Personalizada</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder={selectedTypeConfig?.description || 'Describe este tipo de recurso...'}
                  rows={3}
                  resize="vertical"
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                <FormHelperText>
                  Personaliza la descripción que aparecerá en el sistema
                </FormHelperText>
              </FormControl>

              {/* Estado (solo para edición) */}
              {isEdit && (
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <FormLabel mb={0}>Estado del Tipo</FormLabel>
                      <FormHelperText mt={0}>
                        Los tipos inactivos no aparecen en los formularios
                      </FormHelperText>
                    </VStack>
                    <Switch
                      {...register('active')}
                      colorScheme="purple"
                      size="lg"
                    />
                  </HStack>
                </FormControl>
              )}
            </VStack>

            {/* Preview */}
            <Box>
              <Text fontWeight="medium" color="gray.700" fontSize="md" mb={3}>
                Vista Previa
              </Text>
              <Card bg="gray.50" size="sm">
                <CardBody>
                  <HStack spacing={3}>
                    <Text fontSize="lg">
                      {selectedTypeConfig?.label.split(' ')[0] || '📄'}
                    </Text>
                    <VStack align="start" spacing={0} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium" fontSize="sm">
                          {selectedTypeConfig?.label || 'Tipo de Recurso'}
                        </Text>
                        <Badge 
                          colorScheme={selectedTypeConfig?.color || 'gray'} 
                          variant="subtle" 
                          fontSize="xs"
                        >
                          {selectedType}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {watch('description') || 'Descripción del tipo de recurso'}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </Box>

            <Divider />

            {/* Botones de acción */}
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
                colorScheme="purple"
                isLoading={isLoading}
                loadingText={isEdit ? 'Actualizando...' : 'Creando...'}
                disabled={!canSubmit}
                leftIcon={<Icon as={FiCheck} />}
              >
                {isEdit ? 'Actualizar Tipo' : 'Crear Tipo'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}