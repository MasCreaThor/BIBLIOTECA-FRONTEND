// src/components/resources/ResourceList/ResourceList.tsx
'use client';

import {
  Box,
  SimpleGrid,
  VStack,
  Flex,
  Text,
  Card,
  CardBody,
  HStack,
  Button,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { ResourceCard } from './ResourceCard';
import { ResourceFilters, type ResourceFiltersState } from './ResourceFilters';
import { EmptyResources } from '@/components/ui/EmptyState';
import { useResources, useUpdateResourceAvailability, useDeleteResource } from '@/hooks/useResources';
import type { Resource, ResourceFilters as APIResourceFilters } from '@/types/resource.types';

interface ResourceListProps {
  initialFilters?: Partial<ResourceFiltersState>;
  onResourceSelect?: (resource: Resource) => void;
  onResourceEdit?: (resource: Resource) => void;
  onCreate?: () => void;
  showActions?: boolean;
  isCompact?: boolean;
}

function LoadingGrid({ count = 12, isCompact = false }: { count?: number; isCompact?: boolean }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} size="sm">
          <CardBody p={isCompact ? 3 : 4}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Skeleton height="20px" width="60px" borderRadius="full" />
                <Skeleton height="20px" width="80px" borderRadius="full" />
              </HStack>
              <SkeletonText noOfLines={3} spacing={2} />
              <Skeleton height="16px" width="40%" />
              <HStack justify="space-between">
                <Skeleton height="24px" width="60px" />
                <Skeleton height="24px" width="24px" borderRadius="md" />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function ResourceList({
  initialFilters = {},
  onResourceSelect,
  onResourceEdit,
  onCreate,
  showActions = true,
  isCompact = false,
}: ResourceListProps) {
  // Estado local para filtros y vista
  const [filters, setFilters] = useState<ResourceFiltersState>({
    search: '',
    categoryId: '',
    typeId: '',
    locationId: '',
    availability: '',
    sortBy: 'title',
    sortOrder: 'asc',
    ...initialFilters,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Convertir filtros locales a formato de API
  const apiFilters: APIResourceFilters = useMemo(() => {
    const result: APIResourceFilters = {
      page: 1,
      limit: 20,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.search.trim()) result.search = filters.search.trim();
    if (filters.categoryId) result.categoryId = filters.categoryId;
    if (filters.typeId) result.typeId = filters.typeId;
    if (filters.locationId) result.locationId = filters.locationId;
    if (filters.availability) result.availability = filters.availability;

    return result;
  }, [filters]);

  // Queries y mutations
  const {
    data: resourcesResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useResources(apiFilters);

  const updateAvailabilityMutation = useUpdateResourceAvailability();
  const deleteMutation = useDeleteResource();

  // Handlers
  const handleFiltersChange = (newFilters: ResourceFiltersState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleResourceEdit = (resource: Resource) => {
    if (onResourceEdit) {
      onResourceEdit(resource);
    } else if (onResourceSelect) {
      onResourceSelect(resource);
    }
  };

  const handleToggleAvailability = async (resource: Resource) => {
    try {
      await updateAvailabilityMutation.mutateAsync({
        id: resource._id,
        available: !resource.available,
      });
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    try {
      await deleteMutation.mutateAsync(resource._id);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // ✅ CORREGIDO: Estados derivados para trabajar con array directo
  const resources: Resource[] = resourcesResponse || [];
  const totalCount = resources.length;
  const isLoadingData = isLoading || isRefetching;
  const isMutating = updateAvailabilityMutation.isPending || deleteMutation.isPending;

  return (
    <VStack spacing={6} align="stretch">
      {/* Filtros */}
      <ResourceFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        resultCount={totalCount}
        isLoading={isLoadingData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Estados de error */}
      {isError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error al cargar recursos</AlertTitle>
            <AlertDescription>
              {error?.message || 'No se pudieron cargar los recursos. Intenta refrescar la página.'}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Contenido principal */}
      <Box position="relative">
        {/* Overlay de loading para mutaciones */}
        {isMutating && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(255, 255, 255, 0.8)"
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
          >
            <Text>Procesando...</Text>
          </Box>
        )}

        {/* Lista de recursos */}
        {isLoadingData ? (
          <LoadingGrid isCompact={isCompact} />
        ) : resources.length === 0 ? (
          <EmptyResources onCreate={onCreate} />
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={4}
            opacity={isMutating ? 0.6 : 1}
            transition="opacity 0.2s"
          >
            {resources.map((resource: Resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onEdit={handleResourceEdit}
                onToggleAvailability={handleToggleAvailability}
                onDelete={handleDeleteResource}
                showActions={showActions}
                isCompact={isCompact}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ✅ REMOVIDO: Sección de paginación ya que no hay paginación en el backend */}
      
      {/* Información del total de resultados */}
      {!isLoadingData && resources.length > 0 && (
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Mostrando {resources.length} recurso{resources.length !== 1 ? 's' : ''} en total
            </Text>
          </CardBody>
        </Card>
      )}

      {/* Información adicional */}
      {!isLoadingData && resources.length > 0 && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Consejo</AlertTitle>
            <AlertDescription fontSize="sm">
              Haz clic en "Ver" para ver los detalles completos de un recurso, o usa el menú (⋮) para más opciones.
              Los recursos marcados como "Prestado" aparecen con borde naranja.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  );
}