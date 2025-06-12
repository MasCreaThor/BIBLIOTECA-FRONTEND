// src/components/admin/resourceStates/ResourceStateList.tsx
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
  FiCheckCircle,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';
import { 
  useResourceStates, 
  useDeleteResourceState,
  useActivateResourceState,
  useDeactivateResourceState 
} from '@/hooks/useResourceStates';
import { DeleteConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateUtils } from '@/utils';
import type { ResourceState, ResourceStateFilters } from '@/services/resourceState.service';

interface ResourceStateListProps {
  onResourceStateSelect?: (resourceState: ResourceState) => void;
  onResourceStateEdit?: (resourceState: ResourceState) => void;
  onCreate?: () => void;
  showActions?: boolean;
}

const RESOURCE_STATE_CONFIGS = {
  good: { icon: '✅', label: 'Buen Estado', color: 'green' },
  deteriorated: { icon: '⚠️', label: 'Deteriorado', color: 'orange' },
  damaged: { icon: '❌', label: 'Dañado', color: 'red' },
  lost: { icon: '🔍', label: 'Perdido', color: 'gray' },
};

function ResourceStateCard({
  resourceState,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
}: {
  resourceState: ResourceState;
  onEdit?: (resourceState: ResourceState) => void;
  onDelete?: (resourceState: ResourceState) => void;
  onToggleStatus?: (resourceState: ResourceState) => void;
  showActions?: boolean;
}) {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const handleActionClick = (action: 'edit' | 'delete' | 'toggle') => {
    switch (action) {
      case 'edit':
        onEdit?.(resourceState);
        break;
      case 'delete':
        onDeleteOpen();
        break;
      case 'toggle':
        onToggleStatus?.(resourceState);
        break;
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.(resourceState);
    onDeleteClose();
  };

  const config = RESOURCE_STATE_CONFIGS[resourceState.name as keyof typeof RESOURCE_STATE_CONFIGS] || {
    icon: '📄',
    label: resourceState.name,
    color: 'gray'
  };

  return (
    <>
      <Card
        size="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        opacity={resourceState.active ? 1 : 0.7}
        border={resourceState.active ? '1px solid' : '2px dashed'}
        borderColor={resourceState.active ? 'gray.200' : 'gray.300'}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch" h="full">
            {/* Header */}
            <HStack justify="space-between" align="start">
              <HStack spacing={2}>
                <Box
                  w={4}
                  h={4}
                  borderRadius="full"
                  bg={resourceState.color}
                  flexShrink={0}
                />
                <Text fontSize="lg">{config.icon}</Text>
                <Badge colorScheme={config.color} variant="solid" fontSize="xs">
                  {config.label}
                </Badge>
              </HStack>
              
              <Badge
                colorScheme={resourceState.active ? 'green' : 'gray'}
                variant="subtle"
                fontSize="xs"
              >
                {resourceState.active ? 'Activo' : 'Inactivo'}
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
                {resourceState.description}
              </Text>

              <Text fontSize="xs" color="gray.400">
                Creado: {DateUtils.formatRelative(resourceState.createdAt)}
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
                      icon={resourceState.active ? <FiToggleLeft /> : <FiToggleRight />}
                      onClick={() => handleActionClick('toggle')}
                      color={resourceState.active ? "orange.600" : "green.600"}
                    >
                      {resourceState.active ? 'Desactivar' : 'Activar'}
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

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        itemName={resourceState.description}
        itemType="estado de recurso"
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
                  <Skeleton height="16px" width="16px" borderRadius="full" />
                  <Skeleton height="20px" width="30px" />
                  <Skeleton height="20px" width="80px" borderRadius="full" />
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

export function ResourceStateList({
  onResourceStateSelect,
  onResourceStateEdit,
  onCreate,
  showActions = true,
}: ResourceStateListProps) {
  const [filters, setFilters] = useState<ResourceStateFilters>({
    search: '',
    active: undefined,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const {
    data: resourceStatesResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useResourceStates(filters);

  const deleteMutation = useDeleteResourceState();
  const activateMutation = useActivateResourceState();
  const deactivateMutation = useDeactivateResourceState();

  const toggleConfirm = useConfirmDialog({
    title: 'Cambiar Estado',
    message: '¿Estás seguro de que quieres cambiar el estado de este estado de recurso?',
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

  const handleResourceStateEdit = (resourceState: ResourceState) => {
    if (onResourceStateEdit) {
      onResourceStateEdit(resourceState);
    } else if (onResourceStateSelect) {
      onResourceStateSelect(resourceState);
    }
  };

  const handleDeleteResourceState = async (resourceState: ResourceState) => {
    try {
      await deleteMutation.mutateAsync(resourceState._id);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleToggleStatus = async (resourceState: ResourceState) => {
    const confirmed = await toggleConfirm.confirm();
    if (!confirmed) return;

    try {
      if (resourceState.active) {
        await deactivateMutation.mutateAsync(resourceState._id);
      } else {
        await activateMutation.mutateAsync(resourceState._id);
      }
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // Estados derivados
  let resourceStates: ResourceState[] = [];
  let totalCount = 0;

  if (resourceStatesResponse) {
    if (Array.isArray(resourceStatesResponse)) {
      resourceStates = resourceStatesResponse as ResourceState[];
      totalCount = resourceStates.length;
    } else if (resourceStatesResponse.data && Array.isArray(resourceStatesResponse.data)) {
      resourceStates = resourceStatesResponse.data;
      totalCount = resourceStatesResponse.pagination?.total || resourceStatesResponse.data.length;
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
              placeholder="Buscar estados de recursos..."
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
                colorScheme="orange"
                onClick={onCreate}
                size="md"
              >
                Nuevo Estado
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
              colorScheme="orange"
            />
          </FormControl>

          <Text fontSize="sm" color="gray.600">
            {totalCount === 0
              ? 'No se encontraron estados de recursos'
              : `${totalCount} estado${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`
            }
          </Text>
        </HStack>
      </VStack>

      {/* Estados de error */}
      {isError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Error al cargar estados de recursos</Text>
            <Text fontSize="sm">
              {error?.message || 'No se pudieron cargar los estados de recursos. Intenta refrescar la página.'}
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
        ) : resourceStates.length === 0 ? (
          <EmptyState
            icon={FiCheckCircle}
            title="No hay estados de recursos registrados"
            description={
              filters.search 
                ? `No se encontraron estados que coincidan con "${filters.search}"`
                : "Los estados de recursos indican la condición física de los materiales en la biblioteca."
            }
            actionLabel={onCreate ? "Crear Primer Estado" : undefined}
            onAction={onCreate}
          />
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={4}
            opacity={isMutating ? 0.6 : 1}
            transition="opacity 0.2s"
          >
            {resourceStates.map((resourceState: ResourceState) => (
              <ResourceStateCard
                key={resourceState._id}
                resourceState={resourceState}
                onEdit={handleResourceStateEdit}
                onDelete={handleDeleteResourceState}
                onToggleStatus={handleToggleStatus}
                showActions={showActions}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Información de ayuda */}
      {!isLoadingData && resourceStates.length > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              ⚠️ Configuración del Sistema
            </Text>
            <Text fontSize="xs" color="gray.600">
              Los estados de recursos son configuraciones fundamentales para el control de inventario. Los cambios afectan a todo el sistema.
              Solo los administradores pueden modificar estos elementos.
            </Text>
          </Box>
        </Alert>
      )}
    </VStack>
  );
}