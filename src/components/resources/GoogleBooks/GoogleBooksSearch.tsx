// src/components/resources/GoogleBooks/GoogleBooksSearch.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Badge,
  useDisclosure,
  InputGroup,
  InputRightElement,
  IconButton,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiSearch, FiBook, FiPlus, FiExternalLink, FiX } from 'react-icons/fi';
import { useGoogleBooksSearch, useGoogleBooks, GoogleBooksUtils } from '@/hooks/useGoogleBooks';
import { BookPreviewModal } from './BookPreviewModal';
import type { GoogleBooksVolume } from '@/types/resource.types';

interface GoogleBooksSearchProps {
  onBookSelect: (volume: GoogleBooksVolume) => void;
  categoryId?: string;
  locationId?: string;
  className?: string;
}

function BookCard({ 
  volume, 
  onSelect, 
  onPreview 
}: { 
  volume: GoogleBooksVolume; 
  onSelect: () => void;
  onPreview: () => void;
}) {
  const imageUrl = GoogleBooksUtils.getBestImageUrl(volume);
  const authors = GoogleBooksUtils.formatAuthors(volume);
  const isbn = GoogleBooksUtils.getAnyISBN(volume);
  const year = GoogleBooksUtils.getPublicationYear(volume);

  return (
    <Card size="sm" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          {/* Imagen del libro */}
          <Box textAlign="center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={volume.title}
                boxSize="80px"
                objectFit="cover"
                mx="auto"
                borderRadius="md"
                fallback={<Box boxSize="80px" bg="gray.100" borderRadius="md" />}
              />
            ) : (
              <Box
                boxSize="80px"
                bg="gray.100"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
              >
                <FiBook size={24} color="gray.400" />
              </Box>
            )}
          </Box>

          {/* Información del libro */}
          <VStack spacing={2} align="stretch" minH="120px">
            <Text fontWeight="semibold" fontSize="sm" noOfLines={2} lineHeight="short">
              {volume.title}
            </Text>
            
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {authors}
            </Text>
            
            {volume.publisher && (
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {volume.publisher} {year && `(${year})`}
              </Text>
            )}

            {isbn && (
              <Badge fontSize="xs" variant="outline" colorScheme="blue">
                ISBN: {isbn}
              </Badge>
            )}
          </VStack>

          {/* Acciones */}
          <VStack spacing={2}>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FiPlus />}
              onClick={onSelect}
              w="full"
            >
              Seleccionar
            </Button>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<FiExternalLink />}
              onClick={onPreview}
              w="full"
            >
              Ver detalles
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} size="sm">
          <CardBody p={4}>
            <VStack spacing={3}>
              <Skeleton height="80px" width="80px" borderRadius="md" />
              <SkeletonText noOfLines={3} spacing={2} w="full" />
              <Skeleton height="32px" w="full" borderRadius="md" />
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function GoogleBooksSearch({
  onBookSelect,
  categoryId,
  locationId,
  className,
}: GoogleBooksSearchProps) {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<GoogleBooksVolume | null>(null);
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  
  // Hooks
  const { isApiAvailable } = useGoogleBooks();
  const { 
    data: searchResults = [], 
    isLoading, 
    error 
  } = useGoogleBooksSearch(searchTerm, 12, isApiAvailable);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTerm(query.trim());
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchTerm('');
  };

  const handleBookPreview = (volume: GoogleBooksVolume) => {
    setSelectedBook(volume);
    onPreviewOpen();
  };

  const handleBookSelect = (volume: GoogleBooksVolume) => {
    onBookSelect(volume);
  };

  if (!isApiAvailable) {
    return (
      <Alert status="warning" borderRadius="md" className={className}>
        <AlertIcon />
        <Box>
          <AlertTitle>Google Books no disponible</AlertTitle>
          <AlertDescription fontSize="sm">
            El servicio de Google Books no está disponible actualmente. 
            Puedes registrar libros manualmente usando el formulario.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box className={className}>
      <VStack spacing={6} align="stretch">
        {/* Búsqueda */}
        <Box>
          <form onSubmit={handleSearch}>
            <VStack spacing={3} align="stretch">
              <Text fontWeight="medium" color="gray.700">
                Buscar Libros en Google Books
              </Text>
              
              <InputGroup size="lg">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título, autor, ISBN..."
                  disabled={isLoading}
                />
                <InputRightElement width="auto" pr={1}>
                  {searchTerm && (
                    <IconButton
                      aria-label="Limpiar búsqueda"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      onClick={handleClearSearch}
                      mr={1}
                    />
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    colorScheme="blue"
                    disabled={isLoading || !query.trim()}
                    isLoading={isLoading}
                    loadingText="Buscando..."
                    leftIcon={<FiSearch />}
                  >
                    Buscar
                  </Button>
                </InputRightElement>
              </InputGroup>
              
              <Text fontSize="sm" color="gray.600">
                Busca libros por título, autor o ISBN para autocompletar la información
              </Text>
            </VStack>
          </form>
        </Box>

        {/* Error */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error en la búsqueda</AlertTitle>
              <AlertDescription fontSize="sm">
                {error.message || 'No se pudo realizar la búsqueda. Intenta nuevamente.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Resultados */}
        {searchTerm && (
          <Box>
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="medium" color="gray.700">
                Resultados para "{searchTerm}"
              </Text>
              {searchResults.length > 0 && (
                <Text fontSize="sm" color="gray.600">
                  {searchResults.length} libros encontrados
                </Text>
              )}
            </HStack>

            {isLoading ? (
              <LoadingSkeleton />
            ) : searchResults.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                {searchResults.map((volume) => (
                  <BookCard
                    key={volume.id}
                    volume={volume}
                    onSelect={() => handleBookSelect(volume)}
                    onPreview={() => handleBookPreview(volume)}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>No se encontraron resultados</AlertTitle>
                  <AlertDescription fontSize="sm">
                    No se encontraron libros con los términos de búsqueda "{searchTerm}".
                    Intenta con otros términos o registra el libro manualmente.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </Box>
        )}

        {/* Información adicional */}
        {!searchTerm && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Búsqueda en Google Books</AlertTitle>
              <AlertDescription fontSize="sm">
                Busca libros para autocompletar automáticamente título, autor, editorial e ISBN.
                Si no encuentras el libro, siempre puedes registrarlo manualmente.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Modal de previsualización */}
      {selectedBook && (
        <BookPreviewModal
          volume={selectedBook}
          isOpen={isPreviewOpen}
          onClose={onPreviewClose}
          onSelect={() => {
            handleBookSelect(selectedBook);
            onPreviewClose();
          }}
          categoryId={categoryId}
          locationId={locationId}
        />
      )}
    </Box>
  );
}