// src/components/resources/ResourceForm/BasicInfoSection.tsx
'use client';

import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Box,
  Badge,
} from '@chakra-ui/react';
import { UseFormReturn, Controller } from 'react-hook-form';
import type { ResourceType, Category, Location, ResourceState } from '@/types/resource.types';

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
  resourceTypes: ResourceType[];
  categories: Category[];
  locations: Location[];
  resourceStates: ResourceState[];
}

const RESOURCE_TYPE_CONFIGS = {
  book: {
    label: '📚 Libro',
    color: 'blue',
    description: 'Libros de texto, novelas, ensayos, etc.',
  },
  game: {
    label: '🎲 Juego',
    color: 'green',
    description: 'Juegos educativos, de mesa, didácticos',
  },
  map: {
    label: '🗺️ Mapa',
    color: 'orange',
    description: 'Mapas geográficos, atlas, planos',
  },
  bible: {
    label: '📖 Biblia',
    color: 'purple',
    description: 'Biblias, textos religiosos',
  },
};

export function BasicInfoSection({
  form,
  resourceTypes,
  categories,
  locations,
  resourceStates,
}: BasicInfoSectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  
  const selectedTypeId = watch('typeId');
  const selectedType = resourceTypes.find(type => type._id === selectedTypeId);

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="medium" color="gray.700" fontSize="md">
        Información Básica
      </Text>

      {/* Título */}
      <FormControl isInvalid={!!errors.title} isRequired>
        <FormLabel>Título</FormLabel>
        <Input
          {...register('title')}
          placeholder="Ej: Cien años de soledad, Ajedrez para principiantes..."
          size="lg"
        />
        <FormErrorMessage>{errors.title?.message as string}</FormErrorMessage>
        <FormHelperText>
          Nombre completo y descriptivo del recurso
        </FormHelperText>
      </FormControl>

      {/* Tipo de recurso */}
      <FormControl isInvalid={!!errors.typeId} isRequired>
        <FormLabel>Tipo de Recurso</FormLabel>
        <Select
          {...register('typeId')}
          placeholder="Selecciona el tipo de recurso"
          size="lg"
        >
          {resourceTypes.map((type) => {
            const config = RESOURCE_TYPE_CONFIGS[type.name as keyof typeof RESOURCE_TYPE_CONFIGS] || {
              label: type.description,
              color: 'gray',
              description: '',
            };
            
            return (
              <option key={type._id} value={type._id}>
                {config.label}
              </option>
            );
          })}
        </Select>
        <FormErrorMessage>{errors.typeId?.message as string}</FormErrorMessage>
        {selectedType && (
          <Box mt={2}>
            <Badge 
              colorScheme={RESOURCE_TYPE_CONFIGS[selectedType.name as keyof typeof RESOURCE_TYPE_CONFIGS]?.color || 'gray'}
              variant="subtle"
            >
              {RESOURCE_TYPE_CONFIGS[selectedType.name as keyof typeof RESOURCE_TYPE_CONFIGS]?.description || selectedType.description}
            </Badge>
          </Box>
        )}
      </FormControl>

      <HStack spacing={4} align="start">
        {/* Categoría */}
        <FormControl isInvalid={!!errors.categoryId} isRequired flex={1}>
          <FormLabel>Categoría</FormLabel>
          <Select
            {...register('categoryId')}
            placeholder="Selecciona una categoría"
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.categoryId?.message as string}</FormErrorMessage>
        </FormControl>

        {/* Ubicación */}
        <FormControl isInvalid={!!errors.locationId} isRequired flex={1}>
          <FormLabel>Ubicación</FormLabel>
          <Select
            {...register('locationId')}
            placeholder="Selecciona una ubicación"
          >
            {locations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.locationId?.message as string}</FormErrorMessage>
        </FormControl>
      </HStack>

      <HStack spacing={4} align="start">
        {/* Estado */}
        <FormControl isInvalid={!!errors.stateId} isRequired flex={1}>
          <FormLabel>Estado del Recurso</FormLabel>
          <Select
            {...register('stateId')}
            placeholder="Selecciona el estado"
          >
            {resourceStates.map((state) => (
              <option key={state._id} value={state._id}>
                {state.description}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.stateId?.message as string}</FormErrorMessage>
        </FormControl>

        {/* Volúmenes/Cantidad */}
        <FormControl isInvalid={!!errors.volumes} flex={1}>
          <FormLabel>Volúmenes/Cantidad</FormLabel>
          <Controller
            name="volumes"
            control={control}
            render={({ field: { onChange, value } }) => (
              <NumberInput
                value={value || 1}
                onChange={(_, valueAsNumber) => onChange(valueAsNumber || 1)}
                min={1}
                max={100}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
          />
          <FormErrorMessage>{errors.volumes?.message as string}</FormErrorMessage>
          <FormHelperText>
            Número de copias o volúmenes disponibles
          </FormHelperText>
        </FormControl>
      </HStack>
    </VStack>
  );
}