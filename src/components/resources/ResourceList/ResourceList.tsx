// src/components/resources/ResourceList.tsx - LISTA MEJORADA CON STOCK
// ================================================================
// COMPONENTE DE LISTA DE RECURSOS CON INDICADORES DE STOCK Y DISPONIBILIDAD
// ================================================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  Badge,
  Button,
  IconButton,
  HStack,
  VStack,
  Grid,
  GridItem,
  Progress,
  Image,
  useDisclosure,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  Skeleton,
  SkeletonText,
  SimpleGrid,
  Divider,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';

import {
  FiMoreVertical,
  FiEdit,
  FiEye,
  FiTrash2,
  FiBookOpen,
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiX,
} from 'react-icons/fi';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Hooks y tipos
import { useResources, useDeleteResource } from '@/hooks/useResources';
import { ResourceForm } from '../ResourceForm';
import { StockManagement } from '../StockManagement';
import type { Resource, ResourceFilters } from '@/types/resource.types';

// ===== INTERFACES =====
interface ResourceListProps {
  filters?: ResourceFilters;
  onResourceSelect?: (resource: Resource) => void;
  onResourceEdit?: (resource: Resource) => void;
  onCreate?: () => void;
  showStockIndicators?: boolean;
  showActions?: boolean;
  layout?: 'grid' | 'list';
  pageSize?: number;
}

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onSelect?: (resource: Resource) => void;
  showStockIndicators: boolean;
  layout: 'grid' | 'list';
}

// ===== COMPONENTE DE TARJETA DE RECURSO =====
const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete,
  onSelect,
  showStockIndicators,
  layout,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Cálculos de stock
  const availableQuantity = resource.availableQuantity || 0;
  const totalQuantity = resource.totalQuantity;
  const loanedCount = resource.currentLoansCount || 0;
  const stockPercentage = totalQuantity > 0 ? (availableQuantity / totalQuantity) * 100 : 0;

  // Estado del stock
  const getStockStatus = () => {
    if (!resource.available) {
      return { status: 'disabled', label: 'No Disponible', color: 'gray' };
    }
    if (availableQuantity === 0) {
      return { status: 'no-stock', label: 'Sin Stock', color: 'red' };
    }
    if (availableQuantity <= 5) {
      return { status: 'low-stock', label: 'Stock Bajo', color: 'orange' };
    }
    return { status: 'good-stock', label: 'Disponible', color: 'green' };
  };

  const stockStatus = getStockStatus();

  // Información de autores
  const authorsText = resource.authors?.length 
    ? resource.authors.map(author => author.name).join(', ')
    : 'Sin autor especificado';

  if (layout === 'list') {
    return (
      <Card 
        bg={cardBg} 
        borderColor={borderColor} 
        borderWidth="1px"
        cursor={onSelect ? "pointer" : "default"}
        onClick={() => onSelect?.(resource)}
        _hover={onSelect ? { 
          shadow: "md", 
          borderColor: "blue.300",
          bg: "blue.50"
        } : {}}
        transition="all 0.2s"
      >
        <CardBody p={4}>
          <Grid templateColumns="1fr auto auto" gap={4} alignItems="center">
            {/* Información principal */}
            <GridItem>
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                      {resource.title}
                    </Text>
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <FiUser size={12} />
                        <Text noOfLines={1}>{authorsText}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <FiMapPin size={12} />
                        <Text>{resource.location?.name || 'Sin ubicación'}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <FiCalendar size={12} />
                        <Text>
                          {format(new Date(resource.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </HStack>

                {/* Información de categoría y tipo */}
                <HStack spacing={2}>
                  <Badge colorScheme="blue" size="sm">
                    {resource.type?.description || 'Tipo N/A'}
                  </Badge>
                  <Badge colorScheme="purple" size="sm">
                    {resource.category?.name || 'Categoría N/A'}
                  </Badge>
                  {resource.isbn && (
                    <Badge colorScheme="gray" size="sm">
                      ISBN: {resource.isbn}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </GridItem>

            {/* Indicadores de stock */}
            {showStockIndicators && (
              <GridItem>
                <VStack spacing={2} align="center" minW="120px">
                  <Badge colorScheme={stockStatus.color} size="sm">
                    {stockStatus.label}
                  </Badge>
                  
                  <VStack spacing={1} fontSize="xs">
                    <HStack spacing={3}>
                      <Text>Disponible: <strong>{availableQuantity}</strong></Text>
                      <Text>Total: <strong>{totalQuantity}</strong></Text>
                    </HStack>
                    <Progress
                      value={stockPercentage}
                      colorScheme={stockStatus.color}
                      size="sm"
                      w="100px"
                      bg="gray.100"
                    />
                  </VStack>
                </VStack>
              </GridItem>
            )}

            {/* ✅ MEJORADO: Acciones con mejor UX */}
            <GridItem>
              <HStack spacing={2}>
                {/* ✅ NUEVO: Botón de "Ver detalles" más prominente */}
                {onSelect && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<FiEye />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(resource);
                    }}
                  >
                    Ver
                  </Button>
                )}
                
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <MenuList>
                    {onSelect && (
                      <MenuItem icon={<FiEye />} onClick={() => onSelect(resource)}>
                        Ver Detalles
                      </MenuItem>
                    )}
                    <MenuItem icon={<FiEdit />} onClick={() => onEdit(resource)}>
                      Editar
                    </MenuItem>
                    <MenuItem 
                      icon={<FiTrash2 />} 
                      onClick={() => onDelete(resource)}
                      color="red.500"
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    );
  }

  // Layout de grid (tarjetas)
  return (
    <Card 
      bg={cardBg} 
      borderColor={borderColor} 
      borderWidth="1px"
      cursor={onSelect ? "pointer" : "default"}
      onClick={() => onSelect?.(resource)}
      _hover={onSelect ? { 
        shadow: "lg", 
        transform: "translateY(-2px)",
        borderColor: "blue.300"
      } : {}}
      transition="all 0.2s"
      position="relative"
    >
      {/* ✅ NUEVO: Indicador visual de que es clickeable */}
      {onSelect && (
        <Box
          position="absolute"
          top={2}
          right={2}
          zIndex={2}
          bg="blue.500"
          color="white"
          borderRadius="full"
          p={1}
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.2s"
        >
          <FiEye size={12} />
        </Box>
      )}
      
      <CardBody p={4}>
        <VStack align="stretch" spacing={4}>
          {/* Imagen y badges principales */}
          <Box position="relative">
            {resource.coverImageUrl ? (
              <Image
                src={resource.coverImageUrl}
                alt={resource.title}
                h="120px"
                w="full"
                objectFit="cover"
                borderRadius="md"
                fallback={
                  <Box
                    h="120px"
                    bg="gray.100"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiBookOpen size={32} color="gray.400" />
                  </Box>
                }
              />
            ) : (
              <Box
                h="120px"
                bg="gray.100"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiBookOpen size={32} color="gray.400" />
              </Box>
            )}

            {/* Badge de stock */}
            {showStockIndicators && (
              <Badge
                position="absolute"
                top={2}
                left={2}
                colorScheme={stockStatus.color}
                size="sm"
              >
                {stockStatus.label}
              </Badge>
            )}
          </Box>

          {/* Información del recurso */}
          <VStack align="stretch" spacing={2}>
            <Text fontWeight="bold" fontSize="md" noOfLines={2}>
              {resource.title}
            </Text>
            
            <Text fontSize="sm" color="gray.600" noOfLines={1}>
              {authorsText}
            </Text>

            {/* Badges de categorización */}
            <HStack spacing={1} flexWrap="wrap">
              <Badge colorScheme="blue" size="sm">
                {resource.type?.description || 'Tipo N/A'}
              </Badge>
              <Badge colorScheme="purple" size="sm">
                {resource.category?.name || 'Cat. N/A'}
              </Badge>
            </HStack>
          </VStack>

          {/* Información de stock detallada */}
          {showStockIndicators && (
            <Box bg="gray.50" p={3} borderRadius="md">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Stock</Text>
                <HStack spacing={1}>
                  <FiPackage size={12} />
                  <Text fontSize="xs">{availableQuantity}/{totalQuantity}</Text>
                </HStack>
              </HStack>
              
              <Progress
                value={stockPercentage}
                colorScheme={stockStatus.color}
                size="sm"
                bg="gray.200"
                borderRadius="full"
              />
              
              {loanedCount > 0 && (
                <Text fontSize="xs" color="gray.600" mt={1}>
                  {loanedCount} en préstamo
                </Text>
              )}
            </Box>
          )}

          {/* Información adicional */}
          <VStack spacing={1} fontSize="xs" color="gray.500">
            <HStack justify="space-between" w="full">
              <Text>{resource.location?.name || 'Sin ubicación'}</Text>
              <Text>{format(new Date(resource.createdAt), 'dd/MM/yy', { locale: es })}</Text>
            </HStack>
          </VStack>

          <Divider />

          {/* ✅ MEJORADO: Acciones con mejor UX */}
          <HStack spacing={2} justify="flex-end">
            {/* ✅ NUEVO: Botón de "Ver detalles" más prominente */}
            {onSelect && (
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                leftIcon={<FiEye />}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(resource);
                }}
                flex={1}
              >
                Ver Detalles
              </Button>
            )}
            
            <Tooltip label="Editar recurso">
              <IconButton
                aria-label="Editar"
                icon={<FiEdit />}
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
              />
            </Tooltip>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                {onSelect && (
                  <MenuItem icon={<FiEye />} onClick={() => onSelect(resource)}>
                    Ver Detalles
                  </MenuItem>
                )}
                <MenuItem 
                  icon={<FiTrash2 />} 
                  onClick={() => onDelete(resource)}
                  color="red.500"
                >
                  Eliminar
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export const ResourceList: React.FC<ResourceListProps> = ({
  filters = {},
  onResourceSelect,
  onResourceEdit,
  onCreate,
  showStockIndicators = true,
  showActions = true,
  layout = 'grid',
  pageSize = 20,
}) => {
  // ✅ NUEVO: Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // ✅ NUEVO: Debounce para la búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ NUEVO: Combinar filtros existentes con búsqueda
  const combinedFilters: ResourceFilters = {
    ...filters,
    search: debouncedSearchTerm.trim() || undefined,
  };

  const { data: resourcesResponse, isLoading } = useResources(combinedFilters);
  const deleteMutation = useDeleteResource();
  const resources = resourcesResponse?.data || [];

  // ✅ NUEVO: Handler para limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const handleEdit = (resource: Resource) => {
    if (onResourceEdit) {
      onResourceEdit(resource);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
      try {
        await deleteMutation.mutateAsync(resource._id);
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleSelect = (resource: Resource) => {
    if (onResourceSelect) {
      onResourceSelect(resource);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* ✅ NUEVO: Barra de búsqueda */}
      <Box>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por título"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: 'gray.400' }}
            _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
          />
          {searchTerm && (
            <InputRightElement>
              <IconButton
                aria-label="Limpiar búsqueda"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
              />
            </InputRightElement>
          )}
        </InputGroup>
        {debouncedSearchTerm && (
          <Text fontSize="sm" color="gray.600" mt={2}>
            Buscando: "{debouncedSearchTerm}" • {resources.length} resultados
          </Text>
        )}
      </Box>

      {showActions && (
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="medium">
            Recursos ({resources.length})
          </Text>
          {onCreate && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={onCreate}
            >
              Agregar Recurso
            </Button>
          )}
        </HStack>
      )}

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton height="120px" mb={4} />
                <SkeletonText noOfLines={3} spacing={4} />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : resources.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          {debouncedSearchTerm 
            ? `No se encontraron recursos que coincidan con "${debouncedSearchTerm}".`
            : 'No se encontraron recursos que coincidan con los filtros.'
          }
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelect}
              showStockIndicators={showStockIndicators}
              layout={layout}
            />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};