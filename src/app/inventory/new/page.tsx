// src/app/inventory/new/page.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiBook, FiSearch } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceForm } from '@/components/resources/ResourceForm/ResourceForm';
import { useCreateResource } from '@/hooks/useResources';
import type { CreateResourceRequest, UpdateResourceRequest } from '@/types/resource.types';

export default function NewResourcePage() {
  const router = useRouter();
  const toast = useToast();
  const createMutation = useCreateResource();

  const handleCreateResource = async (data: CreateResourceRequest) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: 'Recurso creado',
        description: 'El recurso se ha creado exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/inventory');
    } catch (error) {
      toast({
        title: 'Error al crear el recurso',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    router.push('/inventory');
  };

  const handleNavigateToGoogleBooks = () => {
    router.push('/inventory/google-books');
  };

  return (
    <DashboardLayout>
      <VStack spacing={6} align="stretch">
        {/* Navegación */}
        <Box>
          <Breadcrumb spacing={2} fontSize="sm" color="gray.600">
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory">Inventario</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <Text>Agregar Recurso</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>

        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Box p={2} bg="blue.50" borderRadius="lg">
                  <FiBook size={24} color="#3182CE" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="gray.800">
                    Agregar Nuevo Recurso
                  </Heading>
                  <Text color="gray.600">
                    Registra libros, juegos, mapas y otros recursos manualmente
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <VStack spacing={2} align="end">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                onClick={handleCancel}
                size="sm"
              >
                Volver a Inventario
              </Button>
            </VStack>
          </HStack>

          {/* Opciones alternativas */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="sm" fontWeight="medium">
                ¿Registrando un libro?
              </Text>
              <Text fontSize="sm">
                Puedes usar la búsqueda en Google Books para autocompletar la información automáticamente.
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                leftIcon={<FiSearch />}
                onClick={handleNavigateToGoogleBooks}
              >
                Buscar en Google Books
              </Button>
            </VStack>
          </Alert>
        </Box>

        {/* Formulario */}
        <ResourceForm
          onSubmit={handleCreateResource as (data: UpdateResourceRequest) => Promise<void>}
          isSubmitting={createMutation.isPending}
        />
      </VStack>
    </DashboardLayout>
  );
}