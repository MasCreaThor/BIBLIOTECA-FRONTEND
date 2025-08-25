// src/components/resources/ResourceForm/QuickCategoryModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Box,
  Divider,
  Icon,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiCheck, FiX, FiGrid } from 'react-icons/fi';
import { useCreateCategory } from '@/hooks/useCategories';
import type { CreateCategoryRequest } from '@/hooks/useCategories';

// Schema de validación simplificado para creación rápida
const quickCategorySchema = z.object({
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
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un código hexadecimal válido')
    .default('#3182CE'),
});

type QuickCategoryFormData = z.infer<typeof quickCategorySchema>;

interface QuickCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (categoryId: string) => void;
}

// Colores predefinidos para categorías
const PREDEFINED_COLORS = [
  '#3182CE', '#38A169', '#E53E3E', '#9F7AEA', '#F56500',
  '#00B5D8', '#D69E2E', '#ED64A6', '#38B2AC', '#718096',
];

export function QuickCategoryModal({ 
  isOpen, 
  onClose, 
  onCategoryCreated 
}: QuickCategoryModalProps) {
  const toast = useToast();
  const [selectedColor, setSelectedColor] = useState('#3182CE');

  const form = useForm<QuickCategoryFormData>({
    resolver: zodResolver(quickCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3182CE',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, setValue, formState: { errors, isValid, isDirty } } = form;
  const createMutation = useCreateCategory();

  React.useEffect(() => {
    setValue('color', selectedColor, { shouldDirty: true, shouldValidate: true });
  }, [selectedColor, setValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const newCategory = await createMutation.mutateAsync(data);
      toast({
        title: 'Categoría creada',
        description: `Categoría "${newCategory.name}" creada exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCategoryCreated(newCategory._id);
      onClose();
      form.reset();
      setSelectedColor('#3182CE');
    } catch (error) {
      // Error manejado por el hook
    }
  });

  const canSubmit = isValid && isDirty && !createMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiGrid} color="blue.500" />
            <Text>Nueva Categoría Rápida</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleFormSubmit}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Crea una nueva categoría para organizar mejor tus recursos
                </Text>
              </Box>

              <Divider />

              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Nombre de la Categoría</FormLabel>
                  <Input
                    {...register('name')}
                    placeholder="Ej: Literatura, Ciencias, Historia..."
                    disabled={createMutation.isPending}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description} isRequired>
                  <FormLabel>Descripción</FormLabel>
                  <Input
                    {...register('description')}
                    placeholder="Describe brevemente qué incluye esta categoría"
                    disabled={createMutation.isPending}
                  />
                  <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Color de Identificación</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="md"
                        bg={selectedColor}
                        border="2px solid"
                        borderColor="gray.200"
                        cursor="pointer"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'color';
                          input.value = selectedColor;
                          input.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            setSelectedColor(target.value);
                          };
                          input.click();
                        }}
                      />
                      <Input
                        {...register('color')}
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        placeholder="#3182CE"
                        maxLength={7}
                        disabled={createMutation.isPending}
                      />
                    </HStack>

                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Colores sugeridos:
                      </Text>
                      <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                        {PREDEFINED_COLORS.map((color) => (
                          <GridItem key={color}>
                            <Box
                              w="30px"
                              h="30px"
                              borderRadius="md"
                              bg={color}
                              cursor="pointer"
                              border="2px solid"
                              borderColor={selectedColor === color ? 'blue.500' : 'gray.200'}
                              onClick={() => setSelectedColor(color)}
                              _hover={{ transform: 'scale(1.1)' }}
                              transition="all 0.2s"
                            />
                          </GridItem>
                        ))}
                      </Grid>
                    </Box>
                  </VStack>
                </FormControl>
              </VStack>

              <HStack spacing={3} justify="flex-end">
                <Button
                  leftIcon={<FiX />}
                  variant="outline"
                  onClick={onClose}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  leftIcon={<FiCheck />}
                  colorScheme="blue"
                  type="submit"
                  isLoading={createMutation.isPending}
                  loadingText="Creando..."
                  disabled={!canSubmit}
                >
                  Crear Categoría
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
