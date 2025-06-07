// src/app/inventory/google-books/page.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiSearch, FiPlus, FiBook } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoogleBooksSearch } from '@/components/resources/GoogleBooks/GoogleBooksSearch';
import { useCategories, useLocations } from '@/hooks/useResources';
import { useGoogleBooks } from '@/hooks/useGoogleBooks';
import type { GoogleBooksVolume } from '@/types/resource.types';

export default function GoogleBooksPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [addedResources, setAddedResources] = useState<number>(0);

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const { isApiAvailable } = useGoogleBooks();

  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const selectedLocation = locations.find(loc => loc._id === selectedLocationId);

  const canSearch = selectedCategoryId && selectedLocationId && isApiAvailable;

  const handleBookSelect = (volume: GoogleBooksVolume) => {
    // Este callback se ejecuta cuando se selecciona un libro desde Google Books
    // El componente GoogleBooksSearch maneja la creación automática
    setAddedResources(prev => prev + 1);
  };

  const handleNavigateToManual = () => {
    router.push('/inventory/new');
  };

  const handleNavigateBack = () => {
    router.push('/inventory');
  };

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
              <Text>Google Books</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>

        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Box p={2} bg="green.50" borderRadius="lg">
                  <FiSearch size={24} color="#38A169" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="gray.800">
                    Buscar en Google Books
                  </Heading>
                  <Text color="gray.600">
                    Encuentra libros y agrega su información automáticamente
                  </Text>
                </VStack>
              </HStack>

              {addedResources > 0 && (
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  ✅ {addedResources} libro{addedResources !== 1 ? 's' : ''} agregado{addedResources !== 1 ? 's' : ''}
                </Badge>
              )}
            </VStack>

            <VStack spacing={2} align="end">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                onClick={handleNavigateBack}
                size="sm"
              >
                Volver a Inventario
              </Button>
            </VStack>
          </HStack>

          {/* Opciones alternativas */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="sm" fontWeight="medium">
                ¿No encuentras el libro que buscas?
              </Text>
              <Text fontSize="sm">
                Siempre puedes agregar recursos manualmente con toda la información necesaria.
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                leftIcon={<FiPlus />}
                onClick={handleNavigateToManual}
              >
                Agregar Manualmente
              </Button>
            </VStack>
          </Alert>
        </Box>

        {/* Configuración previa */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700">
                Configuración para Nuevos Recursos
              </Text>
              
              <Text fontSize="sm" color="gray.600">
                Selecciona la categoría y ubicación que se asignarán automáticamente a los libros que agregues desde Google Books.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    placeholder="Selecciona una categoría"
                    isDisabled={isLoadingCategories}
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Ubicación</FormLabel>
                  <Select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    placeholder="Selecciona una ubicación"
                    isDisabled={isLoadingLocations}
                  >
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Información de selección actual */}
              {selectedCategory && selectedLocation && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Configuración lista</AlertTitle>
                    <AlertDescription fontSize="sm">
                      Los libros se agregarán en: <strong>{selectedCategory.name}</strong> • <strong>{selectedLocation.name}</strong>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Estado de Google Books API */}
        {!isApiAvailable && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Google Books no disponible</AlertTitle>
              <AlertDescription>
                El servicio de Google Books no está disponible actualmente. 
                Puedes registrar libros manualmente usando el formulario tradicional.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Búsqueda en Google Books */}
        {canSearch ? (
          <GoogleBooksSearch
            onBookSelect={handleBookSelect}
            categoryId={selectedCategoryId}
            locationId={selectedLocationId}
          />
        ) : (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <FiBook size={48} color="#CBD5E0" />
                <VStack spacing={2} textAlign="center">
                  <Text fontWeight="medium" color="gray.700">
                    Configura los datos previos para comenzar
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Selecciona una categoría y ubicación para comenzar a buscar libros en Google Books
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Información adicional */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Consejos para la búsqueda</AlertTitle>
            <AlertDescription fontSize="sm">
              <Text>• Busca por título exacto para mejores resultados</Text>
              <Text>• Puedes buscar por ISBN para encontrar libros específicos</Text>
              <Text>• La información se completará automáticamente (autor, editorial, etc.)</Text>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </DashboardLayout>
  );
}