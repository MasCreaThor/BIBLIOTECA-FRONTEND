// src/components/resources/ResourceForm/QuickPublisherModal.tsx
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
  Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiCheck, FiX, FiHome } from 'react-icons/fi';
import { useCreatePublisher } from '@/hooks/usePublishers';
import type { CreatePublisherRequest } from '@/hooks/usePublishers';

// Schema de validación simplificado para creación rápida
const quickPublisherSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .transform(val => val.trim()),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(300, 'La descripción no puede exceder 300 caracteres')
    .transform(val => val.trim())
    .optional(),
});

type QuickPublisherFormData = z.infer<typeof quickPublisherSchema>;

interface QuickPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublisherCreated: (publisherId: string) => void;
}

export function QuickPublisherModal({ 
  isOpen, 
  onClose, 
  onPublisherCreated 
}: QuickPublisherModalProps) {
  const toast = useToast();

  const form = useForm<QuickPublisherFormData>({
    resolver: zodResolver(quickPublisherSchema),
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, formState: { errors, isValid, isDirty } } = form;
  const createMutation = useCreatePublisher();

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const newPublisher = await createMutation.mutateAsync(data);
      toast({
        title: 'Editorial creada',
        description: `Editorial "${newPublisher.name}" creada exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPublisherCreated(newPublisher._id);
      onClose();
      form.reset();
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
            <Icon as={FiHome} color="blue.500" />
            <Text>Nueva Editorial Rápida</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleFormSubmit}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Crea una nueva editorial para organizar mejor tus recursos
                </Text>
              </Box>

              <Divider />

              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Nombre de la Editorial</FormLabel>
                  <Input
                    {...register('name')}
                    placeholder="Ej: Penguin Random House, HarperCollins..."
                    disabled={createMutation.isPending}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe brevemente la editorial o su especialidad"
                    rows={3}
                    resize="vertical"
                    disabled={createMutation.isPending}
                  />
                  <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
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
                  Crear Editorial
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
