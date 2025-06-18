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
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiBook, FiPlus, FiExternalLink, FiInfo } from 'react-icons/fi';
import { GoogleBooksUtils, useCreateResourceFromGoogleBooks } from '@/hooks/useGoogleBooks';
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
  const createFromGoogleBooksMutation = useCreateResourceFromGoogleBooks();
  
  // ✅ NUEVO: Estado para la cantidad total
  const [totalQuantity, setTotalQuantity] = useState(1);

  // Datos del libro
  const imageUrl = GoogleBooksUtils.getBestImageUrl(volume);
  const authors = GoogleBooksUtils.formatAuthors(volume);
  const isbn = GoogleBooksUtils.getAnyISBN(volume);
  const year = GoogleBooksUtils.getPublicationYear(volume);
  const description = GoogleBooksUtils.truncateDescription(volume, 300);

  const canCreateResource = categoryId && locationId;

  const handleCreateResource = async () => {
    if (!canCreateResource) return;

    try {
      await createFromGoogleBooksMutation.mutateAsync({
        googleBooksId: volume.id,
        categoryId: categoryId!,
        locationId: locationId!,
        volumes: 1,
        totalQuantity: totalQuantity, // ✅ NUEVO: Incluir cantidad total
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
                
                <Text color="gray.600">{authors}</Text>

                {volume.publisher && (
                  <Text color="gray.600" fontSize="sm">
                    {volume.publisher}
                    {year && ` • ${year}`}
                  </Text>
                )}

                {isbn && (
                  <Badge colorScheme="blue" variant="outline">
                    ISBN: {isbn}
                  </Badge>
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
          </VStack>
        </ModalBody>

        {/* ✅ NUEVO: Campo de cantidad total */}
        {canCreateResource && (
          <Box px={6} pb={4}>
            <Divider mb={4} />
            <FormControl>
              <FormLabel>
                <HStack spacing={2}>
                  <Text>Cantidad Total</Text>
                  <Tooltip label="Número total de unidades disponibles">
                    <Box>
                      <FiInfo />
                    </Box>
                  </Tooltip>
                </HStack>
              </FormLabel>
              <NumberInput
                value={totalQuantity}
                onChange={(_, valueAsNumber) => setTotalQuantity(isNaN(valueAsNumber) ? 1 : valueAsNumber)}
                min={1}
                max={10000}
                isDisabled={createFromGoogleBooksMutation.isPending}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Box>
        )}

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