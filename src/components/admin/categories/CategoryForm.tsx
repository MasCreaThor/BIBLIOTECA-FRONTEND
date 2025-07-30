// src/components/admin/categories/CategoryForm.tsx
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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiCheck, FiX, FiGrid } from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/services/category.service';
import { useEffect, useState } from 'react';

// Schema de validación
const categorySchema = z.object({
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
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un código hexadecimal válido (ej: #FF5733)')
    .optional()
    .default('#3182CE'),
  active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Interfaces específicas para cada modo
interface CategoryFormCreateProps {
  category?: never;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: false;
}

interface CategoryFormEditProps {
  category: Category;
  onSubmit: (data: UpdateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit: true;
}

// Tipo union para las props
type CategoryFormProps = CategoryFormCreateProps | CategoryFormEditProps;

// Colores predefinidos para categorías
const PREDEFINED_COLORS = [
  '#3182CE', // Azul
  '#38A169', // Verde
  '#E53E3E', // Rojo
  '#9F7AEA', // Morado
  '#F56500', // Naranja
  '#00B5D8', // Cian
  '#D69E2E', // Amarillo
  '#ED64A6', // Rosa
  '#38B2AC', // Teal
  '#718096', // Gris
];

export function CategoryForm(props: CategoryFormProps) {
  const { onSubmit, onCancel, isLoading = false } = props;
  const category = 'category' in props ? props.category : undefined;
  const isEdit = 'isEdit' in props ? props.isEdit : false;

  // Estado local para el color
  const [selectedColor, setSelectedColor] = useState(category?.color || '#3182CE');

  // Configurar formulario
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || '#3182CE',
      active: category?.active ?? true,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid, isDirty } } = form;
  
  // Sincronizar el color del formulario con el estado local
  useEffect(() => {
    setValue('color', selectedColor, { shouldDirty: true, shouldValidate: true });
  }, [selectedColor, setValue]);

  // Debug: Log color changes
  useEffect(() => {
    console.log('Color seleccionado:', selectedColor);
  }, [selectedColor]);

  const handleFormSubmit = handleSubmit(async (data: CategoryFormData) => {
    const cleanData = {
      name: data.name,
      description: data.description,
      color: selectedColor, // Usar el estado local
      ...(isEdit && { active: data.active }),
    };

    if (isEdit) {
      await (onSubmit as (data: UpdateCategoryRequest) => Promise<void>)(cleanData);
    } else {
      // Para creación, omitir el campo active
      const { active, ...createData } = cleanData;
      await (onSubmit as (data: CreateCategoryRequest) => Promise<void>)(createData);
    }
  });

  const handleColorSelect = (color: string) => {
    console.log('Seleccionando color:', color);
    setSelectedColor(color);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    console.log('Cambio en input de color:', color);
    setSelectedColor(color);
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
                <Icon as={MdPalette} color="blue.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {isEdit 
                  ? 'Modifica la información de la categoría'
                  : 'Las categorías ayudan a organizar y clasificar los recursos de la biblioteca'
                }
              </Text>
            </Box>

            <Divider />

            {/* Información básica */}
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700" fontSize="md">
                Información Básica
              </Text>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!errors.name} isRequired>
                    <FormLabel>Nombre de la Categoría</FormLabel>
                    <Input
                      {...register('name')}
                      placeholder="Ej: Literatura, Ciencias, Historia..."
                      size="lg"
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                    <FormHelperText>
                      Nombre único y descriptivo para la categoría
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={!!errors.color}>
                    <FormLabel>Color Identificativo</FormLabel>
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2}>
                        <Input
                          type="color"
                          w="60px"
                          h="40px"
                          p={1}
                          borderRadius="md"
                          value={selectedColor}
                          onChange={handleColorInputChange}
                        />
                        <Input
                          placeholder="#3182CE"
                          flex={1}
                          value={selectedColor}
                          onChange={handleColorInputChange}
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
                      title={`Seleccionar ${color}`}
                    />
                  ))}
                </HStack>
              </Box>

              <FormControl isInvalid={!!errors.description} isRequired>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Describe qué tipo de recursos incluye esta categoría..."
                  rows={3}
                  resize="vertical"
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                <FormHelperText>
                  Explica qué recursos pertenecen a esta categoría
                </FormHelperText>
              </FormControl>

              {/* Campo de estado (solo para edición) */}
              {isEdit && (
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <FormLabel mb={0}>Estado de la Categoría</FormLabel>
                      <FormHelperText mt={0}>
                        Las categorías inactivas no aparecen en los formularios
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
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" fontSize="sm">
                        {watch('name') || 'Nombre de la categoría'}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {watch('description') || 'Descripción de la categoría'}
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
                colorScheme="blue"
                isLoading={isLoading}
                loadingText={isEdit ? 'Actualizando...' : 'Creando...'}
                disabled={!canSubmit}
                leftIcon={<Icon as={FiCheck} />}
              >
                {isEdit ? 'Actualizar Categoría' : 'Crear Categoría'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}