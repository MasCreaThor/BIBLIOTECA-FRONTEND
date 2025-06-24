// src/components/resources/ResourceList/ResourceFilters.tsx
'use client';

import {
  Box,
  HStack,
  VStack,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Button,
  IconButton,
  Collapse,
  Card,
  CardBody,
  Text,
  Badge,
  useDisclosure,
  useColorModeValue,
  SimpleGrid,
  FormControl,
  FormLabel,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiBook,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import { useCategories, useLocations, useResourceTypes } from '@/hooks/useResources';
import type { ResourceFilters, ResourceType } from '@/types/resource.types';
import { PaginatedResponse } from '@/types/api.types';

export interface ResourceFiltersState {
  search: string;
  categoryId: string;
  typeId: string;
  locationId: string;
  availability: '' | 'available' | 'borrowed';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ResourceFiltersProps {
  filters: ResourceFiltersState;
  onFiltersChange: (filters: ResourceFiltersState) => void;
  onRefresh?: () => void;
  resultCount?: number;
  isLoading?: boolean;
  showResultCount?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const defaultFilters: ResourceFiltersState = {
  search: '',
  categoryId: '',
  typeId: '',
  locationId: '',
  availability: '',
  sortBy: 'title',
  sortOrder: 'asc',
};

const RESOURCE_TYPE_CONFIGS = {
  book: { label: '📚 Libros', color: 'blue' },
  game: { label: '🎲 Juegos', color: 'green' },
  map: { label: '🗺️ Mapas', color: 'orange' },
  bible: { label: '📖 Biblias', color: 'purple' },
};

export function ResourceFiltersComponent({
  filters,
  onFiltersChange,
  onRefresh,
  resultCount,
  isLoading = false,
  showResultCount = true,
  viewMode = 'grid',
  onViewModeChange,
}: ResourceFiltersProps) {
  const { isOpen: isExpanded, onToggle } = useDisclosure();
  const [localFilters, setLocalFilters] = useState<ResourceFiltersState>(filters);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Queries para datos auxiliares
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  const { data: resourceTypesResponse } = useResourceTypes();
  const resourceTypes = resourceTypesResponse?.data || [];

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Debounced search
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      onFiltersChange({
        ...localFilters,
        search: searchTerm,
      });
    }, 300);

    setSearchDebounceTimer(timer);
  }, [localFilters, onFiltersChange, searchDebounceTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  const handleSearchChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, search: value }));
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof ResourceFiltersState, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.search !== '' ||
      localFilters.categoryId !== '' ||
      localFilters.typeId !== '' ||
      localFilters.locationId !== '' ||
      localFilters.availability !== '' ||
      localFilters.sortBy !== 'title' ||
      localFilters.sortOrder !== 'asc'
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.categoryId) count++;
    if (localFilters.typeId) count++;
    if (localFilters.locationId) count++;
    if (localFilters.availability) count++;
    if (localFilters.sortBy !== 'title' || localFilters.sortOrder !== 'asc') count++;
    return count;
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Barra principal */}
      <HStack spacing={4}>
        {/* Búsqueda */}
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por título"
            value={localFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            bg={bg}
            borderColor={borderColor}
          />
        </InputGroup>

        {/* Controles */}
        <HStack spacing={2}>
          {/* Modo de vista */}
          {onViewModeChange && (
            <HStack spacing={0} border="1px" borderColor={borderColor} borderRadius="md">
              <IconButton
                aria-label="Vista en grilla"
                icon={<FiGrid />}
                size="sm"
                variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
                borderRadius="none"
                borderRightRadius="none"
                onClick={() => onViewModeChange('grid')}
              />
              <IconButton
                aria-label="Vista en lista"
                icon={<FiList />}
                size="sm"
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                borderRadius="none"
                borderLeftRadius="none"
                onClick={() => onViewModeChange('list')}
              />
            </HStack>
          )}

          {/* Filtros */}
          <Button
            leftIcon={<FiFilter />}
            variant="outline"
            onClick={onToggle}
            colorScheme={hasActiveFilters() ? 'blue' : 'gray'}
            size="md"
          >
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>

          {/* Refrescar */}
          {onRefresh && (
            <Tooltip label="Actualizar datos">
              <IconButton
                aria-label="Actualizar"
                icon={<FiRefreshCw />}
                variant="outline"
                onClick={onRefresh}
                isLoading={isLoading}
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      {/* Información de resultados */}
      {showResultCount && typeof resultCount === 'number' && (
        <HStack justify="space-between" color="gray.600" fontSize="sm">
          <Text>
            {resultCount === 0
              ? 'No se encontraron recursos'
              : `${resultCount} recurso${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''}`
            }
          </Text>
          
          {hasActiveFilters() && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FiX />}
              onClick={handleClearFilters}
              color="gray.500"
            >
              Limpiar filtros
            </Button>
          )}
        </HStack>
      )}

      {/* Filtros avanzados */}
      <Collapse in={isExpanded} animateOpacity>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium" color="gray.700">
                Filtros Avanzados
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                {/* Tipo de recurso */}
                <FormControl>
                  <FormLabel fontSize="sm">Tipo de Recurso</FormLabel>
                  <Select
                    value={localFilters.typeId}
                    onChange={(e) => handleFilterChange('typeId', e.target.value)}
                    placeholder="Todos los tipos"
                    size="sm"
                  >
                    {resourceTypes.map((type: ResourceType) => {
                      const config = RESOURCE_TYPE_CONFIGS[type.name as keyof typeof RESOURCE_TYPE_CONFIGS];
                      return (
                        <option key={type._id} value={type._id}>
                          {config?.label || type.description}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>

                {/* Categoría */}
                <FormControl>
                  <FormLabel fontSize="sm">Categoría</FormLabel>
                  <Select
                    value={localFilters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    placeholder="Todas las categorías"
                    size="sm"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Ubicación */}
                <FormControl>
                  <FormLabel fontSize="sm">Ubicación</FormLabel>
                  <Select
                    value={localFilters.locationId}
                    onChange={(e) => handleFilterChange('locationId', e.target.value)}
                    placeholder="Todas las ubicaciones"
                    size="sm"
                  >
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Disponibilidad */}
                <FormControl>
                  <FormLabel fontSize="sm">Disponibilidad</FormLabel>
                  <Select
                    value={localFilters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    placeholder="Todas las disponibilidades"
                    size="sm"
                  >
                    <option value="available">Disponibles</option>
                    <option value="borrowed">Prestados</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Ordenamiento */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Ordenar por</FormLabel>
                  <Select
                    value={localFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    size="sm"
                  >
                    <option value="title">Título</option>
                    <option value="createdAt">Fecha de registro</option>
                    <option value="updatedAt">Última actualización</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Orden</FormLabel>
                  <Select
                    value={localFilters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                    size="sm"
                  >
                    <option value="asc">A-Z / Más antiguo</option>
                    <option value="desc">Z-A / Más reciente</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Acciones */}
              <HStack justify="flex-end" pt={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters()}
                  leftIcon={<FiX />}
                >
                  Limpiar filtros
                </Button>
                <Button
                  size="sm"
                  onClick={onToggle}
                  variant="outline"
                >
                  Cerrar
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Collapse>

      {/* Filtros activos (tags) */}
      {hasActiveFilters() && (
        <HStack wrap="wrap" spacing={2}>
          {localFilters.typeId && (
            <Badge colorScheme="blue" variant="subtle" display="flex" alignItems="center" gap={1}>
              <FiBook size={12} />
              Tipo: {resourceTypes.find(t => t._id === localFilters.typeId)?.description}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('typeId', '')}
                ml={1}
                h="auto"
                minW="auto"
                p={0}
              />
            </Badge>
          )}

          {localFilters.categoryId && (
            <Badge colorScheme="green" variant="subtle" display="flex" alignItems="center" gap={1}>
              Categoría: {categories.find(c => c._id === localFilters.categoryId)?.name}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('categoryId', '')}
                ml={1}
                h="auto"
                minW="auto"
                p={0}
              />
            </Badge>
          )}

          {localFilters.locationId && (
            <Badge colorScheme="orange" variant="subtle" display="flex" alignItems="center" gap={1}>
              Ubicación: {locations.find(l => l._id === localFilters.locationId)?.name}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('locationId', '')}
                ml={1}
                h="auto"
                minW="auto"
                p={0}
              />
            </Badge>
          )}

          {localFilters.availability && (
            <Badge
              colorScheme={localFilters.availability === 'available' ? 'green' : 'red'}
              variant="subtle"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {localFilters.availability === 'available' ? 'Disponibles' : 'Prestados'}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('availability', '')}
                ml={1}
                h="auto"
                minW="auto"
                p={0}
              />
            </Badge>
          )}
        </HStack>
      )}
    </VStack>
  );
}