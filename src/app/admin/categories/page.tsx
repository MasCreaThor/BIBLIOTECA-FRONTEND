// src/app/admin/categories/page.tsx
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
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiGrid, FiPlus, FiBarChart } from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CategoryList, CategoryForm } from '@/components/admin/categories';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { useCreateCategory, useUpdateCategory, useCategoryStats } from '@/hooks/useCategories';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/services/category.service';

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  // Estadísticas
  const { data: stats } = useCategoryStats();

  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    try {
      await createMutation.mutateAsync(data);
      onCreateClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleUpdateCategory = async (data: UpdateCategoryRequest) => {
    if (!editingCategory) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingCategory._id,
        data,
      });
      setEditingCategory(null);
      onEditClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setEditingCategory(null);
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
                  <Box p={2} bg="blue.50" borderRadius="lg">
                    <FiGrid size={24} color="#3182CE" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="gray.800">
                      Gestión de Categorías
                    </Heading>
                    <Text color="gray.600">
                      Organiza y clasifica los recursos de la biblioteca
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="lg"
                onClick={onCreateOpen}
                isDisabled={isMutating}
              >
                Nueva Categoría
              </Button>
            </HStack>
          </Box>

          {/* Estadísticas */}
          {stats && (
            <Box>
              <HStack justify="space-between" align="center" mb={4}>
                <Text fontWeight="medium" color="gray.700">
                  Estadísticas de Categorías
                </Text>
                <Icon as={FiBarChart} color="gray.500" />
              </HStack>
              
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Card size="sm">
                  <CardBody>
                    <Stat>
                      <StatLabel fontSize="xs">Total</StatLabel>
                      <StatNumber fontSize="2xl">{stats.total}</StatNumber>
                      <StatHelpText fontSize="xs">categorías registradas</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card size="sm">
                  <CardBody>
                    <Stat>
                      <StatLabel fontSize="xs">Activas</StatLabel>
                      <StatNumber fontSize="2xl" color="green.600">{stats.active}</StatNumber>
                      <StatHelpText fontSize="xs">en uso</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card size="sm">
                  <CardBody>
                    <Stat>
                      <StatLabel fontSize="xs">Inactivas</StatLabel>
                      <StatNumber fontSize="2xl" color="gray.500">{stats.inactive}</StatNumber>
                      <StatHelpText fontSize="xs">deshabilitadas</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card size="sm">
                  <CardBody>
                    <Stat>
                      <StatLabel fontSize="xs">Con Recursos</StatLabel>
                      <StatNumber fontSize="2xl" color="blue.600">
                        {Object.keys(stats.resourceCount).length}
                      </StatNumber>
                      <StatHelpText fontSize="xs">tienen recursos</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>
          )}

          {/* Lista de categorías */}
          <CategoryList
            onCategoryEdit={handleCategoryEdit}
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
                <Icon as={MdPalette} color="blue.500" />
                <Text>Nueva Categoría</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <CategoryForm
                onSubmit={handleCreateCategory}
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
                <Icon as={MdPalette} color="blue.500" />
                <Text>Editar Categoría</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {editingCategory && (
                <CategoryForm
                  category={editingCategory}
                  onSubmit={handleUpdateCategory}
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