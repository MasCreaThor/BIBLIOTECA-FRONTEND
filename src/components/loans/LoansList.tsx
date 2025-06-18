// src/components/loans/LoansList.tsx
// ================================================================
// COMPONENTE DE LISTA DE PRÉSTAMOS CON FILTROS - COMPLETO Y CORREGIDO
// ================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Collapse,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  useDisclosure,
  Flex,
  Spacer
} from '@chakra-ui/react';

// FIX: Usar react-icons/fi en lugar de lucide-react
import { 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiBook,
  FiX
} from 'react-icons/fi';

// Importar hooks y componentes
import { useLoans } from '@/hooks/useLoans';
import LoanRow from './LoanRow';
import ReturnModal from './ReturnModal';
import type { LoanWithDetails, LoanSearchFilters } from '@/types/loan.types';

// ===== INTERFACES =====

interface LocalFiltersState {
  search: string;
  status: string;
  isOverdue: boolean;
  dateFrom: string;
  dateTo: string;
}

interface LoanDetailsModalProps {
  loan: LoanWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

// ===== COMPONENTE DE MODAL DE DETALLES =====

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ loan, isOpen, onClose }) => {
  // Este componente se puede expandir para mostrar todos los detalles del préstamo
  // Por ahora, redirigiremos al componente de vista detallada
  
  if (!loan) return null;

  return (
    <Box>
      {/* Aquí iría el modal de detalles completos */}
      {/* Por simplicidad, solo cerramos el modal por ahora */}
      {/* Aquí iría el modal de detalles completos */}
      {/* Por simplicidad, no se muestra nada por ahora */}
    </Box>
  );
};

// ===== COMPONENTE PRINCIPAL =====

const LoansList: React.FC = () => {
  // Estados
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);
  const [localFilters, setLocalFilters] = useState<LocalFiltersState>({
    search: '',
    status: '',
    isOverdue: false,
    dateFrom: '',
    dateTo: '',
  });

  // Hooks de Chakra UI
  const { isOpen: showFilters, onToggle: toggleFilters } = useDisclosure();
  const { 
    isOpen: showReturnModal, 
    onOpen: openReturnModal, 
    onClose: closeReturnModal 
  } = useDisclosure();
  const { 
    isOpen: showDetailsModal, 
    onOpen: openDetailsModal, 
    onClose: closeDetailsModal 
  } = useDisclosure();

  // Hook personalizado para gestionar préstamos
  const {
    loans,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changeLimit,
    refetch
  } = useLoans();

  // Valores de color
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const filterBg = useColorModeValue('gray.50', 'gray.700');

  // ===== EFECTOS =====

  // Aplicar filtros con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters: LoanSearchFilters = {
        page: 1, // Resetear a página 1 cuando cambien los filtros
        limit: 20,
        search: localFilters.search.trim() || undefined,
        status: (['active', 'returned', 'overdue', 'lost'].includes(localFilters.status)
          ? localFilters.status
          : undefined) as 'active' | 'returned' | 'overdue' | 'lost' | undefined,
        isOverdue: localFilters.isOverdue || undefined,
        dateFrom: localFilters.dateFrom || undefined,
        dateTo: localFilters.dateTo || undefined
      };
      
      // ✅ CORRECCIÓN: Siempre actualizar filtros, incluso cuando están vacíos
      console.log('🔍 Aplicando filtros:', apiFilters);
      updateFilters(apiFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  // ===== MANEJADORES =====

  const handleFilterChange = (key: keyof LocalFiltersState, value: string | boolean) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      status: '',
      isOverdue: false,
      dateFrom: '',
      dateTo: '',
    });
    // Limpiar también los filtros del API
    updateFilters({});
  };

  const handleSelectLoan = (loanId: string) => {
    setSelectedLoans(prev => 
      prev.includes(loanId) 
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    );
  };

  const handleSelectAll = () => {
    if (!loans || loans.length === 0) return;
    
    if (selectedLoans.length === loans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(loans.map((loan: LoanWithDetails) => loan._id));
    }
  };

  const handleViewDetails = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    openDetailsModal();
  };

  const handleReturnLoan = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    openReturnModal();
  };

  const handleReturnSuccess = () => {
    setSelectedLoan(null);
    closeReturnModal();
    refetch(); // Actualizar la lista
  };

  const handleExportSelected = () => {
    if (selectedLoans.length === 0) {
      alert('Selecciona al menos un préstamo para exportar');
      return;
    }
    
    // Implementar exportación
    console.log('Exportando préstamos:', selectedLoans);
    alert('Función de exportación en desarrollo');
  };

  // Calcular si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return Object.values(localFilters).some(value => 
      typeof value === 'boolean' ? value : value !== ''
    );
  }, [localFilters]);

  // ===== CÁLCULOS =====

  const summaryStats = {
    total: loans?.length || 0,
    active: loans?.filter((loan: LoanWithDetails) => loan.status?.name === 'active').length || 0,
    overdue: loans?.filter((loan: LoanWithDetails) => loan.isOverdue).length || 0,
    returned: loans?.filter((loan: LoanWithDetails) => loan.status?.name === 'returned').length || 0
  };

  // ===== RENDER DE ERROR =====

  if (error) {
    return (
      <Alert status="error" rounded="lg">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">Error al cargar préstamos</Text>
          <Text fontSize="sm">{error}</Text>
          <Button
            size="sm"
            leftIcon={<FiRefreshCw />}
            onClick={refetch}
            colorScheme="red"
            variant="outline"
          >
            Reintentar
          </Button>
        </VStack>
      </Alert>
    );
  }

  // ===== RENDER PRINCIPAL =====

  return (
    <VStack spacing={6} align="stretch">
      {/* ✅ NUEVO: Resumen rápido de estadísticas básicas */}
      <Box
        bg={bgColor}
        p={4}
        rounded="lg"
        border="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {summaryStats.total}
            </Text>
            <Text fontSize="sm" color="gray.600">Total Préstamos</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {summaryStats.active}
            </Text>
            <Text fontSize="sm" color="gray.600">Activos</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {summaryStats.overdue}
            </Text>
            <Text fontSize="sm" color="gray.600">Vencidos</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {summaryStats.returned}
            </Text>
            <Text fontSize="sm" color="gray.600">Devueltos</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Header con Acciones y Filtros */}
      <Box 
        bg={bgColor} 
        rounded="xl" 
        border="1px" 
        borderColor={borderColor}
        overflow="hidden"
        shadow="sm"
      >
        {/* Barra de acciones */}
        <Flex 
          p={6} 
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderBottom="1px"
          borderColor={borderColor}
          justify="space-between" 
          align="center"
          flexWrap="wrap"
          gap={4}
        >
          {/* Búsqueda Mejorada */}
          <Box flex="1" minW="300px">
            <InputGroup>
              <InputLeftElement>
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre de persona, documento, título de recurso, autor, ISBN..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                }}
                _placeholder={{
                  color: 'gray.400',
                  fontSize: 'sm'
                }}
              />
            </InputGroup>
            {localFilters.search && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Buscando: "{localFilters.search}"
              </Text>
            )}
          </Box>

          {/* Acciones */}
          <HStack spacing={3}>
            {selectedLoans.length > 0 && (
              <Button
                size="sm"
                leftIcon={<FiDownload />}
                colorScheme="green"
                variant="outline"
                onClick={handleExportSelected}
                borderRadius="md"
              >
                Exportar ({selectedLoans.length})
              </Button>
            )}

            <Button
              size="sm"
              leftIcon={<FiFilter />}
              variant={hasActiveFilters ? "solid" : "outline"}
              colorScheme={hasActiveFilters ? "blue" : "gray"}
              onClick={toggleFilters}
              borderRadius="md"
            >
              Filtros
              {hasActiveFilters && (
                <Badge ml={2} colorScheme="red" variant="solid" borderRadius="full" fontSize="xs">
                  {Object.values(localFilters).filter(v => typeof v === 'boolean' ? v : v !== '').length}
                </Badge>
              )}
            </Button>

            <Button
              size="sm"
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={refetch}
              isLoading={loading}
              borderRadius="md"
            >
              Actualizar
            </Button>
          </HStack>
        </Flex>

        {/* Filtros Expandibles */}
        <Collapse in={showFilters}>
          <Box p={6} bg="white" borderTop="1px" borderColor={borderColor}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
                    Estado del Préstamo
                  </Text>
                  <Select
                    value={localFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                    }}
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="returned">Devueltos</option>
                    <option value="overdue">Vencidos</option>
                    <option value="lost">Perdidos</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
                    Fecha Desde
                  </Text>
                  <Input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
                    Fecha Hasta
                  </Text>
                  <Input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                    }}
                  />
                </Box>
              </SimpleGrid>

              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Checkbox
                    isChecked={localFilters.isOverdue}
                    onChange={(e) => handleFilterChange('isOverdue', e.target.checked)}
                    colorScheme="red"
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      Solo préstamos vencidos
                    </Text>
                  </Checkbox>
                </HStack>

                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearFilters}
                    isDisabled={!hasActiveFilters}
                    colorScheme="gray"
                    borderRadius="md"
                    leftIcon={<FiX />}
                  >
                    Limpiar Filtros
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refetch}
                    isLoading={loading}
                    colorScheme="blue"
                    borderRadius="md"
                    leftIcon={<FiRefreshCw />}
                  >
                    Actualizar
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          </Box>
        </Collapse>
      </Box>

      {/* Tabla de Préstamos Mejorada */}
      <Box 
        bg={bgColor} 
        rounded="xl" 
        border="1px" 
        borderColor={borderColor} 
        overflow="hidden"
        shadow="sm"
      >
        {loading ? (
          <Flex justify="center" p={12}>
            <VStack spacing={6}>
              <Spinner size="xl" color="blue.500" thickness="3px" />
              <Text color="gray.600" fontSize="lg">Cargando préstamos...</Text>
            </VStack>
          </Flex>
        ) : (loans && loans.length > 0) ? (
          <Box overflowX="auto">
            <Table variant="unstyled" size="md" sx={{ tableLayout: 'fixed' }}>
              <Thead>
                <Tr bg={useColorModeValue('gray.50', 'gray.700')} borderBottom="2px" borderColor={borderColor}>
                  <Th px={4} py={4} w="50px" textAlign="center">
                    <Checkbox
                      isChecked={loans && selectedLoans.length === loans.length && loans.length > 0}
                      isIndeterminate={selectedLoans.length > 0 && loans && selectedLoans.length < loans.length}
                      onChange={handleSelectAll}
                      colorScheme="blue"
                    />
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="200px" textAlign="left">
                    Persona
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="200px" textAlign="left">
                    Recurso
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="120px" textAlign="center">
                    F. Préstamo
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="120px" textAlign="center">
                    F. Vencimiento
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="120px" textAlign="center">
                    Estado
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="100px" textAlign="center">
                    Cantidad
                  </Th>
                  <Th px={4} py={4} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="150px" textAlign="center">
                    Acciones
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {loans.map((loan: LoanWithDetails, index: number) => (
                  <React.Fragment key={loan._id}>
                    <Tr 
                      _hover={{ 
                        bg: useColorModeValue('blue.50', 'blue.900'),
                        transform: 'translateY(-1px)',
                        boxShadow: 'sm'
                      }}
                      transition="all 0.2s"
                      borderBottom="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.600')}
                      bg={index % 2 === 0 ? useColorModeValue('white', 'gray.800') : useColorModeValue('gray.25', 'gray.750')}
                    >
                      <Td px={4} py={4} w="50px" textAlign="center">
                        <Checkbox
                          isChecked={selectedLoans.includes(loan._id)}
                          onChange={() => handleSelectLoan(loan._id)}
                          colorScheme="blue"
                        />
                      </Td>
                      <LoanRow
                        loan={loan}
                        onUpdate={refetch}
                        onViewDetails={handleViewDetails}
                        onReturnLoan={handleReturnLoan}
                      />
                    </Tr>
                  </React.Fragment>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Flex justify="center" p={12}>
            <VStack spacing={6}>
              <Box 
                p={6} 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                rounded="full"
                color={useColorModeValue('gray.400', 'gray.500')}
              >
                <FiBook size={48} />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                  No se encontraron préstamos
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                  {hasActiveFilters 
                    ? 'Intenta ajustar los filtros de búsqueda para encontrar más resultados'
                    : 'No hay préstamos registrados en el sistema. Comienza creando el primer préstamo.'
                  }
                </Text>
              </VStack>
            </VStack>
          </Flex>
        )}
      </Box>

      {/* Paginación Mejorada */}
      {pagination && pagination.totalPages > 1 && (
        <Box 
          bg={bgColor} 
          rounded="xl" 
          border="1px" 
          borderColor={borderColor}
          p={6}
          shadow="sm"
        >
          <Flex justify="space-between" align="center">
            {/* Información de páginas */}
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Mostrando página {pagination.page} de {pagination.totalPages}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Total de {pagination.total} préstamos
                {hasActiveFilters && (
                  <span> (filtrados)</span>
                )}
              </Text>
            </VStack>

            {/* Controles de navegación */}
            <HStack spacing={3}>
              <Button
                size="sm"
                leftIcon={<FiChevronUp style={{ transform: 'rotate(-90deg)' }} />}
                isDisabled={!pagination.hasPrev}
                onClick={() => changePage(pagination.page - 1)}
                variant="outline"
                colorScheme="blue"
                borderRadius="md"
              >
                Anterior
              </Button>
              
              {/* Números de página */}
              <HStack spacing={1}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === pagination.page;
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={isCurrent ? "solid" : "outline"}
                      colorScheme="blue"
                      onClick={() => changePage(pageNum)}
                      borderRadius="md"
                      minW="40px"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </HStack>
              
              <Button
                size="sm"
                rightIcon={<FiChevronDown style={{ transform: 'rotate(-90deg)' }} />}
                isDisabled={!pagination.hasNext}
                onClick={() => changePage(pagination.page + 1)}
                variant="outline"
                colorScheme="blue"
                borderRadius="md"
              >
                Siguiente
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}

      {/* Modales */}
      <ReturnModal
        loan={selectedLoan}
        isOpen={showReturnModal}
        onClose={closeReturnModal}
        onSuccess={handleReturnSuccess}
      />

      <LoanDetailsModal
        loan={selectedLoan}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
      />
    </VStack>
  );
};

export default LoansList;