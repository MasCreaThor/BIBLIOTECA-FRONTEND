// src/components/loans/LoanDetailsModal.tsx
// ================================================================
// MODAL DE DETALLES COMPLETOS DE PRÉSTAMO - COMPLETO Y FUNCIONAL
// ================================================================

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Divider,
  SimpleGrid,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Flex,
  Spacer
} from '@chakra-ui/react';

import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiBook, 
  FiMapPin, 
  FiTag,
  FiCheckCircle, 
  FiAlertTriangle, 
  FiXCircle,
  FiRotateCcw,
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { LoanWithDetails } from '@/types/loan.types';

// ===== INTERFACES =====

interface LoanDetailsModalProps {
  loan: LoanWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onReturnLoan?: (loan: LoanWithDetails) => void;
}

// ===== COMPONENTE PRINCIPAL =====

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ 
  loan, 
  isOpen, 
  onClose,
  onReturnLoan
}) => {
  // Valores de color
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // ===== FUNCIONES DE UTILIDAD =====

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatDateOnly = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusInfo = (loan: LoanWithDetails) => {
    if (loan.status?.name === 'returned') {
      return {
        icon: FiCheckCircle,
        label: 'Devuelto',
        colorScheme: 'green',
        variant: 'solid' as const,
        description: 'El recurso ha sido devuelto correctamente'
      };
    }
    
    if (loan.isOverdue) {
      return {
        icon: FiAlertTriangle,
        label: `Vencido (${loan.daysOverdue} días)`,
        colorScheme: 'red',
        variant: 'solid' as const,
        description: `El préstamo vence hace ${loan.daysOverdue} días`
      };
    }
    
    if (loan.status?.name === 'lost') {
      return {
        icon: FiXCircle,
        label: 'Perdido',
        colorScheme: 'gray',
        variant: 'solid' as const,
        description: 'El recurso ha sido marcado como perdido'
      };
    }

    // Verificar si vence hoy
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    const isDueToday = dueDate.toDateString() === today.toDateString();
    
    if (isDueToday) {
      return {
        icon: FiClock,
        label: 'Vence hoy',
        colorScheme: 'orange',
        variant: 'solid' as const,
        description: 'El préstamo vence hoy'
      };
    }
    
    return {
      icon: FiCheckCircle,
      label: 'Activo',
      colorScheme: 'green',
      variant: 'outline' as const,
      description: 'El préstamo está activo'
    };
  };

  const getPersonTypeLabel = (personType?: { name: string }) => {
    if (!personType) return 'No especificado';
    return personType.name === 'student' ? 'Estudiante' : 'Profesor';
  };

  const getResourceTypeLabel = (resourceType?: { name: string }) => {
    if (!resourceType) return 'No especificado';
    return resourceType.name;
  };

  const getResourceStateLabel = (resourceState?: { name: string }) => {
    if (!resourceState) return 'No especificado';
    return resourceState.name;
  };

  // ===== MANEJADORES =====

  const handleReturnLoan = () => {
    if (loan && onReturnLoan) {
      onReturnLoan(loan);
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!loan) return;
    
    const loanData = {
      id: loan._id,
      persona: loan.person?.fullName,
      documento: loan.person?.documentNumber,
      tipoPersona: getPersonTypeLabel(loan.person?.personType),
      recurso: loan.resource?.title,
      autor: loan.resource?.author,
      categoria: loan.resource?.category || 'No especificado',
      estadoRecurso: loan.resource?.state?.name || 'No especificado',
      fechaPrestamo: formatDate(loan.loanDate),
      fechaVencimiento: formatDate(loan.dueDate),
      fechaDevolucion: loan.returnedDate ? formatDate(loan.returnedDate) : 'No devuelto',
      estado: getStatusInfo(loan).label,
      cantidad: loan.quantity,
      observaciones: loan.observations || 'Sin observaciones'
    };

    const csvContent = Object.entries(loanData)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prestamo-${loan._id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ===== RENDER =====

  if (!loan) return null;

  const statusInfo = getStatusInfo(loan);
  const StatusIcon = statusInfo.icon;
  const canReturn = loan.status?.name === 'active' || loan.isOverdue;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} borderRadius="xl">
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <VStack align="start" spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Detalles del Préstamo
            </Text>
            <HStack spacing={3}>
              <Badge
                colorScheme={statusInfo.colorScheme}
                variant={statusInfo.variant}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="semibold"
              >
                <HStack spacing={1}>
                  <StatusIcon size={14} />
                  <Text>{statusInfo.label}</Text>
                </HStack>
              </Badge>
              <Text fontSize="sm" color="gray.500">
                ID: {loan._id}
              </Text>
            </HStack>
          </VStack>
        </ModalHeader>
        
        <ModalCloseButton />

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* ✅ ALERTA DE ESTADO */}
            {loan.isOverdue && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Préstamo Vencido</AlertTitle>
                  <AlertDescription>
                    Este préstamo vence hace {loan.daysOverdue} días. Se recomienda contactar al usuario.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* ✅ INFORMACIÓN DE LA PERSONA */}
            <Box p={4} bg={cardBg} rounded="lg" border="1px" borderColor={borderColor}>
              <HStack spacing={3} mb={3}>
                <Icon as={FiUser} color="blue.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  Información de la Persona
                </Text>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Nombre Completo
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {loan.person?.fullName || 'No especificado'}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Número de Documento
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {loan.person?.documentNumber || 'No especificado'}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Tipo de Persona
                  </Text>
                  <Badge
                    colorScheme={loan.person?.personType?.name === 'student' ? 'blue' : 'purple'}
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="md"
                  >
                    {getPersonTypeLabel(loan.person?.personType)}
                  </Badge>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Grado/Cargo
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {loan.person?.grade || 'No especificado'}
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* ✅ INFORMACIÓN DEL RECURSO */}
            <Box p={4} bg={cardBg} rounded="lg" border="1px" borderColor={borderColor}>
              <HStack spacing={3} mb={3}>
                <Icon as={FiBook} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  Información del Recurso
                </Text>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Título
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800" noOfLines={2}>
                    {loan.resource?.title || 'No especificado'}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    ISBN
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {loan.resource?.isbn || 'No especificado'}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Ubicación
                  </Text>
                  <HStack spacing={2}>
                    <Icon as={FiMapPin} color="blue.500" boxSize={4} />
                    <Text fontSize="md" fontWeight="semibold" color="gray.800">
                      {loan.resource?.location?.name || 'No especificado'}
                    </Text>
                  </HStack>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Cantidad Total
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {loan.resource?.totalQuantity || 0} unidades
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Cantidad Prestada
                  </Text>
                  <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="md">
                    {loan.quantity} {loan.quantity === 1 ? 'unidad' : 'unidades'}
                  </Badge>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* ✅ FECHAS DEL PRÉSTAMO */}
            <Box p={4} bg={cardBg} rounded="lg" border="1px" borderColor={borderColor}>
              <HStack spacing={3} mb={3}>
                <Icon as={FiCalendar} color="purple.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  Fechas del Préstamo
                </Text>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <VStack align="start" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="blue.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Fecha de Préstamo
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {formatDate(loan.loanDate)}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="orange.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Fecha de Vencimiento
                    </Text>
                  </HStack>
                  <Text 
                    fontSize="md" 
                    fontWeight="semibold"
                    color={loan.isOverdue ? "red.600" : "gray.800"}
                  >
                    {formatDate(loan.dueDate)}
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiRotateCcw} color="green.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Fecha de Devolución
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {loan.returnedDate ? formatDate(loan.returnedDate) : 'No devuelto'}
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* ✅ OBSERVACIONES */}
            {loan.observations && (
              <Box p={4} bg={cardBg} rounded="lg" border="1px" borderColor={borderColor}>
                <HStack spacing={3} mb={3}>
                  <Icon as={FiTag} color="teal.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                    Observaciones
                  </Text>
                </HStack>
                
                <Text fontSize="md" color="gray.700" bg="white" p={3} rounded="md" border="1px" borderColor={borderColor}>
                  {loan.observations}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              onClick={handleExport}
              colorScheme="blue"
            >
              Exportar
            </Button>
            
            <Button
              leftIcon={<FiPrinter />}
              variant="outline"
              onClick={handlePrint}
              colorScheme="gray"
            >
              Imprimir
            </Button>
            
            <Spacer />
            
            {canReturn && (
              <Button
                leftIcon={<FiRotateCcw />}
                colorScheme="green"
                onClick={handleReturnLoan}
              >
                Procesar Devolución
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoanDetailsModal; 