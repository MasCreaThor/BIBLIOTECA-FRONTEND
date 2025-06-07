// src/app/inventory/page.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiBook, FiPlus, FiDownload, FiSearch } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceList } from '@/components/resources/ResourceList/ResourceList';
import { ResourceForm } from '@/components/resources/ResourceForm/ResourceForm';
import { useCreateResource, useUpdateResource, useResourceTypes } from '@/hooks/useResources';
import type { Resource, CreateResourceRequest, UpdateResourceRequest } from '@/types/resource.types';
import { useState } from 'react';

export default function InventoryPage() {
  const router = useRouter();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Mutations
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();

  // Datos para estadísticas rápidas
  const { data: resourceTypes } = useResourceTypes();

  // Handler para crear recursos - ahora maneja ambos tipos
  const handleCreateResource = async (data: CreateResourceRequest | UpdateResourceRequest) => {
    try {
      // Como está en modo creación, sabemos que es CreateResourceRequest
      await createMutation.mutateAsync(data as CreateResourceRequest);
      onCreateClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // Handler para actualizar recursos - ahora maneja ambos tipos
  const handleUpdateResource = async (data: CreateResourceRequest | UpdateResourceRequest) => {
    if (!editingResource) return;
    
    try {
      // Como está en modo edición, sabemos que es UpdateResourceRequest
      await updateMutation.mutateAsync({
        id: editingResource._id,
        data: data as UpdateResourceRequest,
      });
      setEditingResource(null);
      onEditClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleResourceEdit = (resource: Resource) => {
    setEditingResource(resource);
    onEditOpen();
  };

  const handleNavigateToNew = () => {
    router.push('/inventory/new');
  };

  const handleNavigateToGoogleBooks = () => {
    router.push('/inventory/google-books');
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg="blue.50"
                  borderRadius="lg"
                >
                  <FiBook size={24} color="#3182CE" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="gray.800">
                    Gestión de Inventario
                  </Heading>
                  <Text color="gray.600">
                    Administra libros, juegos, mapas y otros recursos de la biblioteca
                  </Text>
                </VStack>
              </HStack>

              {/* Estadísticas rápidas */}
              {resourceTypes && resourceTypes.length > 0 && (
                <HStack spacing={3} pt={2}>
                  <Text fontSize="sm" color="gray.600">Tipos disponibles:</Text>
                  {resourceTypes.map((type) => (
                    <Badge key={type._id} colorScheme="blue" variant="subtle" px={2} py={1}>
                      {type.description}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>

            <VStack spacing={2} align="end">
              <HStack spacing={3}>
                <Button
                  leftIcon={<FiSearch />}
                  colorScheme="green"
                  variant="outline"
                  onClick={handleNavigateToGoogleBooks}
                >
                  Buscar en Google Books
                </Button>
                
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  size="lg"
                  onClick={handleNavigateToNew}
                >
                  Agregar Recurso
                </Button>
              </HStack>
              
              {/* Acción secundaria */}
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiDownload />}
                disabled
              >
                Exportar Inventario
              </Button>
            </VStack>
          </HStack>
        </Box>

        {/* Lista de recursos */}
        <ResourceList
          onResourceEdit={handleResourceEdit}
          onCreate={handleNavigateToNew}
          showActions={true}
        />
      </VStack>

      {/* Modal de creación rápida */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nuevo Recurso</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ResourceForm
              onSubmit={handleCreateResource}
              onCancel={onCreateClose}
              isLoading={createMutation.isPending}
              isEdit={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Recurso</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingResource && (
              <ResourceForm
                resource={editingResource}
                onSubmit={handleUpdateResource}
                onCancel={onEditClose}
                isLoading={updateMutation.isPending}
                isEdit={true}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}