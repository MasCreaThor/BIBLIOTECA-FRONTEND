// src/components/admin/locations/LocationList.tsx - CORREGIDO
'use client';

import {
  Box,
  VStack,
  HStack,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiMapPin,
} from 'react-icons/fi';
import { useLocations, useDeleteLocation } from '@/hooks/useLocations';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateUtils } from '@/utils';
import type { Location, LocationFilters } from '@/services/location.service';
import { PaginatedResponse } from '@/types/api.types';

interface LocationListProps {
  onLocationSelect?: (location: Location) => void;
  onLocationEdit?: (location: Location) => void;
  onCreate?: () => void;
  showActions?: boolean;
}

function LocationCard({
  location,
  onEdit,
  onDelete,
  showActions = true,
}: {
  location: Location;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  showActions?: boolean;
}) {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const handleActionClick = (action: 'edit' | 'delete') => {
    switch (action) {
      case 'edit':
        onEdit?.(location);
        break;
      case 'delete':
        onDeleteOpen();
        break;
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.(location);
    onDeleteClose();
  };

  return (
    <>
      <Card
        size="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        opacity={location.active ? 1 : 0.7}
        border={location.active ? '1px solid' : '2px dashed'}
        borderColor={location.active ? 'gray.200' : 'gray.300'}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch" h="full">
            {/* Header */}
            <HStack justify="space-between" align="start">
              <HStack spacing={2}>
                <FiMapPin color="#38A169" size={16} />
                {location.code && (
                  <Badge colorScheme="green" variant="subtle" fontSize="xs">
                    {location.code}
                  </Badge>
                )}
              </HStack>
              
              <Badge
                colorScheme={location.active ? 'green' : 'gray'}
                variant="subtle"
                fontSize="xs"
              >
                {location.active ? 'Activa' : 'Inactiva'}
              </Badge>
            </HStack>

            {/* Contenido */}
            <Box flex={1}>
              <Text
                fontWeight="semibold"
                fontSize="md"
                lineHeight="short"
                noOfLines={2}
                color="gray.800"
                mb={2}
              >
                {location.name}
              </Text>

              <Text
                fontSize="sm"
                color="gray.600"
                noOfLines={2}
                lineHeight="tall"
                mb={3}
              >
                {location.description}
              </Text>

              <Text fontSize="xs" color="gray.400">
                Creada: {DateUtils.formatRelative(location.createdAt)}
              </Text>
            </Box>

            {/* Acciones */}
            {showActions && (
              <HStack justify="flex-end" pt={2}>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Acciones"
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<FiEdit />}
                      onClick={() => handleActionClick('edit')}
                    >
                      Editar
                    </MenuItem>

                    <MenuDivider />
                    
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => handleActionClick('delete')}
                      color="red.600"
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        itemName={location.name}
        itemType="ubicación"
      />
    </>
  );
}

function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} size="sm">
          <CardBody p={4}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Skeleton height="16px" width="16px" />
                  <Skeleton height="20px" width="40px" borderRadius="full" />
                </HStack>
                <Skeleton height="20px" width="60px" borderRadius="full" />
              </HStack>
              <SkeletonText noOfLines={3} spacing={2} />
              <Skeleton height="12px" width="60%" />
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function LocationList({
  onLocationSelect,
  onLocationEdit,
  onCreate,
  showActions = true,
}: LocationListProps) {
  const [filters, setFilters] = useState<LocationFilters>({
    search: '',
    active: undefined,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Queries y mutations
  const {
    data: locationsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useLocations(filters);

  const deleteMutation = useDeleteLocation();

  // Handlers
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleActiveFilterChange = (checked: boolean) => {
    setFilters(prev => ({ 
      ...prev, 
      active: checked ? true : undefined,
      page: 1 
    }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLocationEdit = (location: Location) => {
    if (onLocationEdit) {
      onLocationEdit(location);
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    try {
      await deleteMutation.mutateAsync(location._id);
      refetch();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // Renderizado condicional
  if (isLoading) {
    return <LoadingGrid />;
  }

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <VStack align="start" flex={1}>
          <Text fontWeight="semibold">Error al cargar ubicaciones</Text>
          <Text fontSize="sm">{error?.message}</Text>
          <Button size="sm" onClick={handleRefresh}>
            Reintentar
          </Button>
        </VStack>
      </Alert>
    );
  }

  // Manejo seguro de la respuesta
  let locations: Location[] = [];
  let totalCount = 0;
  let pagination: { total: number; page: number; totalPages: number } | null = null;

  if (locationsResponse) {
    if ('data' in locationsResponse && 'pagination' in locationsResponse) {
      // Es una respuesta paginada
      const response = locationsResponse as PaginatedResponse<Location>;
      locations = response.data;
      pagination = response.pagination;
      totalCount = pagination?.total || 0;
    } else if (Array.isArray(locationsResponse)) {
      // Es un array directo
      locations = locationsResponse;
      totalCount = locations.length;
    }
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        title="No se encontraron ubicaciones"
        description={
          filters.search || filters.active !== undefined
            ? 'Intente ajustar los filtros de búsqueda'
            : 'No hay ubicaciones registradas en el sistema'
        }
        icon={FiMapPin}
        onAction={onCreate}
        actionLabel="Crear Ubicación"
      />
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Filtros y acciones */}
      <HStack spacing={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar ubicaciones..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </InputGroup>

        <FormControl display="flex" alignItems="center" w="auto">
          <FormLabel htmlFor="active-filter" mb="0" fontSize="sm">
            Solo activas
          </FormLabel>
          <Switch
            id="active-filter"
            isChecked={filters.active === true}
            onChange={(e) => handleActiveFilterChange(e.target.checked)}
          />
        </FormControl>

        <HStack spacing={2} ml="auto">
          <IconButton
            aria-label="Refrescar"
            icon={<FiRefreshCw />}
            onClick={handleRefresh}
            isLoading={isRefetching}
            variant="ghost"
          />
          {onCreate && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onCreate}
            >
              Nueva Ubicación
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Lista de ubicaciones */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
        {locations.map((location: Location) => (
          <LocationCard
            key={location._id}
            location={location}
            onEdit={handleLocationEdit}
            onDelete={handleDeleteLocation}
            showActions={showActions}
          />
        ))}
      </SimpleGrid>

      {/* Información de paginación */}
      {pagination && (
        <HStack justify="center" p={4}>
          <Text fontSize="sm" color="gray.600">
            Mostrando {locations.length} de {totalCount} ubicaciones
            {pagination.totalPages > 1 && 
              ` - Página ${pagination.page} de ${pagination.totalPages}`
            }
          </Text>
        </HStack>
      )}
    </VStack>
  );
}