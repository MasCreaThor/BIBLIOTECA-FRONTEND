// src/components/people/PeopleFilters.tsx
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
  Skeleton,
  FormControl,
  FormLabel,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiUsers,
  FiBook,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';
import { usePersonTypes } from '@/hooks/usePeople';
import type { SearchFilters } from '@/types/api.types';
import { TextUtils } from '@/utils';

export interface PeopleFiltersState {
  search: string;
  personType: 'student' | 'teacher' | '';
  status: 'active' | 'inactive' | '';
  grade: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PeopleFiltersProps {
  filters: PeopleFiltersState;
  onFiltersChange: (filters: PeopleFiltersState) => void;
  onRefresh?: () => void;
  resultCount?: number;
  isLoading?: boolean;
  showResultCount?: boolean;
}

const defaultFilters: PeopleFiltersState = {
  search: '',
  personType: '',
  status: '',
  grade: '',
  sortBy: 'firstName',
  sortOrder: 'asc',
};

export function PeopleFilters({
  filters,
  onFiltersChange,
  onRefresh,
  resultCount,
  isLoading = false,
  showResultCount = true,
}: PeopleFiltersProps) {
  const { isOpen: isExpanded, onToggle } = useDisclosure();
  const { data: personTypes, isLoading: isLoadingTypes } = usePersonTypes();
  
  const [localFilters, setLocalFilters] = useState<PeopleFiltersState>(filters);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

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

  const handleFilterChange = (key: keyof PeopleFiltersState, value: string) => {
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
      localFilters.personType !== '' ||
      localFilters.status !== '' ||
      localFilters.grade !== '' ||
      localFilters.sortBy !== 'firstName' ||
      localFilters.sortOrder !== 'asc'
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.personType) count++;
    if (localFilters.status) count++;
    if (localFilters.grade) count++;
    if (localFilters.sortBy !== 'firstName' || localFilters.sortOrder !== 'asc') count++;
    return count;
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Barra de búsqueda principal */}
      <HStack spacing={4}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nombre, apellido o documento..."
            value={localFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            bg={bg}
            borderColor={borderColor}
          />
        </InputGroup>

        <Button
          leftIcon={<FiFilter />}
          variant="outline"
          onClick={onToggle}
          colorScheme={hasActiveFilters() ? 'blue' : 'gray'}
        >
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge ml={2} colorScheme="blue" borderRadius="full">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

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

      {/* Información de resultados */}
      {showResultCount && typeof resultCount === 'number' && (
        <HStack justify="space-between" color="gray.600" fontSize="sm">
          <Text>
            {resultCount === 0
              ? 'No se encontraron personas'
              : `${resultCount} persona${resultCount !== 1 ? 's' : ''} encontrada${resultCount !== 1 ? 's' : ''}`
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
                {/* Tipo de persona */}
                <FormControl>
                  <FormLabel fontSize="sm">Tipo de Persona</FormLabel>
                  {isLoadingTypes ? (
                    <Skeleton height="40px" />
                  ) : (
                    <Select
                      value={localFilters.personType}
                      onChange={(e) => handleFilterChange('personType', e.target.value)}
                      placeholder="Todos los tipos"
                      size="sm"
                    >
                      {personTypes?.map((type) => (
                        <option key={type._id} value={type.name}>
                          {type.description}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>

                {/* Estado */}
                <FormControl>
                  <FormLabel fontSize="sm">Estado</FormLabel>
                  <Select
                    value={localFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    placeholder="Todos los estados"
                    size="sm"
                  >
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </Select>
                </FormControl>

                {/* Grado/Área */}
                <FormControl>
                  <FormLabel fontSize="sm">Grado/Área</FormLabel>
                  <Input
                    value={localFilters.grade}
                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                    placeholder="Filtrar por grado o área"
                    size="sm"
                  />
                </FormControl>

                {/* Ordenamiento */}
                <FormControl>
                  <FormLabel fontSize="sm">Ordenar por</FormLabel>
                  <HStack spacing={2}>
                    <Select
                      value={localFilters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      size="sm"
                      flex={2}
                    >
                      <option value="firstName">Nombre</option>
                      <option value="lastName">Apellido</option>
                      <option value="createdAt">Fecha de registro</option>
                      <option value="documentNumber">Documento</option>
                      <option value="grade">Grado/Área</option>
                    </Select>
                    <Select
                      value={localFilters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                      size="sm"
                      flex={1}
                    >
                      <option value="asc">A-Z</option>
                      <option value="desc">Z-A</option>
                    </Select>
                  </HStack>
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
          {localFilters.personType && (
            <Badge
              colorScheme="blue"
              variant="subtle"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <FiUsers size={12} />
              Tipo: {personTypes?.find(t => t.name === localFilters.personType)?.description}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('personType', '')}
                ml={1}
                h="auto"
                minW="auto"
                p={0}
              />
            </Badge>
          )}

          {localFilters.status && (
            <Badge
              colorScheme={localFilters.status === 'active' ? 'green' : 'red'}
              variant="subtle"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {localFilters.status === 'active' ? <FiUserCheck size={12} /> : <FiUserX size={12} />}
              {localFilters.status === 'active' ? 'Activos' : 'Inactivos'}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('status', '')}
                ml={1}
                h="auto"
                minW="auto"
                p={0}
              />
            </Badge>
          )}

          {localFilters.grade && (
            <Badge
              colorScheme="purple"
              variant="subtle"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <FiBook size={12} />
              Grado: {localFilters.grade}
              <IconButton
                aria-label="Remover filtro"
                icon={<FiX />}
                size="xs"
                variant="ghost"
                onClick={() => handleFilterChange('grade', '')}
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