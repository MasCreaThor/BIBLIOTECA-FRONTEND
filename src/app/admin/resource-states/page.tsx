// src/app/admin/resource-states/page.tsx
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
import { FiCheckCircle, FiPlus } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceStateList, ResourceStateForm } from '@/components/admin/resourceStates';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { 
  useCreateResourceState, 
  useUpdateResourceState 
} from '@/hooks/useResourceStates';
import type { 
  ResourceState, 
  CreateResourceStateRequest, 
  UpdateResourceStateRequest 
} from '@/services/resourceState.service';

export default function ResourceStatesPage() {
  const [editingResourceState, setEditingResourceState] = useState<ResourceState | null>(null);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Mutations
  const createMutation = useCreateResourceState();
  const updateMutation = useUpdateResourceState();

  const handleCreateResourceState = async (data: CreateResourceStateRequest) => {
    try {
      await createMutation.mutateAsync(data);
      onCreateClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleUpdateResourceState = async (data: UpdateResourceStateRequest) => {
    if (!editingResourceState) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingResourceState._id,
        data,
      });
      setEditingResourceState(null);
      onEditClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleResourceStateEdit = (resourceState: ResourceState) => {
    setEditingResourceState(resourceState);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setEditingResourceState(null);
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
                  <Box p={2} bg="orange.50" borderRadius="lg">
                    <FiCheckCircle size={24} color="#FF9800" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="gray.800">
                      Gestión de Estados de Recursos
                    </Heading>
                    <Text color="gray.600">
                      Configura los estados de conservación de los recursos
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
                colorScheme="orange"
                size="lg"
                onClick={onCreateOpen}
                isDisabled={isMutating}
              >
                Nuevo Estado
              </Button>
            </HStack>
          </Box>

          {/* Lista de estados de recursos */}
          <ResourceStateList
            onResourceStateEdit={handleResourceStateEdit}
            onCreate={onCreateOpen}
            showActions={true}
          />
        </VStack>

        {/* Modal de creación */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} color="orange.500" />
                <Text>Nuevo Estado de Recurso</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <ResourceStateForm
                onSubmit={handleCreateResourceState}
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
                <Icon as={FiCheckCircle} color="orange.500" />
                <Text>Editar Estado de Recurso</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {editingResourceState && (
                <ResourceStateForm
                  resourceState={editingResourceState}
                  onSubmit={handleUpdateResourceState}
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