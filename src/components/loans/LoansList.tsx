// src/components/loans/LoansList.tsx
// ================================================================
// COMPONENTE DE LISTA DE PRÉSTAMOS CON FILTROS - COMPLETO Y CORREGIDO
// ================================================================

import React, { useState, useEffect } from 'react';
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
  FiBook
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
  personType: string;
  resourceType: string;
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
    personType: '',
    resourceType: ''
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
        ...localFilters,
        status: (['active', 'returned', 'overdue', 'lost'].includes(localFilters.status)
          ? localFilters.status
          : undefined) as 'active' | 'returned' | 'overdue' | 'lost' | undefined
      };
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
      personType: '',
      resourceType: ''
    });
  };

  const handleSelectLoan = (loanId: string) => {
    setSelectedLoans(prev => 
      prev.includes(loanId) 
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    );
  };

  const handleSelectAll = () => {
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

  // ===== CÁLCULOS =====

  const hasActiveFilters = Object.values(localFilters).some(value => 
    typeof value === 'boolean' ? value : value !== ''
  );

  const summaryStats = {
    total: loans.length,
    active: loans.filter((loan: LoanWithDetails) => loan.status?.name === 'active').length,
    overdue: loans.filter((loan: LoanWithDetails) => loan.isOverdue).length,
    returned: loans.filter((loan: LoanWithDetails) => loan.status?.name === 'returned').length
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
      {/* Estadísticas Rápidas */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Box bg={bgColor} p={4} rounded="lg" border="1px" borderColor={borderColor}>
          <Text fontSize="sm" color="gray.600">Total</Text>
          <Text fontSize="xl" fontWeight="bold">{summaryStats.total}</Text>
        </Box>
        <Box bg={bgColor} p={4} rounded="lg" border="1px" borderColor={borderColor}>
          <Text fontSize="sm" color="gray.600">Activos</Text>
          <Text fontSize="xl" fontWeight="bold" color="green.500">{summaryStats.active}</Text>
        </Box>
        <Box bg={bgColor} p={4} rounded="lg" border="1px" borderColor={borderColor}>
          <Text fontSize="sm" color="gray.600">Vencidos</Text>
          <Text fontSize="xl" fontWeight="bold" color="red.500">{summaryStats.overdue}</Text>
        </Box>
        <Box bg={bgColor} p={4} rounded="lg" border="1px" borderColor={borderColor}>
          <Text fontSize="sm" color="gray.600">Devueltos</Text>
          <Text fontSize="xl" fontWeight="bold" color="blue.500">{summaryStats.returned}</Text>
        </Box>
      </SimpleGrid>

      {/* Barra de Búsqueda y Filtros */}
      <Box bg={bgColor} rounded="lg" border="1px" borderColor={borderColor} overflow="hidden">
        {/* Barra Superior */}
        <Box p={4}>
          <Flex align="center" gap={4} direction={{ base: 'column', lg: 'row' }}>
            {/* Búsqueda */}
            <InputGroup maxW={{ base: 'full', lg: '400px' }}>
              <InputLeftElement>
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por persona, recurso o documento..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </InputGroup>

            <Spacer display={{ base: 'none', lg: 'block' }} />

            {/* Controles */}
            <HStack spacing={3}>
              <Button
                leftIcon={<FiFilter />}
                variant={showFilters ? 'solid' : 'outline'}
                size="sm"
                onClick={toggleFilters}
                rightIcon={showFilters ? <FiChevronUp /> : <FiChevronDown />}
              >
                Filtros
                {hasActiveFilters && (
                  <Badge ml={2} colorScheme="blue" size="sm">
                    {Object.values(localFilters).filter(value => 
                      typeof value === 'boolean' ? value : value !== ''
                    ).length}
                  </Badge>
                )}
              </Button>

              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                size="sm"
                onClick={refetch}
                isLoading={loading}
              >
                Actualizar
              </Button>

              {selectedLoans.length > 0 && (
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleExportSelected}
                >
                  Exportar ({selectedLoans.length})
                </Button>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* Filtros Expandibles */}
        <Collapse in={showFilters}>
          <Box p={4} bg={filterBg} borderTop="1px" borderColor={borderColor}>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Estado</Text>
                  <Select
                    value={localFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="returned">Devueltos</option>
                    <option value="overdue">Vencidos</option>
                    <option value="lost">Perdidos</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Tipo de Persona</Text>
                  <Select
                    value={localFilters.personType}
                    onChange={(e) => handleFilterChange('personType', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="student">Estudiantes</option>
                    <option value="teacher">Profesores</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Fecha Desde</Text>
                  <Input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Fecha Hasta</Text>
                  <Input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </Box>
              </SimpleGrid>

              <HStack>
                <Checkbox
                  isChecked={localFilters.isOverdue}
                  onChange={(e) => handleFilterChange('isOverdue', e.target.checked)}
                >
                  Solo préstamos vencidos
                </Checkbox>

                <Spacer />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearFilters}
                  isDisabled={!hasActiveFilters}
                >
                  Limpiar Filtros
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Collapse>
      </Box>

      {/* Tabla de Préstamos */}
      <Box bg={bgColor} rounded="lg" border="1px" borderColor={borderColor} overflow="hidden">
        {loading ? (
          <Flex justify="center" p={8}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.600">Cargando préstamos...</Text>
            </VStack>
          </Flex>
        ) : loans.length === 0 ? (
          <Flex justify="center" p={8}>
            <VStack spacing={4}>
              <FiBook size={48} color="gray" />
              <Text fontSize="lg" fontWeight="medium" color="gray.600">
                No se encontraron préstamos
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {hasActiveFilters 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay préstamos registrados en el sistema'
                }
              </Text>
            </VStack>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={filterBg}>
                <Tr>
                  <Th>
                    <Checkbox
                      isChecked={selectedLoans.length === loans.length && loans.length > 0}
                      isIndeterminate={selectedLoans.length > 0 && selectedLoans.length < loans.length}
                      onChange={handleSelectAll}
                    />
                  </Th>
                  <Th>Persona</Th>
                  <Th>Recurso</Th>
                  <Th>F. Préstamo</Th>
                  <Th>F. Vencimiento</Th>
                  <Th>Estado</Th>
                  <Th>Cantidad</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loans.map((loan: LoanWithDetails) => (
                  <React.Fragment key={loan._id}>
                    <Tr _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td>
                        <Checkbox
                          isChecked={selectedLoans.includes(loan._id)}
                          onChange={() => handleSelectLoan(loan._id)}
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
        )}
      </Box>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Flex justify="center" align="center" gap={4}>
          <Button
            size="sm"
            leftIcon={<FiChevronUp style={{ transform: 'rotate(-90deg)' }} />}
            isDisabled={!pagination.hasPrev}
            onClick={() => changePage(pagination.page - 1)}
          >
            Anterior
          </Button>
          
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Página {pagination.page} de {pagination.totalPages}
            </Text>
            <Text fontSize="sm" color="gray.500">
              ({pagination.total} total)
            </Text>
          </HStack>
          
          <Button
            size="sm"
            rightIcon={<FiChevronDown style={{ transform: 'rotate(-90deg)' }} />}
            isDisabled={!pagination.hasNext}
            onClick={() => changePage(pagination.page + 1)}
          >
            Siguiente
          </Button>
        </Flex>
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