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
  useColorModeValue,
  Flex
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
import LoanDetailsModal from './LoanDetailsModal';

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

interface ReturnsManagementProps {
  preSelectedLoanId?: string;
  onLoanDetailsClosed?: () => void;
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

export const ReturnsManagement: React.FC<ReturnsManagementProps> = ({ preSelectedLoanId, onLoanDetailsClosed }) => {
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

  // Hooks para modales
  const { 
    isOpen: showDetailsModal, 
    onOpen: openDetailsModal, 
    onClose: closeDetailsModal 
  } = useDisclosure();

  // ===== EFECTOS =====

  // ✅ NUEVO: Efecto para abrir automáticamente el modal de detalles cuando se recibe un loanId
  useEffect(() => {
    if (preSelectedLoanId && activeLoans && activeLoans.length > 0) {
      const loan = activeLoans.find(l => l._id === preSelectedLoanId);
      if (loan) {
        setSelectedLoan(loan);
        openDetailsModal();
      }
    }
  }, [preSelectedLoanId, activeLoans, openDetailsModal]);

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

  const handleViewDetails = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    openDetailsModal();
  };

  const handleReturnSuccess = () => {
    setSelectedLoan(null);
    refetch();
  };

  // ✅ NUEVO: Handler para cerrar el modal de detalles y limpiar la URL
  const handleDetailsModalClose = () => {
    closeDetailsModal();
    setSelectedLoan(null);
    if (onLoanDetailsClosed) {
      onLoanDetailsClosed();
    }
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
        <Stat 
          bg={useColorModeValue('white', 'gray.800')} 
          p={6} 
          rounded="xl" 
          shadow="sm" 
          border="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Préstamos Activos</StatLabel>
          <StatNumber color="blue.500" fontSize="2xl" fontWeight="bold">{summaryStats.totalActive}</StatNumber>
        </Stat>
        
        <Stat 
          bg={useColorModeValue('white', 'gray.800')} 
          p={6} 
          rounded="xl" 
          shadow="sm" 
          border="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Vencidos</StatLabel>
          <StatNumber color="red.500" fontSize="2xl" fontWeight="bold">{summaryStats.overdueCount}</StatNumber>
        </Stat>
        
        <Stat 
          bg={useColorModeValue('white', 'gray.800')} 
          p={6} 
          rounded="xl" 
          shadow="sm" 
          border="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Vencen Hoy</StatLabel>
          <StatNumber color="orange.500" fontSize="2xl" fontWeight="bold">{summaryStats.dueToday}</StatNumber>
        </Stat>
        
        <Stat 
          bg={useColorModeValue('white', 'gray.800')} 
          p={6} 
          rounded="xl" 
          shadow="sm" 
          border="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">Vencen Pronto</StatLabel>
          <StatNumber color="yellow.500" fontSize="2xl" fontWeight="bold">{summaryStats.dueSoon}</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Filtros */}
      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        rounded="xl" 
        shadow="sm" 
        border="1px" 
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        p={6}
      >
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
              colorScheme="gray"
              borderRadius="md"
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
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Estado</Text>
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
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Fecha Hasta</Text>
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
        </VStack>
      </Box>

      {/* Acciones */}
      <HStack justify="space-between">
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={refetch}
          isLoading={loading}
          size="sm"
          colorScheme="blue"
          variant="outline"
          borderRadius="md"
        >
          Actualizar
        </Button>
      </HStack>

      {/* Tabla de Préstamos Activos */}
      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        rounded="xl" 
        shadow="sm" 
        border="1px" 
        borderColor={useColorModeValue('gray.200', 'gray.600')} 
        overflow="hidden"
      >
        {loading ? (
          <Flex justify="center" p={12}>
            <VStack spacing={6}>
              <Spinner size="xl" color="blue.500" thickness="3px" />
              <Text color="gray.600" fontSize="lg">Cargando préstamos activos...</Text>
            </VStack>
          </Flex>
        ) : activeLoans.length === 0 ? (
          <Flex justify="center" p={12}>
            <VStack spacing={6}>
              <Box 
                p={6} 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                rounded="full"
                color={useColorModeValue('gray.400', 'gray.500')}
              >
                <FiCheck size={48} />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                  No hay préstamos activos
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                  {Object.keys(filters).length > 1 
                    ? 'Intenta ajustar los filtros de búsqueda para encontrar más resultados'
                    : 'Todos los préstamos han sido devueltos. Comienza creando un nuevo préstamo.'
                  }
                </Text>
              </VStack>
            </VStack>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table 
              variant="unstyled" 
              size="md" 
              sx={{ 
                tableLayout: 'fixed',
                borderCollapse: 'separate',
                borderSpacing: 0
              }}
            >
              <Thead>
                <Tr bg={useColorModeValue('gray.50', 'gray.700')} borderBottom="2px" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="200px" textAlign="left" verticalAlign="middle">
                    Persona
                  </Th>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="200px" textAlign="left" verticalAlign="middle">
                    Recurso
                  </Th>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="120px" textAlign="center" verticalAlign="middle">
                    F. Préstamo
                  </Th>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="120px" textAlign="center" verticalAlign="middle">
                    F. Vencimiento
                  </Th>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="120px" textAlign="center" verticalAlign="middle">
                    Estado
                  </Th>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="100px" textAlign="center" verticalAlign="middle">
                    Cantidad
                  </Th>
                  <Th px={4} py={6} fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" letterSpacing="wide" w="150px" textAlign="center" verticalAlign="middle">
                    Acciones
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeLoans.map((loan: LoanWithDetails) => {
                  const isOverdue = loan.isOverdue;
                  const isDueToday = new Date(loan.dueDate).toDateString() === new Date().toDateString();
                  
                  return (
                    <Tr 
                      key={loan._id} 
                      _hover={{ 
                        bg: useColorModeValue('blue.50', 'blue.900'),
                        transform: 'translateY(-1px)',
                        boxShadow: 'sm'
                      }}
                      transition="all 0.2s"
                      borderBottom="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.600')}
                      bg={useColorModeValue('white', 'gray.800')}
                    >
                      <Td px={4} py={6} w="200px" textAlign="left" verticalAlign="middle">
                        <VStack align="start" spacing={2} minH="70px" justify="center">
                          <Text fontWeight="semibold" fontSize="sm" color="gray.800" noOfLines={2} maxW="180px">
                            {loan.person?.fullName || 'N/A'}
                          </Text>
                          <HStack spacing={2} minH="20px">
                            {loan.person?.personType && (
                              <Badge 
                                size="sm" 
                                colorScheme={getPersonTypeBadgeColor(loan.person.personType.name)}
                                variant="subtle"
                              >
                                {loan.person.personType.name === 'student' ? 'Estudiante' : 'Profesor'}
                              </Badge>
                            )}
                            {loan.person?.grade && (
                              <Badge size="sm" variant="outline" colorScheme="gray">
                                {loan.person.grade}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </Td>
                      <Td px={4} py={6} w="200px" textAlign="left" verticalAlign="middle">
                        <VStack align="start" spacing={2} minH="70px" justify="center">
                          <Text fontWeight="semibold" fontSize="sm" color="gray.800" noOfLines={2} maxW="180px">
                            {loan.resource?.title || 'N/A'}
                          </Text>
                          {loan.resource?.author && (
                            <Text fontSize="xs" color="gray.600" noOfLines={1} maxW="180px">
                              {loan.resource.author}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td px={4} py={6} w="120px" textAlign="center" verticalAlign="middle">
                        <HStack spacing={2} minH="70px" align="center" justify="center">
                          <Box p={1} bg="blue.100" rounded="md" color="blue.600" flexShrink={0}>
                            <FiCalendar size={14} />
                          </Box>
                          <VStack align="start" spacing={0} flex="1">
                            <Text fontSize="sm" fontWeight="medium" color="gray.800">
                              {formatDate(loan.loanDate)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Préstamo
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td px={4} py={6} w="120px" textAlign="center" verticalAlign="middle">
                        <HStack spacing={2} minH="70px" align="center" justify="center">
                          <Box 
                            p={1} 
                            bg={isOverdue ? "red.100" : isDueToday ? "orange.100" : "gray.100"} 
                            rounded="md" 
                            color={isOverdue ? "red.600" : isDueToday ? "orange.600" : "gray.600"}
                            flexShrink={0}
                          >
                            <FiClock size={14} />
                          </Box>
                          <VStack align="start" spacing={0} flex="1">
                            <Text 
                              fontSize="sm" 
                              fontWeight="medium"
                              color={isOverdue ? "red.600" : isDueToday ? "orange.600" : "gray.800"}
                            >
                              {formatDate(loan.dueDate)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Vencimiento
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td px={4} py={6} w="120px" textAlign="center" verticalAlign="middle">
                        <Box minH="70px" display="flex" alignItems="center" justifyContent="center">
                          <Badge 
                            colorScheme={getStatusBadgeColor(isOverdue)}
                            variant="solid"
                            px={3}
                            py={2}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="semibold"
                          >
                            {isOverdue ? `Vencido (${loan.daysOverdue} días)` : 
                             isDueToday ? 'Vence hoy' : 'Vigente'}
                          </Badge>
                        </Box>
                      </Td>
                      <Td px={4} py={6} w="100px" textAlign="center" verticalAlign="middle">
                        <Box minH="70px" display="flex" alignItems="center" justifyContent="center">
                          <Badge 
                            colorScheme="blue" 
                            variant="subtle"
                            px={3}
                            py={2}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            {loan.quantity} {loan.quantity === 1 ? 'unidad' : 'unidades'}
                          </Badge>
                        </Box>
                      </Td>
                      <Td px={4} py={6} w="150px" textAlign="center" verticalAlign="middle">
                        <Box minH="70px" display="flex" alignItems="center" justifyContent="center">
                          <HStack spacing={3}>
                            <Button 
                              size="xs" 
                              colorScheme="green" 
                              leftIcon={<FiCheck />}
                              onClick={() => handleProcessReturn(loan)}
                              borderRadius="md"
                            >
                              Devolver
                            </Button>
                            <Button 
                              size="xs" 
                              variant="outline" 
                              leftIcon={<FiEye />} 
                              onClick={() => handleViewDetails(loan)}
                              borderRadius="md"
                            >
                              Ver
                            </Button>
                          </HStack>
                        </Box>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
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

      {/* Modal de Detalles */}
      <LoanDetailsModal
        loan={selectedLoan}
        isOpen={showDetailsModal}
        onClose={handleDetailsModalClose}
        onReturnLoan={handleProcessReturn}
      />
    </VStack>
  );
};

export default ReturnsManagement;