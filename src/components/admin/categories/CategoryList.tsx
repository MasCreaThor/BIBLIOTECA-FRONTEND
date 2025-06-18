// src/components/admin/categories/CategoryList.tsx
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
  FiGrid,
} from 'react-icons/fi';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { DeleteConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateUtils } from '@/utils';
import type { Category, CategoryFilters } from '@/services/category.service';
import type { PaginatedResponse } from '@/types/api.types';

interface CategoryListProps {
  onCategorySelect?: (category: Category) => void;
  onCategoryEdit?: (category: Category) => void;
  onCreate?: () => void;
  showActions?: boolean;
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  showActions = true,
}: {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  showActions?: boolean;
}) {
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const handleActionClick = (action: 'edit' | 'delete') => {
    switch (action) {
      case 'edit':
        onEdit?.(category);
        break;
      case 'delete':
        onDeleteOpen();
        break;
    }
  };

  const handleConfirmDelete = () => {
    onDelete?.(category);
    onDeleteClose();
  };

  return (
    <>
      <Card
        size="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        opacity={category.active ? 1 : 0.6}
        border={category.active ? '1px solid' : '2px dashed'}
        borderColor={category.active ? 'gray.200' : 'gray.300'}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch" h="full">
            {/* Header */}
            <HStack justify="space-between" align="start">
              <Box
                w={4}
                h={4}
                borderRadius="full"
                bg={category.color}
                flexShrink={0}
              />
              
              <Badge
                colorScheme={category.active ? 'green' : 'gray'}
                variant="subtle"
                fontSize="xs"
              >
                {category.active ? 'Activa' : 'Inactiva'}
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
                {category.name}
              </Text>

              <Text
                fontSize="sm"
                color="gray.600"
                noOfLines={2}
                lineHeight="tall"
                mb={3}
              >
                {category.description}
              </Text>

              <Text fontSize="xs" color="gray.400">
                Creada: {DateUtils.formatRelative(category.createdAt)}
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
        itemName={category.name}
        itemType="categoría"
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
                <Skeleton height="16px" width="16px" borderRadius="full" />
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

export function CategoryList({
  onCategorySelect,
  onCategoryEdit,
  onCreate,
  showActions = true,
}: CategoryListProps) {
  const [filters, setFilters] = useState<CategoryFilters>({
    search: '',
    active: undefined,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Queries y mutations
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCategories(filters);

  const deleteMutation = useDeleteCategory();

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

  const handleCategoryEdit = (category: Category) => {
    if (onCategoryEdit) {
      onCategoryEdit(category);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteMutation.mutateAsync(category._id);
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
          <Text fontWeight="semibold">Error al cargar categorías</Text>
          <Text fontSize="sm">{error?.message}</Text>
          <Button size="sm" onClick={handleRefresh}>
            Reintentar
          </Button>
        </VStack>
      </Alert>
    );
  }

  // Manejo seguro de la respuesta
  let categories: Category[] = [];
  let totalCount = 0;
  let pagination: { total: number; page: number; totalPages: number } | null = null;

  if (categoriesResponse) {
    if ('data' in categoriesResponse && 'pagination' in categoriesResponse) {
      // Es una respuesta paginada
      const response = categoriesResponse as PaginatedResponse<Category>;
      categories = response.data;
      pagination = response.pagination;
      totalCount = pagination.total;
    } else if (Array.isArray(categoriesResponse)) {
      // Es un array directo
      categories = categoriesResponse;
      totalCount = categories.length;
    }
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title="No se encontraron categorías"
        description={
          filters.search || filters.active !== undefined
            ? 'Intente ajustar los filtros de búsqueda'
            : 'No hay categorías registradas en el sistema'
        }
        icon={FiGrid}
        onAction={onCreate}
        actionLabel="Crear Categoría"
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
            placeholder="Buscar categorías..."
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
              Nueva Categoría
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Lista de categorías */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
        {categories.map((category: Category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={handleCategoryEdit}
            onDelete={handleDeleteCategory}
            showActions={showActions}
          />
        ))}
      </SimpleGrid>

      {/* Información de paginación */}
      {pagination && (
        <HStack justify="center" p={4}>
          <Text fontSize="sm" color="gray.600">
            Mostrando {categories.length} de {totalCount} categorías
            {pagination.totalPages > 1 && 
              ` - Página ${pagination.page} de ${pagination.totalPages}`
            }
          </Text>
        </HStack>
      )}
    </VStack>
  );
}