// components/loans/LoanFilters/LoanFilters.tsx
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
  FormControl,
  FormLabel,
  Switch,
  Badge,
  Text,
  Collapse,
  useDisclosure,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { LoanSearchFilters } from '@/types/loan.types';

interface LoanFiltersProps {
  filters: LoanSearchFilters;
  onFiltersChange: (filters: Partial<LoanSearchFilters>) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function LoanFilters({
  filters,
  onFiltersChange,
  onClear,
  isLoading = false,
}: LoanFiltersProps) {
  const { isOpen, onToggle } = useDisclosure();
  const [localFilters, setLocalFilters] = useState<LoanSearchFilters>(filters);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (key: keyof LoanSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange({ [key]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.isOverdue !== undefined) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.personId) count++;
    if (filters.resourceId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" overflow="hidden">
      {/* Header */}
      <HStack p={4} justify="space-between" bg={useColorModeValue('gray.50', 'gray.700')}>
        <HStack spacing={3}>
          <Button
            leftIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
            rightIcon={<FiFilter />}
            onClick={onToggle}
            variant="ghost"
            size="sm"
          >
            Filtros
          </Button>
          {activeFiltersCount > 0 && (
            <Badge colorScheme="blue" fontSize="xs">
              {activeFiltersCount} activos
            </Badge>
          )}
        </HStack>
        
        <HStack spacing={2}>
          {activeFiltersCount > 0 && (
            <Button
              leftIcon={<FiX />}
              onClick={onClear}
              variant="ghost"
              size="sm"
              colorScheme="red"
            >
              Limpiar
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Filtro de búsqueda básica (siempre visible) */}
      <Box p={4}>
        <InputGroup>
          <InputLeftElement>
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Buscar por persona, recurso o documento..."
            value={localFilters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </InputGroup>
      </Box>

      {/* Filtros avanzados */}
      <Collapse in={isOpen}>
        <Box p={4} pt={0}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} align="end">
              {/* Estado */}
              <FormControl>
                <FormLabel fontSize="sm">Estado</FormLabel>
                <Select
                  placeholder="Todos los estados"
                  value={localFilters.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value || undefined)}
                  size="sm"
                >
                  <option value="active">Activos</option>
                  <option value="returned">Devueltos</option>
                  <option value="overdue">Vencidos</option>
                  <option value="lost">Perdidos</option>
                </Select>
              </FormControl>

              {/* Vencimiento */}
              <FormControl>
                <FormLabel fontSize="sm">Vencimiento</FormLabel>
                <Select
                  placeholder="Todos"
                  value={
                    localFilters.isOverdue === true ? 'true' : 
                    localFilters.isOverdue === false ? 'false' : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('isOverdue', 
                      value === 'true' ? true : 
                      value === 'false' ? false : 
                      undefined
                    );
                  }}
                  size="sm"
                >
                  <option value="false">Al día</option>
                  <option value="true">Vencidos</option>
                </Select>
              </FormControl>

              {/* Días vencidos */}
              <FormControl>
                <FormLabel fontSize="sm">Días vencidos (mín.)</FormLabel>
                <Input
                  type="number"
                  placeholder="Días"
                  value={localFilters.daysOverdue || ''}
                  onChange={(e) => handleInputChange('daysOverdue', 
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  size="sm"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} align="end">
              {/* Fecha desde */}
              <FormControl>
                <FormLabel fontSize="sm">Fecha desde</FormLabel>
                <Input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value || undefined)}
                  size="sm"
                />
              </FormControl>

              {/* Fecha hasta */}
              <FormControl>
                <FormLabel fontSize="sm">Fecha hasta</FormLabel>
                <Input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => handleInputChange('dateTo', e.target.value || undefined)}
                  size="sm"
                />
              </FormControl>

              {/* Ordenamiento */}
              <FormControl>
                <FormLabel fontSize="sm">Ordenar por</FormLabel>
                <Select
                  value={localFilters.sortBy || 'loanDate'}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  size="sm"
                >
                  <option value="loanDate">Fecha de préstamo</option>
                  <option value="dueDate">Fecha de vencimiento</option>
                  <option value="returnedDate">Fecha de devolución</option>
                  <option value="daysOverdue">Días vencidos</option>
                </Select>
              </FormControl>

              {/* Orden */}
              <FormControl>
                <FormLabel fontSize="sm">Orden</FormLabel>
                <Select
                  value={localFilters.sortOrder || 'desc'}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  size="sm"
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </Select>
              </FormControl>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}