// src/app/inventory/page.tsx - VERSIÓN ACTUALIZADA
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiBook, FiPlus, FiDownload, FiSearch, FiGrid, FiSettings } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceList } from '@/components/resources/ResourceList/ResourceList';
import { ResourceForm } from '@/components/resources/ResourceForm/ResourceForm';
import { InventoryNavigation } from '@/components/inventory/InventoryNavigation';
import { useCreateResource, useUpdateResource, useResourceTypes } from '@/hooks/useResources';
import type { Resource, CreateResourceRequest, UpdateResourceRequest } from '@/types/resource.types';
import { useState } from 'react';

export default function InventoryPage() {
  const router = useRouter();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Mutations
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();

  // Datos para estadísticas rápidas
  const { data: resourceTypesResponse } = useResourceTypes();
  const resourceTypes = resourceTypesResponse?.data || [];

  // Determinar si mostrar vista compacta en móvil
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Handler para crear recursos - ahora maneja ambos tipos
  const handleCreateResource = async (data: CreateResourceRequest | UpdateResourceRequest) => {
    try {
      await createMutation.mutateAsync(data as CreateResourceRequest);
      onCreateClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // Handler para actualizar recursos
  const handleUpdateResource = async (data: CreateResourceRequest | UpdateResourceRequest) => {
    if (!editingResource) return;
    
    try {
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

  // ✅ NUEVO: Handler para navegar a la página de detalles del recurso
  const handleResourceSelect = (resource: Resource) => {
    router.push(`/inventory/${resource._id}`);
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
              {resourceTypes.length > 0 && (
                <HStack spacing={3} pt={2} wrap="wrap">
                  <Text fontSize="sm" color="gray.600">Tipos disponibles:</Text>
                  {resourceTypes.map((type) => (
                    <Badge key={type._id} colorScheme="blue" variant="subtle" px={2} py={1}>
                      {type.description}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>

            {/* Acciones rápidas en escritorio */}
            {!isMobile && (
              <VStack spacing={2} align="end">
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiSearch />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => router.push('/inventory/google-books')}
                  >
                    Google Books
                  </Button>
                  
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    size="lg"
                    onClick={() => router.push('/inventory/new')}
                  >
                    Agregar Recurso
                  </Button>
                </HStack>
              </VStack>
            )}
          </HStack>
        </Box>

        {/* Contenido principal con tabs */}
        <Tabs 
          index={activeTab} 
          onChange={setActiveTab} 
          colorScheme="blue"
          variant="enclosed"
        >
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiGrid} boxSize={4} />
                <Text fontSize="sm">Inventario</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: Lista de recursos */}
            <TabPanel px={0}>
              <ResourceList
                onResourceEdit={handleResourceEdit}
                onResourceSelect={handleResourceSelect}
                onCreate={() => router.push('/inventory/new')}
                showActions={true}
              />
            </TabPanel>

            {/* Tab 2: Navegación y acciones rápidas */}
            <TabPanel px={0}>
              <InventoryNavigation 
                showSecondaryActions={true}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Navegación móvil */}
        {isMobile && activeTab === 0 && (
          <Box position="fixed" bottom={4} left={4} right={4} zIndex={10}>
            <HStack spacing={2} justify="center">
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="md"
                onClick={() => router.push('/inventory/new')}
                shadow="lg"
              >
                Agregar
              </Button>
              <Button
                leftIcon={<FiSearch />}
                colorScheme="green"
                variant="outline"
                size="md"
                onClick={() => router.push('/inventory/google-books')}
                shadow="lg"
                bg="white"
              >
                Google Books
              </Button>
            </HStack>
          </Box>
        )}
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