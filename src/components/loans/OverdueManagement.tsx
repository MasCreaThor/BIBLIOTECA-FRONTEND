// src/components/loans/OverdueManagement.tsx
// ================================================================
// COMPONENTE DE GESTIÓN DE PRÉSTAMOS VENCIDOS - CORREGIDO
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
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';

import {
  FiAlertTriangle,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiMail,
  FiUser,
  FiBook,
  FiCalendar,
  FiClock
} from 'react-icons/fi';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar hooks y tipos
import { useOverdue } from '@/hooks/useLoans';
import type { OverdueFilters, LoanWithDetails, OverdueStats } from '@/types/loan.types';

// ===== INTERFACES =====

interface OverdueFiltersData {
  search: string;
  personType: 'student' | 'teacher' | '';  // FIX: Tipo específico en lugar de string
  minDaysOverdue: number | '';  // FIX: Tipo específico
  dateFrom: string;
  dateTo: string;
  grade: string;
}

interface OverdueStatsCardProps {
  stats: OverdueStats | null;
  loading: boolean;
}

// ===== COMPONENTE DE ESTADÍSTICAS =====

const OverdueStatsCard: React.FC<OverdueStatsCardProps> = ({ stats, loading }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  if (loading) {
    return (
      <Box bg={bgColor} p={6} rounded="lg" shadow="md" border="1px" borderColor="gray.200">
        <HStack justify="center">
          <Spinner size="lg" />
          <Text>Cargando estadísticas...</Text>
        </HStack>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>No hay estadísticas disponibles</Text>
      </Alert>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
      <Stat bg={bgColor} p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
        <StatLabel>Total Vencidos</StatLabel>
        <StatNumber color="red.500">{stats.totalOverdue}</StatNumber>
      </Stat>
      
      <Stat bg={bgColor} p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
        <StatLabel>Promedio Días</StatLabel>
        <StatNumber color="orange.500">{Math.round(stats.averageDaysOverdue || 0)}</StatNumber>
        <StatHelpText>días de retraso</StatHelpText>
      </Stat>
      
      <Stat bg={bgColor} p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
        <StatLabel>Estudiantes</StatLabel>
        <StatNumber color="blue.500">{stats.byPersonType.students}</StatNumber>
      </Stat>
      
      <Stat bg={bgColor} p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
        <StatLabel>Profesores</StatLabel>
        <StatNumber color="purple.500">{stats.byPersonType.teachers}</StatNumber>
      </Stat>
    </SimpleGrid>
  );
};

// ===== COMPONENTE PRINCIPAL =====

export const OverdueManagement: React.FC = () => {
  const toast = useToast();
  
  // FIX: Estado con tipos específicos
  const [localFilters, setLocalFilters] = useState<OverdueFiltersData>({
    search: '',
    personType: '',  // FIX: Valor inicial vacío en lugar de string vacío
    minDaysOverdue: '',  // FIX: Valor inicial vacío en lugar de string vacío
    dateFrom: '',
    dateTo: '',
    grade: ''
  });

  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);

  // Hooks
  const {
    overdueLoans,
    stats,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch
  } = useOverdue();

  // ===== EFECTOS =====

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters: OverdueFilters = {
        ...localFilters,
        personType: localFilters.personType || undefined,
        minDaysOverdue: typeof localFilters.minDaysOverdue === 'number' 
          ? localFilters.minDaysOverdue 
          : undefined
      };
      updateFilters(apiFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  // ===== FUNCIONES DE UTILIDAD =====

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getDaysOverdueBadgeColor = (days: number) => {
    if (days <= 7) return 'yellow';
    if (days <= 14) return 'orange';
    if (days <= 30) return 'red';
    return 'purple';
  };

  const getPersonTypeBadgeColor = (type: string) => {
    return type === 'student' ? 'blue' : 'purple';
  };

  // ===== MANEJADORES =====

  const handleFilterChange = (key: keyof OverdueFiltersData, value: string | number) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      personType: '',
      minDaysOverdue: '',
      dateFrom: '',
      dateTo: '',
      grade: ''
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
    if (selectedLoans.length === overdueLoans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(overdueLoans.map((loan: LoanWithDetails) => loan._id));
    }
  };

  // ===== CÁLCULOS =====

  const summaryStats = {
    totalOverdue: overdueLoans.length,
    averageDaysOverdue: overdueLoans.length > 0 
      ? overdueLoans.reduce((acc: number, loan: LoanWithDetails) => acc + (loan.daysOverdue || 0), 0) / overdueLoans.length 
      : 0,
    byPersonType: {
      students: overdueLoans.filter((loan: LoanWithDetails) => loan.person?.personType?.name === 'student').length,
      teachers: overdueLoans.filter((loan: LoanWithDetails) => loan.person?.personType?.name === 'teacher').length
    },
    byDaysOverdue: {
      '1-7': overdueLoans.filter((loan: LoanWithDetails) => (loan.daysOverdue || 0) >= 1 && (loan.daysOverdue || 0) <= 7).length,
      '8-14': overdueLoans.filter((loan: LoanWithDetails) => (loan.daysOverdue || 0) >= 8 && (loan.daysOverdue || 0) <= 14).length,
      '15-30': overdueLoans.filter((loan: LoanWithDetails) => (loan.daysOverdue || 0) >= 15 && (loan.daysOverdue || 0) <= 30).length,
      '30+': overdueLoans.filter((loan: LoanWithDetails) => (loan.daysOverdue || 0) > 30).length
    }
  };

  // ===== RENDER =====

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">Error al cargar préstamos vencidos</Text>
          <Text fontSize="sm">{error}</Text>
          <Text 
            fontSize="sm" 
            color="blue.500" 
            cursor="pointer" 
            textDecoration="underline"
            onClick={refetch}
          >
            Reintentar
          </Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Estadísticas */}
      <OverdueStatsCard stats={stats} loading={loading} />

      {/* Filtros */}
      <Box bg="white" p={6} rounded="lg" shadow="md" border="1px" borderColor="gray.200">
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Filtros de Búsqueda
            </Text>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiFilter />}
              onClick={handleClearFilters}
            >
              Limpiar Filtros
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Búsqueda</Text>
              <Input
                placeholder="Buscar por persona o recurso..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Tipo de Persona</Text>
              <Select
                value={localFilters.personType}
                onChange={(e) => handleFilterChange('personType', e.target.value as 'student' | 'teacher' | '')}
              >
                <option value="">Todos</option>
                <option value="student">Estudiantes</option>
                <option value="teacher">Profesores</option>
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Días Mínimos de Retraso</Text>
              <NumberInput min={1}>
                <NumberInputField
                  placeholder="Ej: 7"
                  value={localFilters.minDaysOverdue}
                  onChange={(e) => handleFilterChange('minDaysOverdue', 
                    e.target.value ? parseInt(e.target.value) : '')}
                />
              </NumberInput>
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

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Grado</Text>
              <Input
                placeholder="Ej: 5°A"
                value={localFilters.grade}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
              />
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Acciones */}
      <HStack justify="space-between">
        <HStack>
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={refetch}
            isLoading={loading}
            size="sm"
          >
            Actualizar
          </Button>
          <Text fontSize="sm" color="gray.600">
            {selectedLoans.length} de {overdueLoans.length} seleccionados
          </Text>
        </HStack>
      </HStack>

      {/* Tabla de Préstamos Vencidos */}
      <Box bg="white" rounded="lg" shadow="md" border="1px" borderColor="gray.200" overflow="hidden">
        {loading ? (
          <HStack justify="center" p={8}>
            <Spinner size="lg" />
            <Text>Cargando préstamos vencidos...</Text>
          </HStack>
        ) : overdueLoans.length === 0 ? (
          <Box p={8} textAlign="center">
            <FiAlertTriangle size={48} color="gray" />
            <Text mt={4} fontSize="lg" fontWeight="medium" color="gray.600">
              No hay préstamos vencidos
            </Text>
            <Text fontSize="sm" color="gray.500">
              {Object.keys(filters).length > 1 
                ? 'Intenta ajustar los filtros de búsqueda'
                : '¡Excelente trabajo manteniendo los préstamos al día!'
              }
            </Text>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>
                  <input
                    type="checkbox"
                    checked={selectedLoans.length === overdueLoans.length}
                    onChange={handleSelectAll}
                  />
                </Th>
                <Th>Persona</Th>
                <Th>Recurso</Th>
                <Th>Fecha Préstamo</Th>
                <Th>Fecha Vencimiento</Th>
                <Th>Días Vencido</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {overdueLoans.map((loan: LoanWithDetails) => (
                <Tr key={loan._id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={selectedLoans.includes(loan._id)}
                      onChange={() => handleSelectLoan(loan._id)}
                    />
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">
                        {loan.person?.fullName || 'N/A'}
                      </Text>
                      <HStack>
                        {loan.person?.personType && (
                          <Badge 
                            size="sm" 
                            colorScheme={getPersonTypeBadgeColor(loan.person.personType.name)}
                          >
                            {loan.person.personType.name === 'student' ? 'Estudiante' : 'Profesor'}
                          </Badge>
                        )}
                        {loan.person?.grade && (
                          <Badge size="sm" variant="outline">
                            {loan.person.grade}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" noOfLines={1}>
                        {loan.resource?.title || 'N/A'}
                      </Text>
                      {loan.resource?.author && (
                        <Text fontSize="sm" color="gray.600" noOfLines={1}>
                          {loan.resource.author}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <HStack>
                      <FiCalendar size={14} color="gray" />
                      <Text fontSize="sm">{formatDate(loan.loanDate)}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <FiClock size={14} color="red" />
                      <Text fontSize="sm" color="red.500">
                        {formatDate(loan.dueDate)}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={getDaysOverdueBadgeColor(loan.daysOverdue || 0)}
                      variant="solid"
                    >
                      {loan.daysOverdue || 0} días
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="xs" colorScheme="orange" variant="outline">
                        Recordar
                      </Button>
                      <Button size="xs" colorScheme="blue" variant="outline">
                        Ver Detalles
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <HStack justify="center" spacing={2}>
          <Button
            size="sm"
            isDisabled={!pagination.hasPrev}
            onClick={() => updateFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
          >
            Anterior
          </Button>
          <Text fontSize="sm">
            Página {pagination.page} de {pagination.totalPages}
          </Text>
          <Button
            size="sm"
            isDisabled={!pagination.hasNext}
            onClick={() => updateFilters({ ...filters, page: (filters.page || 1) + 1 })}
          >
            Siguiente
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default OverdueManagement;