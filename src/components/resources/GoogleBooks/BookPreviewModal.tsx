// src/components/resources/GoogleBooks/BookPreviewModal.tsx
'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Box,
  Badge,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  Skeleton,
} from '@chakra-ui/react';
import { FiBook, FiPlus, FiExternalLink, FiCalendar, FiUser, FiHash } from 'react-icons/fi';
import { GoogleBooksUtils, useCreateResourceFromGoogleBooks } from '@/hooks/useGoogleBooks';
import { useCategories, useLocations } from '@/hooks/useResources';
import type { GoogleBooksVolume } from '@/types/resource.types';

interface BookPreviewModalProps {
  volume: GoogleBooksVolume;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  categoryId?: string;
  locationId?: string;
}

export function BookPreviewModal({
  volume,
  isOpen,
  onClose,
  onSelect,
  categoryId,
  locationId,
}: BookPreviewModalProps) {
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  const createFromGoogleBooksMutation = useCreateResourceFromGoogleBooks();

  // Datos del libro
  const imageUrl = GoogleBooksUtils.getBestImageUrl(volume);
  const authors = GoogleBooksUtils.formatAuthors(volume);
  const isbn = GoogleBooksUtils.getAnyISBN(volume);
  const year = GoogleBooksUtils.getPublicationYear(volume);
  const description = GoogleBooksUtils.truncateDescription(volume, 300);

  // Datos de categoría y ubicación seleccionadas
  const selectedCategory = categories.find(cat => cat._id === categoryId);
  const selectedLocation = locations.find(loc => loc._id === locationId);

  const canCreateResource = categoryId && locationId;

  const handleCreateResource = async () => {
    if (!canCreateResource) return;

    try {
      await createFromGoogleBooksMutation.mutateAsync({
        googleBooksId: volume.id,
        categoryId: categoryId!,
        locationId: locationId!,
        volumes: 1,
        notes: `Importado desde Google Books (ID: ${volume.id})`,
      });
      
      onClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <FiBook />
            <Text>Detalles del Libro</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Información principal */}
            <HStack spacing={4} align="start">
              {/* Imagen */}
              <Box flexShrink={0}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={volume.title}
                    boxSize="120px"
                    objectFit="cover"
                    borderRadius="md"
                    fallback={
                      <Box
                        boxSize="120px"
                        bg="gray.100"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiBook size={32} color="gray.400" />
                      </Box>
                    }
                  />
                ) : (
                  <Box
                    boxSize="120px"
                    bg="gray.100"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiBook size={32} color="gray.400" />
                  </Box>
                )}
              </Box>

              {/* Información básica */}
              <VStack align="start" spacing={2} flex={1}>
                <Text fontWeight="bold" fontSize="lg" lineHeight="short">
                  {volume.title}
                </Text>
                
                <HStack spacing={2}>
                  <FiUser size={14} />
                  <Text color="gray.600">{authors}</Text>
                </HStack>

                {volume.publisher && (
                  <Text color="gray.600" fontSize="sm">
                    {volume.publisher}
                    {year && ` • ${year}`}
                  </Text>
                )}

                {isbn && (
                  <HStack spacing={2}>
                    <FiHash size={14} />
                    <Badge colorScheme="blue" variant="outline">
                      ISBN: {isbn}
                    </Badge>
                  </HStack>
                )}

                {volume.pageCount && (
                  <Text fontSize="sm" color="gray.500">
                    {volume.pageCount} páginas
                  </Text>
                )}
              </VStack>
            </HStack>

            <Divider />

            {/* Descripción */}
            {volume.description && (
              <Box>
                <Text fontWeight="medium" mb={2}>Descripción</Text>
                <Text fontSize="sm" lineHeight="tall" color="gray.700">
                  {description}
                </Text>
              </Box>
            )}

            {/* Categorías de Google Books */}
            {volume.categories && volume.categories.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2}>Categorías</Text>
                <HStack wrap="wrap" spacing={2}>
                  {volume.categories.map((category, index) => (
                    <Badge key={index} variant="subtle" colorScheme="gray">
                      {category}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Información técnica */}
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb={1}>ID de Google Books</Text>
                <Text fontSize="sm" color="gray.600" fontFamily="mono">
                  {volume.id}
                </Text>
              </Box>
              
              {volume.publishedDate && (
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb={1}>Fecha de publicación</Text>
                  <Text fontSize="sm" color="gray.600">
                    {volume.publishedDate}
                  </Text>
                </Box>
              )}
            </SimpleGrid>

            <Divider />

            {/* Información de destino para creación */}
            {canCreateResource ? (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Listo para crear recurso
                  </Text>
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Categoría: {selectedCategory?.name} • 
                    Ubicación: {selectedLocation?.name}
                  </Text>
                </Box>
              </Alert>
            ) : (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Selecciona categoría y ubicación
                  </Text>
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Para crear automáticamente el recurso, primero selecciona una categoría y ubicación en la página anterior.
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            
            <Button
              leftIcon={<FiExternalLink />}
              variant="outline"
              onClick={onSelect}
            >
              Usar para formulario
            </Button>

            {canCreateResource && (
              <Button
                colorScheme="blue"
                leftIcon={<FiPlus />}
                onClick={handleCreateResource}
                isLoading={createFromGoogleBooksMutation.isPending}
                loadingText="Creando..."
              >
                Crear Recurso
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}