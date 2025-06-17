// src/components/loans/ReturnsManagement.tsx
// ================================================================
// COMPONENTE DE GESTIÓN DE DEVOLUCIONES - CORREGIDO
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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';

import {
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiEye,
  FiCheck,
  FiX,
  FiUser,
  FiBook,
  FiCalendar,
  FiClock,
  FiAlertTriangle
} from 'react-icons/fi';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar hooks y tipos
import { useLoans, useReturn } from '@/hooks/useLoans';
import type { LoanWithDetails, ReturnLoanRequest, LoanSearchFilters } from '@/types/loan.types';

// ===== INTERFACES =====

interface ReturnsFiltersData {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  personType: string;
}

interface ReturnModalProps {
  loan: LoanWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ===== COMPONENTE DE MODAL DE DEVOLUCIÓN =====

const ReturnModal: React.FC<ReturnModalProps> = ({ loan, isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [returnData, setReturnData] = useState({
    returnDate: format(new Date(), 'yyyy-MM-dd'),
    resourceCondition: 'good',
    returnObservations: ''
  });

  const { returnLoan, processing } = useReturn();

  const handleSubmit = async () => {
    if (!loan) return;

    try {
      const request: ReturnLoanRequest = {
        loanId: loan._id,
        returnDate: returnData.returnDate,
        resourceCondition: returnData.resourceCondition,
        returnObservations: returnData.returnObservations || undefined
      };

      await returnLoan(request);

      toast({
        title: 'Éxito',
        description: 'Préstamo devuelto correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar la devolución',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleClose = () => {
    setReturnData({
      returnDate: format(new Date(), 'yyyy-MM-dd'),
      resourceCondition: 'good',
      returnObservations: ''
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Procesar Devolución</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {loan && (
              <Box p={4} bg="blue.50" rounded="md" border="1px" borderColor="blue.200">
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">
                    {loan.person?.fullName || 'N/A'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {loan.resource?.title || 'N/A'}
                  </Text>
                  <HStack>
                    <Badge colorScheme={loan.isOverdue ? 'red' : 'green'}>
                      {loan.isOverdue ? `Vencido (${loan.daysOverdue} días)` : 'Vigente'}
                    </Badge>
                    <Badge colorScheme="blue">
                      Cantidad: {loan.quantity}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            )}

            <FormControl>
              <FormLabel>Fecha de Devolución</FormLabel>
              <Input
                type="date"
                value={returnData.returnDate}
                onChange={(e) => setReturnData(prev => ({ ...prev, returnDate: e.target.value }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Estado del Recurso</FormLabel>
              <Select
                value={returnData.resourceCondition}
                onChange={(e) => setReturnData(prev => ({ ...prev, resourceCondition: e.target.value }))}
              >
                <option value="good">Buen estado</option>
                <option value="damaged">Dañado</option>
                <option value="lost">Perdido</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Observaciones</FormLabel>
              <Textarea
                placeholder="Observaciones adicionales sobre la devolución..."
                value={returnData.returnObservations}
                onChange={(e) => setReturnData(prev => ({ ...prev, returnObservations: e.target.value }))}
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={processing}
              leftIcon={<FiCheck />}
            >
              Procesar Devolución
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ===== COMPONENTE PRINCIPAL =====

export const ReturnsManagement: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Estados
  const [localFilters, setLocalFilters] = useState<ReturnsFiltersData>({
    search: '',
    status: 'active',
    dateFrom: '',
    dateTo: '',
    personType: ''
  });
  
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);

  // Hooks
  const {
    loans: activeLoans,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch
  } = useLoans({ status: 'active' }); // Solo préstamos activos para devoluciones

  // ===== EFECTOS =====

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters: LoanSearchFilters = {
        ...localFilters,
        status: (['active', 'returned', 'overdue', 'lost'].includes(localFilters.status) 
          ? localFilters.status as 'active' | 'returned' | 'overdue' | 'lost' 
          : undefined)
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

  const getStatusBadgeColor = (isOverdue: boolean) => {
    return isOverdue ? 'red' : 'green';
  };

  const getPersonTypeBadgeColor = (type: string) => {
    return type === 'student' ? 'blue' : 'purple';
  };

  // ===== MANEJADORES =====

  const handleFilterChange = (key: keyof ReturnsFiltersData, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      status: 'active',
      dateFrom: '',
      dateTo: '',
      personType: ''
    });
  };

  const handleProcessReturn = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    onOpen();
  };

  const handleReturnSuccess = () => {
    setSelectedLoan(null);
    refetch();
  };

  const handleExportReport = () => {
    toast({
      title: 'Información',
      description: 'Función de exportación en desarrollo',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  // ===== CÁLCULOS =====

  const summaryStats = {
    totalActive: activeLoans.length,
    overdueCount: activeLoans.filter((loan: LoanWithDetails) => loan.isOverdue).length,
    dueToday: activeLoans.filter((loan: LoanWithDetails) => {
      const today = new Date();
      const dueDate = new Date(loan.dueDate);
      return dueDate.toDateString() === today.toDateString();
    }).length,
    dueSoon: activeLoans.filter((loan: LoanWithDetails) => {
      const today = new Date();
      const dueDate = new Date(loan.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 3;
    }).length
  };

  // ===== RENDER =====

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">Error al cargar préstamos activos</Text>
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
      {/* Estadísticas Resumen */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <StatLabel>Préstamos Activos</StatLabel>
          <StatNumber color="blue.500">{summaryStats.totalActive}</StatNumber>
        </Stat>
        
        <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <StatLabel>Vencidos</StatLabel>
          <StatNumber color="red.500">{summaryStats.overdueCount}</StatNumber>
        </Stat>
        
        <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <StatLabel>Vencen Hoy</StatLabel>
          <StatNumber color="orange.500">{summaryStats.dueToday}</StatNumber>
        </Stat>
        
        <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <StatLabel>Vencen Pronto</StatLabel>
          <StatNumber color="yellow.500">{summaryStats.dueSoon}</StatNumber>
        </Stat>
      </SimpleGrid>

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

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Búsqueda</Text>
              <Input
                placeholder="Buscar por persona o recurso..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Estado</Text>
              <Select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="active">Activos</option>
                <option value="overdue">Vencidos</option>
                <option value="">Todos</option>
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
        </VStack>
      </Box>

      {/* Acciones */}
      <HStack justify="space-between">
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={refetch}
          isLoading={loading}
          size="sm"
        >
          Actualizar
        </Button>

        <Button
          leftIcon={<FiDownload />}
          variant="outline"
          size="sm"
          onClick={handleExportReport}
        >
          Exportar Reporte
        </Button>
      </HStack>

      {/* Tabla de Préstamos Activos */}
      <Box bg="white" rounded="lg" shadow="md" border="1px" borderColor="gray.200" overflow="hidden">
        {loading ? (
          <HStack justify="center" p={8}>
            <Spinner size="lg" />
            <Text>Cargando préstamos activos...</Text>
          </HStack>
        ) : activeLoans.length === 0 ? (
          <Box p={8} textAlign="center">
            <FiCheck size={48} color="green" />
            <Text mt={4} fontSize="lg" fontWeight="medium" color="gray.600">
              No hay préstamos activos
            </Text>
            <Text fontSize="sm" color="gray.500">
              {Object.keys(filters).length > 1 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Todos los préstamos han sido devueltos'
              }
            </Text>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Persona</Th>
                <Th>Recurso</Th>
                <Th>Fecha Préstamo</Th>
                <Th>Fecha Vencimiento</Th>
                <Th>Estado</Th>
                <Th>Cantidad</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* FIX: Tipo explícito para el parámetro loan */}
              {activeLoans.map((loan: LoanWithDetails) => {
                const isOverdue = loan.isOverdue;
                const isDueToday = new Date(loan.dueDate).toDateString() === new Date().toDateString();
                
                return (
                  <Tr key={loan._id} _hover={{ bg: 'gray.50' }}>
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
                        <FiClock size={14} color={isOverdue ? "red" : isDueToday ? "orange" : "gray"} />
                        <Text 
                          fontSize="sm" 
                          color={isOverdue ? "red.500" : isDueToday ? "orange.500" : "gray.600"}
                        >
                          {formatDate(loan.dueDate)}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={getStatusBadgeColor(isOverdue)}
                        variant="solid"
                      >
                        {isOverdue ? `Vencido (${loan.daysOverdue} días)` : 
                         isDueToday ? 'Vence hoy' : 'Vigente'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" variant="outline">
                        {loan.quantity}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button 
                          size="xs" 
                          colorScheme="green" 
                          leftIcon={<FiCheck />}
                          onClick={() => handleProcessReturn(loan)}
                        >
                          Devolver
                        </Button>
                        <Button size="xs" variant="outline" leftIcon={<FiEye />}>
                          Ver
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
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

      {/* Modal de Devolución */}
      <ReturnModal
        loan={selectedLoan}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleReturnSuccess}
      />
    </VStack>
  );
};

export default ReturnsManagement;