// src/app/admin/locations/LocationList.tsx - VERSIÓN CORREGIDA CON IMPORTS CORRECTOS
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
import { DateUtils, ResponseUtils, useExtractedData } from '@/utils';
import type { Location, LocationFilters } from '@/services/location.service';

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
              
              <HStack spacing={2}>
                <Badge
                  colorScheme={location.active ? 'green' : 'gray'}
                  variant="subtle"
                  fontSize="xs"
                >
                  {location.active ? 'Activa' : 'Inactiva'}
                </Badge>
                
                {showActions && (
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      _hover={{ bg: 'gray.100' }}
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
                )}
              </HStack>
            </HStack>

            {/* Content */}
            <VStack align="start" spacing={2} flex={1}>
              <Text fontWeight="semibold" fontSize="md" color="gray.800">
                {location.name}
              </Text>
              
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {location.description}
              </Text>
            </VStack>

            {/* Footer */}
            <Text fontSize="xs" color="gray.500">
              {DateUtils.formatDate(new Date(location.createdAt))}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
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

function LoadingGrid({ count = 8 }: { count?: number }) {
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

  const {
    data: locationsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useLocations(filters);

  const deleteMutation = useDeleteLocation();

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
    } else if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    try {
      await deleteMutation.mutateAsync(location._id);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // ✅ CORREGIDO: Uso de utilidad type-safe para extraer datos
  const { items: locations, totalCount } = useExtractedData(locationsResponse);
  
  // Debug en desarrollo
  ResponseUtils.debugResponseFormat(locationsResponse, 'LocationList');

  const isLoadingData = isLoading || isRefetching;
  const isMutating = deleteMutation.isPending;

  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar ubicaciones..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              bg="white"
            />
          </InputGroup>

          <HStack spacing={2}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={handleRefresh}
              isLoading={isLoadingData}
              size="md"
            >
              Actualizar
            </Button>

            {onCreate && (
              <Button
                leftIcon={<FiPlus />}
                colorScheme="green"
                onClick={onCreate}
                size="md"
              >
                Nueva Ubicación
              </Button>
            )}
          </HStack>
        </HStack>

        <HStack spacing={4}>
          <FormControl display="flex" alignItems="center" w="auto">
            <FormLabel htmlFor="active-filter" mb={0} fontSize="sm">
              Solo activas
            </FormLabel>
            <Switch
              id="active-filter"
              isChecked={filters.active === true}
              onChange={(e) => handleActiveFilterChange(e.target.checked)}
              colorScheme="green"
            />
          </FormControl>

          <Text fontSize="sm" color="gray.600">
            {totalCount === 0
              ? 'No se encontraron ubicaciones'
              : `${totalCount} ubicación${totalCount !== 1 ? 'es' : ''} encontrada${totalCount !== 1 ? 's' : ''}`
            }
          </Text>
        </HStack>
      </VStack>

      {isError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Error al cargar ubicaciones</Text>
            <Text fontSize="sm">
              {error?.message || 'No se pudieron cargar las ubicaciones. Intenta refrescar la página.'}
            </Text>
          </Box>
        </Alert>
      )}

      <Box position="relative">
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

        {isLoadingData ? (
          <LoadingGrid />
        ) : locations.length === 0 ? (
          <EmptyState
            icon={FiMapPin}
            title="No hay ubicaciones registradas"
            description={
              filters.search 
                ? `No se encontraron ubicaciones que coincidan con "${filters.search}"`
                : "Comienza creando ubicaciones para organizar físicamente tus recursos."
            }
            actionLabel={onCreate ? "Crear Primera Ubicación" : undefined}
            onAction={onCreate}
          />
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={4}
            opacity={isMutating ? 0.6 : 1}
            transition="opacity 0.2s"
          >
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
        )}
      </Box>

      {/* Información de ayuda */}
      {!isLoadingData && locations.length > 0 && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              Consejos para ubicaciones
            </Text>
            <Text fontSize="xs" color="gray.600">
              • Usa nombres descriptivos como "Estante A - Nivel 2" o "Armario Principal"<br />
              • Los códigos cortos facilitan la identificación rápida<br />
              • Las ubicaciones inactivas no aparecen en los formularios de recursos
            </Text>
          </Box>
        </Alert>
      )}
    </VStack>
  );
}