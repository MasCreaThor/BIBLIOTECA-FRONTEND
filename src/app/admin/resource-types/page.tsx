// src/app/admin/resource-types/page.tsx
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
import { useState } from 'react';
import { FiBook, FiPlus } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceTypeList, ResourceTypeForm } from '@/components/admin/resourceTypes';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { 
  useCreateResourceType, 
  useUpdateResourceType 
} from '@/hooks/useResourceTypes';
import type { 
  ResourceType, 
  CreateResourceTypeRequest, 
  UpdateResourceTypeRequest 
} from '@/services/resourceType.service';

export default function ResourceTypesPage() {
  const [editingResourceType, setEditingResourceType] = useState<ResourceType | null>(null);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Mutations
  const createMutation = useCreateResourceType();
  const updateMutation = useUpdateResourceType();

  const handleCreateResourceType = async (data: CreateResourceTypeRequest) => {
    try {
      await createMutation.mutateAsync(data);
      onCreateClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleUpdateResourceType = async (data: UpdateResourceTypeRequest) => {
    if (!editingResourceType) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingResourceType._id,
        data,
      });
      setEditingResourceType(null);
      onEditClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleResourceTypeEdit = (resourceType: ResourceType) => {
    setEditingResourceType(resourceType);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setEditingResourceType(null);
    onEditClose();
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminRoute>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="start" mb={4}>
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Box p={2} bg="purple.50" borderRadius="lg">
                    <FiBook size={24} color="#9F7AEA" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="gray.800">
                      Gestión de Tipos de Recursos
                    </Heading>
                    <Text color="gray.600">
                      Configura los tipos principales de recursos de la biblioteca
                    </Text>
                  </VStack>
                </HStack>

                {/* Badge de sistema */}
                <Badge colorScheme="red" variant="solid" px={3} py={1}>
                  ⚙️ Configuración del Sistema
                </Badge>
              </VStack>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="purple"
                size="lg"
                onClick={onCreateOpen}
                isDisabled={isMutating}
              >
                Nuevo Tipo
              </Button>
            </HStack>
          </Box>

          {/* Lista de tipos de recursos */}
          <ResourceTypeList
            onResourceTypeEdit={handleResourceTypeEdit}
            showActions={true}
          />
        </VStack>

        {/* Modal de creación */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <Icon as={FiBook} color="purple.500" />
                <Text>Nuevo Tipo de Recurso</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <ResourceTypeForm
                onSubmit={handleCreateResourceType}
                onCancel={onCreateClose}
                isLoading={createMutation.isPending}
                isEdit={false}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de edición */}
        <Modal isOpen={isEditOpen} onClose={handleCloseEdit} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <Icon as={FiBook} color="purple.500" />
                <Text>Editar Tipo de Recurso</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {editingResourceType && (
                <ResourceTypeForm
                  resourceType={editingResourceType}
                  onSubmit={handleUpdateResourceType}
                  onCancel={handleCloseEdit}
                  isLoading={updateMutation.isPending}
                  isEdit={true}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </DashboardLayout>
    </AdminRoute>
  );
}