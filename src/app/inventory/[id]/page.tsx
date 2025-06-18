// src/app/inventory/[id]/page.tsx - Con imágenes
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
  Skeleton,
  SkeletonText,
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
  Image,
  Tooltip,
  AspectRatio,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiToggleLeft, 
  FiToggleRight, 
  FiTrash2, 
  FiMapPin, 
  FiCalendar,
  FiBook,
  FiImage,
  FiExternalLink
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceForm } from '@/components/resources/ResourceForm/ResourceForm';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { 
  useResource, 
  useUpdateResource, 
  useUpdateResourceAvailability, 
  useDeleteResource 
} from '@/hooks/useResources';
import { DateUtils } from '@/utils';
import { ImageUtils } from '@/utils/imageUtils';
import type { Resource, UpdateResourceRequest } from '@/types/resource.types';

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

  // Queries
  const { data: resource, isLoading, error } = useResource(resourceId);

  // Mutations
  const updateMutation = useUpdateResource();
  const updateAvailabilityMutation = useUpdateResourceAvailability();
  const deleteMutation = useDeleteResource();

  // Modales
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();

  // Handlers
  const handleUpdateResource = async (data: UpdateResourceRequest) => {
    try {
      await updateMutation.mutateAsync({ id: resourceId, data });
      onEditClose();
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
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
            {/* Skeleton para imagen */}
            <Box>
              <Skeleton height="400px" borderRadius="lg" />
            </Box>
            {/* Skeleton para contenido */}
            <Box gridColumn={{ base: 1, lg: "span 2" }}>
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
            </Box>
          </SimpleGrid>
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

  // ✅ MEJORADO: Validación más defensiva para evitar errores
  const safeTypeConfig = typeConfig || { icon: '📄', label: 'Recurso', color: 'gray' };

  // Configuración del estado
  const stateConfig = resource.state
    ? RESOURCE_STATE_CONFIGS[resource.state.name as keyof typeof RESOURCE_STATE_CONFIGS]
    : { label: 'Estado desconocido', color: 'gray' };

  // ✅ MEJORADO: Validación más defensiva para el estado
  const safeStateConfig = stateConfig || { label: 'Estado desconocido', color: 'gray' };

  // Información de autores
  const authorsText = resource.authors && resource.authors.length > 0
    ? resource.authors.map(author => author.name).join(', ')
    : 'Sin autor especificado';

  // ✅ DEBUG: Log para verificar datos del recurso
  console.log('🔍 ResourceDetailPage - Datos del recurso:', {
    id: resource._id,
    title: resource.title,
    authors: resource.authors,
    authorIds: resource.authorIds,
    hasAuthors: !!resource.authors,
    authorsLength: resource.authors?.length || 0,
    categoryId: resource.categoryId,
    locationId: resource.locationId,
    stateId: resource.stateId,
    publisherId: resource.publisherId,
    volumes: resource.volumes,
    notes: resource.notes,
    available: resource.available,
    type: resource.type,
    typeId: resource.typeId,
    hasType: !!resource.type,
    typeName: resource.type?.name,
  });

  // ✅ NUEVO: Configuración de imagen
  const imageUrl = ImageUtils.getResourceImageUrl(resource);
  const placeholderUrl = ImageUtils.getPlaceholderImageUrl(resource.type?.name || 'book');

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
                <Box p={2} bg={`${safeTypeConfig.color}.50`} borderRadius="lg">
                  <Text fontSize="2xl">{safeTypeConfig.icon}</Text>
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800" lineHeight="short">
                    {resource.title}
                  </Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme={safeTypeConfig.color} variant="solid">
                      {safeTypeConfig.label}
                    </Badge>
                    <Badge
                      colorScheme={resource.available ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {resource.available ? 'Disponible' : 'Prestado'}
                    </Badge>
                    <Badge colorScheme={safeStateConfig.color} variant="outline">
                      {safeStateConfig.label}
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

        {/* ✅ NUEVO: Layout principal con imagen y detalles */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Columna de imagen */}
          <VStack spacing={4} align="stretch">
            {/* Imagen principal */}
            <Card>
              <CardBody p={4}>
                <VStack spacing={3} align="center">
                  <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                    Portada del Recurso
                  </Text>
                  
                  <AspectRatio ratio={3/4} width="100%" maxW="250px">
                    <Image
                      src={imageUrl || placeholderUrl}
                      alt={`Portada de ${resource.title}`}
                      objectFit="cover"
                      borderRadius="lg"
                      fallbackSrc={placeholderUrl}
                      border="1px solid"
                      borderColor="gray.200"
                      cursor={imageUrl ? "pointer" : "default"}
                      onClick={imageUrl ? onImageOpen : undefined}
                      _hover={imageUrl ? { opacity: 0.8 } : {}}
                      transition="opacity 0.2s"
                      loading="lazy"
                    />
                  </AspectRatio>

                  {/* Información de la imagen */}
                  {resource.coverImageUrl ? (
                    <VStack spacing={1}>
                      <HStack spacing={2}>
                        <Badge colorScheme="green" variant="subtle" fontSize="xs">
                          <HStack spacing={1}>
                            <FiImage size={10} />
                            <Text>Imagen de Google Books</Text>
                          </HStack>
                        </Badge>
                      </HStack>
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<FiExternalLink />}
                        onClick={() => window.open(resource.coverImageUrl!, '_blank')}
                      >
                        Ver imagen original
                      </Button>
                    </VStack>
                  ) : (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      No hay imagen de portada disponible
                    </Text>
                  )}

                  {/* Botón para ampliar */}
                  {imageUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FiImage />}
                      onClick={onImageOpen}
                    >
                      Ver en grande
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Información de Google Books */}
            {resource.googleBooksId && (
              <Card>
                <CardBody>
                  <VStack spacing={3} align="start">
                    <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                      Google Books
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="xs">📚</Text>
                      <Text fontSize="xs" color="gray.600">
                        Importado desde Google Books
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                      ID: {resource.googleBooksId}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* Columna de detalles (2 columnas en lg) */}
          <Box gridColumn={{ base: 1, lg: "span 2" }}>
            {/* Acciones principales */}
            <HStack spacing={3} wrap="wrap" mb={6}>
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
                {resource.available ? 'Marcar como prestado' : 'Marcar como disponible'}
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
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Información bibliográfica */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="semibold" color="gray.700">
                      Información Bibliográfica
                    </Text>
                    
                    <VStack spacing={3} align="stretch">
                      {resource.publisher && (
                        <HStack spacing={2}>
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

                      {resource.notes && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600">Notas:</Text>
                          <Text fontSize="sm" color="gray.800">
                            {resource.notes}
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
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

      {/* Modal de imagen ampliada */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton
            color="white"
            bg="blackAlpha.600"
            _hover={{ bg: "blackAlpha.800" }}
            size="lg"
            top={4}
            right={4}
          />
          <ModalBody p={8}>
            <Image
              src={imageUrl || placeholderUrl}
              alt={`Portada de ${resource.title}`}
              objectFit="contain"
              maxW="100%"
              maxH="80vh"
              mx="auto"
              borderRadius="lg"
              fallbackSrc={placeholderUrl}
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