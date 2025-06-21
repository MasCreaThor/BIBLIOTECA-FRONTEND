// src/components/admin/resourceTypes/ResourceTypeList.tsx
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
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiBook,
  FiToggleLeft,
  FiToggleRight,
  FiShield,
  FiSettings,
} from 'react-icons/fi';
import { 
  useResourceTypes, 
  useDeleteResourceType,
  useActivateResourceType,
  useDeactivateResourceType 
} from '@/hooks/useResourceTypes';
import { DeleteConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateUtils } from '@/utils';
import type { ResourceType, ResourceTypeFilters } from '@/services/resourceType.service';

interface ResourceTypeListProps {
  onResourceTypeSelect?: (resourceType: ResourceType) => void;
  onResourceTypeEdit?: (resourceType: ResourceType) => void;
  onCreate?: () => void;
  showActions?: boolean;
}

const SYSTEM_RESOURCE_TYPE_CONFIGS = {
  book: { icon: '📚', label: 'Libro', color: 'blue' },
  game: { icon: '🎲', label: 'Juego', color: 'green' },
  map: { icon: '🗺️', label: 'Mapa', color: 'orange' },
  bible: { icon: '📖', label: 'Biblia', color: 'purple' },
} as const;

function ResourceTypeCard({
  resourceType,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
}: {
  resourceType: ResourceType;
  onEdit?: (resourceType: ResourceType) => void;
  onDelete?: (resourceType: ResourceType) => void;
  onToggleStatus?: (resourceType: ResourceType) => void;
  showActions?: boolean;
}) {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const handleActionClick = (action: 'edit' | 'delete' | 'toggle') => {
    switch (action) {
      case 'edit':
        onEdit?.(resourceType);
        break;
      case 'delete':
        onDeleteOpen();
        break;
      case 'toggle':
        onToggleStatus?.(resourceType);
        break;
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.(resourceType);
    onDeleteClose();
  };

  const isSystemType = resourceType.isSystem;
  const systemConfig = SYSTEM_RESOURCE_TYPE_CONFIGS[resourceType.name as keyof typeof SYSTEM_RESOURCE_TYPE_CONFIGS];
  
  const config = systemConfig || {
    icon: '📄',
    label: resourceType.name.charAt(0).toUpperCase() + resourceType.name.slice(1),
    color: 'gray'
  };

  return (
    <>
      <Card
        size="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        opacity={resourceType.active ? 1 : 0.7}
        border={resourceType.active ? '1px solid' : '2px dashed'}
        borderColor={resourceType.active ? 'gray.200' : 'gray.300'}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch" h="full">
            {/* Header */}
            <HStack justify="space-between" align="start">
              <HStack spacing={2}>
                <Text fontSize="lg">{config.icon}</Text>
                <VStack align="start" spacing={0}>
                  <HStack spacing={1}>
                    <Badge colorScheme={config.color} variant="solid" fontSize="xs">
                      {config.label}
                    </Badge>
                    {isSystemType && (
                      <Tooltip label="Tipo del sistema (predefinido)">
                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                          <FiShield size={10} />
                        </Badge>
                      </Tooltip>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">
                    {resourceType.name}
                  </Text>
                </VStack>
              </HStack>
              
              <VStack align="end" spacing={1}>
                <Badge
                  colorScheme={resourceType.active ? 'green' : 'gray'}
                  variant="subtle"
                  fontSize="xs"
                >
                  {resourceType.active ? 'Activo' : 'Inactivo'}
                </Badge>
                {isSystemType && (
                  <Tooltip label="Tipo del sistema">
                    <Icon as={FiSettings} color="blue.500" boxSize={3} />
                  </Tooltip>
                )}
              </VStack>
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
                {resourceType.description}
              </Text>

              <Text fontSize="xs" color="gray.400">
                Creado: {DateUtils.formatRelative(resourceType.createdAt)}
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
                      isDisabled={isSystemType}
                    >
                      Editar
                      {isSystemType && (
                        <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                          (No editable)
                        </Text>
                      )}
                    </MenuItem>

                    <MenuDivider />

                    <MenuItem
                      icon={resourceType.active ? <FiToggleLeft /> : <FiToggleRight />}
                      onClick={() => handleActionClick('toggle')}
                      color={resourceType.active ? "orange.600" : "green.600"}
                    >
                      {resourceType.active ? 'Desactivar' : 'Activar'}
                    </MenuItem>

                    <MenuDivider />
                    
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => handleActionClick('delete')}
                      color="red.600"
                      isDisabled={isSystemType}
                    >
                      Eliminar
                      {isSystemType && (
                        <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                          (No eliminable)
                        </Text>
                      )}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        itemName={resourceType.description}
        itemType="tipo de recurso"
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
                  <Skeleton height="20px" width="30px" />
                  <Skeleton height="20px" width="60px" borderRadius="full" />
                </HStack>
                <Skeleton height="20px" width="50px" borderRadius="full" />
              </HStack>
              <SkeletonText noOfLines={2} spacing={2} />
              <Skeleton height="12px" width="60%" />
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function ResourceTypeList({
  onResourceTypeSelect,
  onResourceTypeEdit,
  onCreate,
  showActions = true,
}: ResourceTypeListProps) {
  const [filters, setFilters] = useState<ResourceTypeFilters>({
    search: '',
    active: undefined,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const {
    data: resourceTypesResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useResourceTypes(filters);

  const deleteMutation = useDeleteResourceType();
  const activateMutation = useActivateResourceType();
  const deactivateMutation = useDeactivateResourceType();

  const toggleConfirm = useConfirmDialog({
    title: 'Cambiar Estado',
    message: '¿Estás seguro de que quieres cambiar el estado de este tipo de recurso?',
    variant: 'warning',
  });

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

  const handleResourceTypeEdit = (resourceType: ResourceType) => {
    if (onResourceTypeEdit) {
      onResourceTypeEdit(resourceType);
    } else if (onResourceTypeSelect) {
      onResourceTypeSelect(resourceType);
    }
  };

  const handleDeleteResourceType = async (resourceType: ResourceType) => {
    try {
      await deleteMutation.mutateAsync(resourceType._id);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleToggleStatus = async (resourceType: ResourceType) => {
    const confirmed = await toggleConfirm.confirm();
    if (!confirmed) return;

    try {
      if (resourceType.active) {
        await deactivateMutation.mutateAsync(resourceType._id);
      } else {
        await activateMutation.mutateAsync(resourceType._id);
      }
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // Estados derivados
  let resourceTypes: ResourceType[] = [];
  let totalCount = 0;

  if (resourceTypesResponse) {
    if (Array.isArray(resourceTypesResponse)) {
      resourceTypes = resourceTypesResponse as ResourceType[];
      totalCount = resourceTypes.length;
    } else if (resourceTypesResponse.data && Array.isArray(resourceTypesResponse.data)) {
      resourceTypes = resourceTypesResponse.data;
      totalCount = resourceTypesResponse.pagination?.total || resourceTypesResponse.data.length;
    }
  }

  const isLoadingData = isLoading || isRefetching;
  const isMutating = deleteMutation.isPending || 
                    activateMutation.isPending || 
                    deactivateMutation.isPending;

  return (
    <VStack spacing={6} align="stretch">
      {toggleConfirm.dialog}

      {/* Filtros */}
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar tipos de recursos..."
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
                colorScheme="purple"
                onClick={onCreate}
                size="md"
              >
                Nuevo Tipo
              </Button>
            )}
          </HStack>
        </HStack>

        <HStack spacing={4}>
          <FormControl display="flex" alignItems="center" w="auto">
            <FormLabel htmlFor="active-filter" mb={0} fontSize="sm">
              Solo activos
            </FormLabel>
            <Switch
              id="active-filter"
              isChecked={filters.active === true}
              onChange={(e) => handleActiveFilterChange(e.target.checked)}
              colorScheme="purple"
            />
          </FormControl>

          <Text fontSize="sm" color="gray.600">
            {totalCount === 0
              ? 'No se encontraron tipos de recursos'
              : `${totalCount} tipo${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`
            }
          </Text>
        </HStack>
      </VStack>

      {/* Estados de error */}
      {isError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Error al cargar tipos de recursos</Text>
            <Text fontSize="sm">
              {error?.message || 'No se pudieron cargar los tipos de recursos. Intenta refrescar la página.'}
            </Text>
          </Box>
        </Alert>
      )}

      {/* Contenido principal */}
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
        ) : resourceTypes.length === 0 ? (
          <EmptyState
            icon={FiBook}
            title="No hay tipos de recursos registrados"
            description={
              filters.search 
                ? `No se encontraron tipos que coincidan con "${filters.search}"`
                : "Los tipos de recursos definen las categorías principales de materiales en la biblioteca."
            }
            actionLabel={onCreate ? "Crear Primer Tipo" : undefined}
            onAction={onCreate}
          />
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={4}
            opacity={isMutating ? 0.6 : 1}
            transition="opacity 0.2s"
          >
            {resourceTypes.map((resourceType: ResourceType) => (
              <ResourceTypeCard
                key={resourceType._id}
                resourceType={resourceType}
                onEdit={handleResourceTypeEdit}
                onDelete={handleDeleteResourceType}
                onToggleStatus={handleToggleStatus}
                showActions={showActions}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Información de ayuda */}
      {!isLoadingData && resourceTypes.length > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              ⚠️ Configuración del Sistema
            </Text>
            <Text fontSize="xs" color="gray.600">
              Los tipos de recursos son configuraciones fundamentales del sistema. Los cambios afectan a todo el inventario.
              Solo los administradores pueden modificar estos elementos.
            </Text>
          </Box>
        </Alert>
      )}
    </VStack>
  );
}