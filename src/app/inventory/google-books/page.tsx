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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiSearch, FiPlus, FiBook, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoogleBooksSearch } from '@/components/resources/GoogleBooks/GoogleBooksSearch';
import { useCategories, useLocations } from '@/hooks/useResources';
import { useGoogleBooks } from '@/hooks/useGoogleBooks';
import type { GoogleBooksVolume } from '@/types/resource.types';

export default function GoogleBooksPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [addedResources, setAddedResources] = useState<number>(0);
  const [recentlyAdded, setRecentlyAdded] = useState<GoogleBooksVolume[]>([]);

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const { isApiAvailable, isLoading: isCheckingApi, refetchStatus } = useGoogleBooks();

  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const selectedLocation = locations.find(loc => loc._id === selectedLocationId);

  const canSearch = selectedCategoryId && selectedLocationId && isApiAvailable;

  // Limpiar recursos recientes después de 10 segundos
  useEffect(() => {
    if (recentlyAdded.length > 0) {
      const timer = setTimeout(() => {
        setRecentlyAdded([]);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAdded]);

  const handleBookSelect = (volume: GoogleBooksVolume) => {
    // Incrementar contador
    setAddedResources(prev => prev + 1);
    
    // Agregar a lista de recientes (máximo 5)
    setRecentlyAdded(prev => {
      const newList = [volume, ...prev].slice(0, 5);
      return newList;
    });
  };

  const handleNavigateToManual = () => {
    router.push('/inventory/new');
  };

  const handleNavigateBack = () => {
    router.push('/inventory');
  };

  const handleRetryApiConnection = () => {
    refetchStatus();
    toast({
      title: 'Verificando conexión',
      description: 'Reintentando conexión con Google Books API...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const resetConfiguration = () => {
    setSelectedCategoryId('');
    setSelectedLocationId('');
    setAddedResources(0);
    setRecentlyAdded([]);
  };

  return (
    <DashboardLayout>
      <VStack spacing={6} align="stretch">
        {/* Navegación */}
        <Box>
          <Breadcrumb spacing={2} fontSize="sm" color="gray.600">
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleNavigateBack} cursor="pointer">
                Inventario
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <Text>Búsqueda en Google Books</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>

        {/* Encabezado */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Box p={2} bg="blue.50" borderRadius="lg">
                  <FiSearch size={24} color="#3182CE" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="gray.800">
                    Búsqueda en Google Books
                  </Heading>
                  <Text color="gray.600">
                    Encuentra y registra libros automáticamente desde Google Books
                  </Text>
                </VStack>
              </HStack>
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
              <Button
                leftIcon={<FiPlus />}
                colorScheme="gray"
                variant="outline"
                onClick={handleNavigateToManual}
                size="sm"
              >
                Registro Manual
              </Button>
            </VStack>
          </HStack>
        </Box>

        {/* Estadísticas de sesión */}
        {addedResources > 0 && (
          <Card>
            <CardBody>
              <HStack spacing={8}>
                <Stat>
                  <StatLabel>Libros Registrados</StatLabel>
                  <StatNumber color="green.500">{addedResources}</StatNumber>
                  <StatHelpText>En esta sesión</StatHelpText>
                </Stat>
                
                {recentlyAdded.length > 0 && (
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                      Últimos registrados:
                    </Text>
                    <VStack spacing={1} align="start">
                      {recentlyAdded.slice(0, 3).map((book, index) => (
                        <HStack key={book.id} spacing={2}>
                          <FiCheckCircle size={14} color="green" />
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {book.title}
                          </Text>
                        </HStack>
                      ))}
                      {recentlyAdded.length > 3 && (
                        <Text fontSize="xs" color="gray.500">
                          y {recentlyAdded.length - 3} más...
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Configuración previa */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <Text fontWeight="medium" color="gray.700">
                  Configuración de Registro
                </Text>
                {(selectedCategoryId || selectedLocationId) && (
                  <Button size="xs" variant="ghost" onClick={resetConfiguration}>
                    Limpiar
                  </Button>
                )}
              </HStack>

              <Text fontSize="sm" color="gray.600">
                Selecciona la categoría y ubicación donde se registrarán los libros automáticamente.
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
                      Los libros se registrarán automáticamente en: <strong>{selectedCategory.name}</strong> • <strong>{selectedLocation.name}</strong>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Estado de Google Books API */}
        {!isApiAvailable && !isCheckingApi && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle>Google Books no disponible</AlertTitle>
              <AlertDescription>
                El servicio de Google Books no está disponible actualmente. 
                Puedes registrar libros manualmente usando el formulario tradicional.
              </AlertDescription>
            </Box>
            <Button
              leftIcon={<FiRefreshCw />}
              size="sm"
              ml={4}
              onClick={handleRetryApiConnection}
            >
              Reintentar
            </Button>
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
                    {isCheckingApi ? 'Verificando conexión con Google Books...' : 'Configura los datos previos para comenzar'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {isCheckingApi 
                      ? 'Por favor espera mientras verificamos la disponibilidad del servicio'
                      : 'Selecciona una categoría y ubicación para comenzar a buscar libros en Google Books'
                    }
                  </Text>
                </VStack>
                {isCheckingApi && (
                  <Box>
                    <FiRefreshCw className="animate-spin" />
                  </Box>
                )}
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
              <Text>• Haz clic en "Registrar Libro" para agregar directamente al inventario</Text>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </DashboardLayout>
  );
}