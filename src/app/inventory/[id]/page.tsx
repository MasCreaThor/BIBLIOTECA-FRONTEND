// src/app/inventory/[id]/page.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiToggleLeft, FiToggleRight, FiTrash2, FiBook, FiCalendar, FiMapPin, FiUser } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceForm } from '@/components/resources/ResourceForm/ResourceForm';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DateUtils } from '@/utils';
import { useResource, useUpdateResource, useUpdateResourceAvailability, useDeleteResource } from '@/hooks/useResources';
import type { UpdateResourceRequest } from '@/types/resource.types';

const RESOURCE_TYPE_CONFIGS = {
  book: { icon: '📚', label: 'Libro', color: 'blue' },
  game: { icon: '🎲', label: 'Juego', color: 'green' },
  map: { icon: '🗺️', label: 'Mapa', color: 'orange' },
  bible: { icon: '📖', label: 'Biblia', color: 'purple' },
};

const RESOURCE_STATE_CONFIGS = {
  good: { label: 'Buen estado', color: 'green' },
  deteriorated: { label: 'Deteriorado', color: 'yellow' },
  damaged: { label: 'Dañado', color: 'orange' },
  lost: { label: 'Perdido', color: 'red' },
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  // Modales
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Queries y mutations
  const { data: resource, isLoading, error, refetch } = useResource(resourceId);
  const updateMutation = useUpdateResource();
  const updateAvailabilityMutation = useUpdateResourceAvailability();
  const deleteMutation = useDeleteResource();

  const handleUpdateResource = async (data: UpdateResourceRequest) => {
    try {
      await updateMutation.mutateAsync({ id: resourceId, data });
      onEditClose();
      refetch();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleToggleAvailability = async () => {
    if (!resource) return;
    
    try {
      await updateAvailabilityMutation.mutateAsync({
        id: resourceId,
        available: !resource.available,
      });
      refetch();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleDeleteResource = async () => {
    try {
      await deleteMutation.mutateAsync(resourceId);
      router.push('/inventory');
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleNavigateBack = () => {
    router.push('/inventory');
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          <Skeleton height="24px" width="300px" />
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <SkeletonText noOfLines={3} spacing={4} />
                <Divider />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <SkeletonText noOfLines={4} spacing={2} />
                  <SkeletonText noOfLines={4} spacing={2} />
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <DashboardLayout>
        <VStack spacing={6} align="center" py={20}>
          <Alert status="error" borderRadius="lg" maxW="md">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="medium">Recurso no encontrado</Text>
              <Text fontSize="sm">El recurso que buscas no existe o ha sido eliminado.</Text>
            </VStack>
          </Alert>
          <Button leftIcon={<FiArrowLeft />} onClick={handleNavigateBack}>
            Volver al Inventario
          </Button>
        </VStack>
      </DashboardLayout>
    );
  }

  // Configuración del tipo de recurso
  const typeConfig = resource.type 
    ? RESOURCE_TYPE_CONFIGS[resource.type.name as keyof typeof RESOURCE_TYPE_CONFIGS]
    : { icon: '📄', label: 'Recurso', color: 'gray' };

  // Configuración del estado
  const stateConfig = resource.state
    ? RESOURCE_STATE_CONFIGS[resource.state.name as keyof typeof RESOURCE_STATE_CONFIGS]
    : { label: 'Estado desconocido', color: 'gray' };

  // Información de autores
  const authorsText = resource.authors && resource.authors.length > 0
    ? resource.authors.map(author => author.name).join(', ')
    : 'Sin autor especificado';

  const isMutating = updateMutation.isPending || 
                   updateAvailabilityMutation.isPending || 
                   deleteMutation.isPending;

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
              <Text>{resource.title}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>

        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={3}>
              {/* Título y tipo */}
              <HStack spacing={3}>
                <Box p={2} bg={`${typeConfig.color}.50`} borderRadius="lg">
                  <Text fontSize="2xl">{typeConfig.icon}</Text>
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800" lineHeight="short">
                    {resource.title}
                  </Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme={typeConfig.color} variant="solid">
                      {typeConfig.label}
                    </Badge>
                    <Badge
                      colorScheme={resource.available ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {resource.available ? 'Disponible' : 'Prestado'}
                    </Badge>
                    <Badge colorScheme={stateConfig.color} variant="outline">
                      {stateConfig.label}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

              {/* Información básica */}
              <Text color="gray.600" fontSize="lg">
                {authorsText}
              </Text>
            </VStack>

            {/* Acciones */}
            <VStack spacing={2} align="end">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                onClick={handleNavigateBack}
                size="sm"
              >
                Volver
              </Button>
            </VStack>
          </HStack>
        </Box>

        {/* Acciones principales */}
        <HStack spacing={3} wrap="wrap">
          <Button
            leftIcon={<FiEdit />}
            colorScheme="blue"
            onClick={onEditOpen}
            isDisabled={isMutating}
          >
            Editar Recurso
          </Button>
          
          <Button
            leftIcon={resource.available ? <FiToggleLeft /> : <FiToggleRight />}
            colorScheme={resource.available ? 'orange' : 'green'}
            variant="outline"
            onClick={handleToggleAvailability}
            isLoading={updateAvailabilityMutation.isPending}
            loadingText="Actualizando..."
            isDisabled={isMutating}
          >
            {resource.available ? 'Marcar como Prestado' : 'Marcar como Disponible'}
          </Button>
          
          <Button
            leftIcon={<FiTrash2 />}
            colorScheme="red"
            variant="outline"
            onClick={onDeleteOpen}
            isDisabled={isMutating}
          >
            Eliminar
          </Button>
        </HStack>

        {/* Información detallada */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Información bibliográfica */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold" color="gray.700">
                  Información Bibliográfica
                </Text>
                
                <VStack spacing={3} align="stretch">
                  {resource.authors && resource.authors.length > 0 && (
                    <HStack spacing={2}>
                      <FiUser size={16} color="#718096" />
                      <Text fontSize="sm" color="gray.600">Autores:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {resource.authors.map(author => author.name).join(', ')}
                      </Text>
                    </HStack>
                  )}

                  {resource.publisher && (
                    <HStack spacing={2}>
                      <FiBook size={16} color="#718096" />
                      <Text fontSize="sm" color="gray.600">Editorial:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {resource.publisher.name}
                      </Text>
                    </HStack>
                  )}

                  {resource.isbn && (
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">ISBN:</Text>
                      <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
                        {resource.isbn}
                      </Text>
                    </HStack>
                  )}

                  {resource.volumes && resource.volumes > 1 && (
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">Volúmenes:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {resource.volumes}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Información del sistema */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold" color="gray.700">
                  Información del Sistema
                </Text>
                
                <VStack spacing={3} align="stretch">
                  {resource.category && (
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">Categoría:</Text>
                      <Badge colorScheme="blue" variant="subtle">
                        {resource.category.name}
                      </Badge>
                    </HStack>
                  )}

                  {resource.location && (
                    <HStack spacing={2}>
                      <FiMapPin size={16} color="#718096" />
                      <Text fontSize="sm" color="gray.600">Ubicación:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {resource.location.name}
                      </Text>
                    </HStack>
                  )}

                  <HStack spacing={2}>
                    <FiCalendar size={16} color="#718096" />
                    <Text fontSize="sm" color="gray.600">Registrado:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {DateUtils.formatDate(resource.createdAt)}
                    </Text>
                  </HStack>

                  {resource.updatedAt !== resource.createdAt && (
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">Última actualización:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {DateUtils.formatRelative(resource.updatedAt)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Notas */}
        {resource.notes && (
          <Card>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text fontWeight="semibold" color="gray.700">
                  Notas y Observaciones
                </Text>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  {resource.notes}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Modal de edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Recurso</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ResourceForm
              resource={resource}
              onSubmit={handleUpdateResource}
              onCancel={onEditClose}
              isLoading={updateMutation.isPending}
              isEdit={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Dialog de confirmación para eliminar */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteResource}
        itemName={resource.title}
        itemType="recurso"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}