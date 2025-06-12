// src/components/admin/resourceStates/ResourceStateForm.tsx
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
import { FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import type { 
  ResourceState, 
  CreateResourceStateRequest, 
  UpdateResourceStateRequest 
} from '@/services/resourceState.service';

const resourceStateSchema = z.object({
  name: z.enum(['good', 'deteriorated', 'damaged', 'lost'], {
    errorMap: () => ({ message: 'Selecciona un estado de recurso válido' })
  }),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(100, 'La descripción no puede exceder 100 caracteres')
    .transform(val => val.trim()),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un código hexadecimal válido (ej: #4CAF50)')
    .optional()
    .default('#4CAF50'),
  active: z.boolean().default(true),
});

type ResourceStateFormData = z.infer<typeof resourceStateSchema>;

interface ResourceStateFormCreateProps {
  resourceState?: never;
  onSubmit: (data: CreateResourceStateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: false;
}

interface ResourceStateFormEditProps {
  resourceState: ResourceState;
  onSubmit: (data: UpdateResourceStateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit: true;
}

type ResourceStateFormProps = ResourceStateFormCreateProps | ResourceStateFormEditProps;

const RESOURCE_STATE_OPTIONS = [
  {
    value: 'good',
    label: '✅ Buen Estado',
    description: 'El recurso está en perfectas condiciones',
    color: '#4CAF50',
    colorScheme: 'green'
  },
  {
    value: 'deteriorated',
    label: '⚠️ Deteriorado',
    description: 'El recurso muestra signos de desgaste pero es usable',
    color: '#FF9800',
    colorScheme: 'orange'
  },
  {
    value: 'damaged',
    label: '❌ Dañado',
    description: 'El recurso tiene daños significativos',
    color: '#F44336',
    colorScheme: 'red'
  },
  {
    value: 'lost',
    label: '🔍 Perdido',
    description: 'El recurso no se encuentra disponible',
    color: '#9E9E9E',
    colorScheme: 'gray'
  },
] as const;

// Colores predefinidos para estados
const PREDEFINED_COLORS = [
  '#4CAF50', // Verde - Buen estado
  '#FF9800', // Naranja - Deteriorado
  '#F44336', // Rojo - Dañado
  '#9E9E9E', // Gris - Perdido
  '#2196F3', // Azul
  '#9C27B0', // Morado
  '#607D8B', // Azul gris
  '#795548', // Marrón
];

export function ResourceStateForm(props: ResourceStateFormProps) {
  const { onSubmit, onCancel, isLoading = false } = props;
  const resourceState = 'resourceState' in props ? props.resourceState : undefined;
  const isEdit = 'isEdit' in props ? props.isEdit : false;

  const form = useForm<ResourceStateFormData>({
    resolver: zodResolver(resourceStateSchema),
    defaultValues: {
      name: resourceState?.name || 'good',
      description: resourceState?.description || '',
      color: resourceState?.color || '#4CAF50',
      active: resourceState?.active ?? true,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid, isDirty } } = form;
  
  const selectedState = watch('name');
  const selectedColor = watch('color');
  const selectedStateConfig = RESOURCE_STATE_OPTIONS.find(opt => opt.value === selectedState);

  const handleFormSubmit = handleSubmit(async (data: ResourceStateFormData) => {
    const cleanData = {
      name: data.name,
      description: data.description,
      color: data.color,
      ...(isEdit && { active: data.active }),
    };

    if (isEdit) {
      // Para edición, solo enviar descripción, color y estado activo
      const updateData: UpdateResourceStateRequest = {
        description: cleanData.description,
        color: cleanData.color,
        active: cleanData.active,
      };
      await (onSubmit as (data: UpdateResourceStateRequest) => Promise<void>)(updateData);
    } else {
      // Para creación, enviar nombre, descripción y color
      const createData: CreateResourceStateRequest = {
        name: cleanData.name,
        description: cleanData.description,
        color: cleanData.color,
      };
      await (onSubmit as (data: CreateResourceStateRequest) => Promise<void>)(createData);
    }
  });

  const handleColorSelect = (color: string) => {
    setValue('color', color, { shouldDirty: true, shouldValidate: true });
  };

  const canSubmit = isValid && isDirty;

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleFormSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={FiCheckCircle} color="orange.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {isEdit ? 'Editar Estado de Recurso' : 'Nuevo Estado de Recurso'}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {isEdit 
                  ? 'Modifica la información del estado de recurso'
                  : 'Los estados de recursos indican la condición física de los materiales'
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
                  Los estados de recursos son configuraciones fundamentales para el control de inventario.
                  {isEdit 
                    ? ' Solo puedes modificar la descripción, color y el estado.'
                    : ' Selecciona el estado apropiado y personaliza su descripción.'
                  }
                </Text>
              </Box>
            </Alert>

            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información del Estado
              </Text>

              {/* Estado de recurso (solo para crear) */}
              {!isEdit && (
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Estado de Recurso</FormLabel>
                  <Select
                    {...register('name')}
                    size="lg"
                    onChange={(e) => {
                      // Auto-seleccionar color apropiado cuando cambia el estado
                      const selectedOption = RESOURCE_STATE_OPTIONS.find(opt => opt.value === e.target.value);
                      if (selectedOption) {
                        setValue('color', selectedOption.color, { shouldDirty: true });
                      }
                    }}
                  >
                    {RESOURCE_STATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  <FormHelperText>
                    Selecciona el estado de conservación que quieres configurar
                  </FormHelperText>
                </FormControl>
              )}

              {/* Mostrar estado actual si es edición */}
              {isEdit && selectedStateConfig && (
                <Box>
                  <FormLabel>Estado de Recurso (No editable)</FormLabel>
                  <HStack spacing={3} p={3} bg="gray.50" borderRadius="md">
                    <Badge colorScheme={selectedStateConfig.colorScheme} variant="solid">
                      {selectedStateConfig.label}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {selectedStateConfig.description}
                    </Text>
                  </HStack>
                  <FormHelperText>
                    El estado no se puede cambiar una vez creado
                  </FormHelperText>
                </Box>
              )}

              <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4}>
                <GridItem>
                  {/* Descripción personalizada */}
                  <FormControl isInvalid={!!errors.description} isRequired>
                    <FormLabel>Descripción Personalizada</FormLabel>
                    <Textarea
                      {...register('description')}
                      placeholder={selectedStateConfig?.description || 'Describe este estado de recurso...'}
                      rows={3}
                      resize="vertical"
                    />
                    <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                    <FormHelperText>
                      Personaliza la descripción que aparecerá en el sistema
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                <GridItem>
                  {/* Color identificativo */}
                  <FormControl isInvalid={!!errors.color}>
                    <FormLabel>Color Identificativo</FormLabel>
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2}>
                        <Box
                          w="60px"
                          h="40px"
                          bg={selectedColor}
                          borderRadius="md"
                          border="2px solid"
                          borderColor="gray.200"
                          flexShrink={0}
                        />
                        <input
                          {...register('color')}
                          type="color"
                          style={{
                            width: '60px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </HStack>
                      <FormErrorMessage>{errors.color?.message}</FormErrorMessage>
                    </VStack>
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Colores predefinidos */}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Colores sugeridos:
                </Text>
                <HStack spacing={2} wrap="wrap">
                  {PREDEFINED_COLORS.map((color) => (
                    <Box
                      key={color}
                      w={8}
                      h={8}
                      bg={color}
                      borderRadius="md"
                      cursor="pointer"
                      border={selectedColor === color ? '3px solid' : '2px solid'}
                      borderColor={selectedColor === color ? 'gray.800' : 'gray.200'}
                      _hover={{ transform: 'scale(1.1)' }}
                      transition="all 0.2s"
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </HStack>
              </Box>

              {/* Estado (solo para edición) */}
              {isEdit && (
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <FormLabel mb={0}>Estado del Estado</FormLabel>
                      <FormHelperText mt={0}>
                        Los estados inactivos no aparecen en los formularios
                      </FormHelperText>
                    </VStack>
                    <Switch
                      {...register('active')}
                      colorScheme="orange"
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
                    <Box
                      w={4}
                      h={4}
                      borderRadius="full"
                      bg={selectedColor}
                      flexShrink={0}
                    />
                    <VStack align="start" spacing={0} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium" fontSize="sm">
                          {selectedStateConfig?.label || 'Estado de Recurso'}
                        </Text>
                        <Badge 
                          colorScheme={selectedStateConfig?.colorScheme || 'gray'} 
                          variant="subtle" 
                          fontSize="xs"
                        >
                          {selectedState}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {watch('description') || 'Descripción del estado de recurso'}
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
                colorScheme="orange"
                isLoading={isLoading}
                loadingText={isEdit ? 'Actualizando...' : 'Creando...'}
                disabled={!canSubmit}
                leftIcon={<Icon as={FiCheck} />}
              >
                {isEdit ? 'Actualizar Estado' : 'Crear Estado'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}