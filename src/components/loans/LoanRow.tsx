// src/components/loans/LoanRow.tsx
// ================================================================
// COMPONENTE DE FILA INDIVIDUAL DE PRÉSTAMO - COMPLETO Y CORREGIDO
// ================================================================

import React, { useState } from 'react';
import {
  Box,
  Tr,
  Td,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  useColorModeValue,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure
} from '@chakra-ui/react';

// FIX: Usar react-icons/fi en lugar de lucide-react
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiXCircle,
  FiEye,
  FiRotateCcw,
  FiRefreshCw,
  FiMoreHorizontal,
  FiCheck,
  FiX
} from 'react-icons/fi';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar tipos y hooks
import type { LoanWithDetails } from '@/types/loan.types';
import { useReturn } from '@/hooks/useLoans';
import { LoanService } from '@/services/loan.service';

// ===== INTERFACES =====

interface LoanRowProps {
  loan: LoanWithDetails;
  onUpdate?: () => void;
  onViewDetails?: (loan: LoanWithDetails) => void;
  onReturnLoan?: (loan: LoanWithDetails) => void;
  hidePerson?: boolean;
  hideActions?: boolean;
}

// ===== COMPONENTE PRINCIPAL =====

const LoanRow: React.FC<LoanRowProps> = ({ 
  loan, 
  onUpdate, 
  onViewDetails,
  onReturnLoan,
  hidePerson = false,
  hideActions = false
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [processing, setProcessing] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Hooks
  const { returnLoan } = useReturn();

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // ===== FUNCIONES DE UTILIDAD =====

  const formatDate = (date: Date | string) => {
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
        variant: 'solid' as const
      };
    }
    
    if (loan.isOverdue) {
      return {
        icon: FiAlertTriangle,
        label: `Vencido (${loan.daysOverdue} días)`,
        colorScheme: 'red',
        variant: 'solid' as const
      };
    }
    
    if (loan.status?.name === 'lost') {
      return {
        icon: FiXCircle,
        label: 'Perdido',
        colorScheme: 'gray',
        variant: 'solid' as const
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
        variant: 'solid' as const
      };
    }
    
    return {
      icon: FiCheckCircle,
      label: 'Activo',
      colorScheme: 'green',
      variant: 'outline' as const
    };
  };

  const getPersonTypeBadge = (personType?: { name: string }) => {
    if (!personType) return null;
    
    return (
      <Badge
        size="sm"
        colorScheme={personType.name === 'student' ? 'blue' : 'purple'}
        variant="subtle"
      >
        {personType.name === 'student' ? 'Estudiante' : 'Profesor'}
      </Badge>
    );
  };

  // ===== MANEJADORES =====

  const handleQuickReturn = async () => {
    setProcessing(true);
    try {
      await returnLoan({
        loanId: loan._id,
        returnDate: new Date().toISOString(),
        resourceCondition: 'good',
        returnObservations: 'Devolución rápida desde la lista'
      });
      
      toast({
        title: 'Éxito',
        description: 'Préstamo devuelto correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar la devolución',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  const handleRenewLoan = async () => {
    setRenewLoading(true);
    try {
      await LoanService.renewLoan(loan._id);
      
      toast({
        title: 'Éxito',
        description: 'Préstamo renovado por 15 días más',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al renovar el préstamo',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setRenewLoading(false);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(loan);
  };

  const handleProcessReturn = () => {
    onReturnLoan?.(loan);
  };

  // ===== INFORMACIÓN DEL ESTADO =====

  const statusInfo = getStatusInfo(loan);
  const StatusIcon = statusInfo.icon;
  const canReturn = loan.status?.name === 'active' || loan.isOverdue;
  const canRenew = loan.status?.name === 'active' && !loan.isOverdue;

  // ===== RENDER =====

  return (
    <>
      <Tr _hover={{ bg: hoverBg }} transition="background-color 0.2s">
        {/* Información de la Persona */}
        {!hidePerson && (
          <Td px={4} py={4} w="200px" textAlign="left">
            <VStack align="start" spacing={2} minH="60px" justify="center">
              <Text fontWeight="semibold" fontSize="sm" color="gray.800" noOfLines={2} maxW="180px">
                {loan.person?.fullName || 'N/A'}
              </Text>
              <HStack spacing={2} minH="20px">
                {getPersonTypeBadge(loan.person?.personType)}
                {loan.person?.documentNumber ? (
                  <Text fontSize="xs" color="gray.500" bg="gray.100" px={2} py={1} rounded="md">
                    {loan.person.documentNumber}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.400" bg="gray.50" px={2} py={1} rounded="md" fontStyle="italic">
                    Sin documento
                  </Text>
                )}
              </HStack>
            </VStack>
          </Td>
        )}

        {/* Información del Recurso */}
        <Td px={4} py={4} w="200px" textAlign="left">
          <VStack align="start" spacing={2} minH="60px" justify="center">
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

        {/* Fecha de Préstamo */}
        <Td px={4} py={4} w="120px" textAlign="center">
          <HStack spacing={2} minH="60px" align="center" justify="center">
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

        {/* Fecha de Vencimiento */}
        <Td px={4} py={4} w="120px" textAlign="center">
          <HStack spacing={2} minH="60px" align="center" justify="center">
            <Box 
              p={1} 
              bg={loan.isOverdue ? "red.100" : "orange.100"} 
              rounded="md" 
              color={loan.isOverdue ? "red.600" : "orange.600"}
              flexShrink={0}
            >
              <FiClock size={14} />
            </Box>
            <VStack align="start" spacing={0} flex="1">
              <Text 
                fontSize="sm" 
                fontWeight="medium"
                color={loan.isOverdue ? "red.600" : "gray.800"}
              >
                {formatDate(loan.dueDate)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Vencimiento
              </Text>
            </VStack>
          </HStack>
        </Td>

        {/* Estado */}
        <Td px={4} py={4} w="120px" textAlign="center">
          <Box minH="60px" display="flex" alignItems="center" justifyContent="center">
            <Badge
              colorScheme={statusInfo.colorScheme}
              variant={statusInfo.variant}
              px={3}
              py={2}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
            >
              <HStack spacing={1}>
                <StatusIcon size={12} />
                <Text>{statusInfo.label}</Text>
              </HStack>
            </Badge>
          </Box>
        </Td>

        {/* Cantidad */}
        <Td px={4} py={4} w="100px" textAlign="center">
          <Box minH="60px" display="flex" alignItems="center" justifyContent="center">
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

        {/* Acciones */}
        {!hideActions && (
        <Td px={4} py={4} w="150px" textAlign="center">
          <Box minH="60px" display="flex" alignItems="center" justifyContent="center">
            <HStack spacing={2}>
              {/* Acciones Rápidas */}
              {canReturn && (
                <Tooltip label="Devolución rápida" placement="top">
                  <IconButton
                    size="sm"
                    aria-label="Devolución rápida"
                    icon={<FiCheck />}
                    colorScheme="green"
                    variant="outline"
                    onClick={onOpen}
                    isDisabled={processing}
                    borderRadius="md"
                  />
                </Tooltip>
              )}

              <Tooltip label="Ver detalles" placement="top">
                <IconButton
                  size="sm"
                  aria-label="Ver detalles"
                  icon={<FiEye />}
                  variant="outline"
                  onClick={handleViewDetails}
                  borderRadius="md"
                />
              </Tooltip>

              {/* Menú de Más Opciones */}
              <Menu>
                <MenuButton
                  as={IconButton}
                  size="sm"
                  aria-label="Más opciones"
                  icon={<FiMoreHorizontal />}
                  variant="outline"
                  borderRadius="md"
                >
                </MenuButton>
                <MenuList>
                  {canReturn && (
                    <MenuItem
                      icon={<FiRotateCcw />}
                      onClick={handleProcessReturn}
                    >
                      Procesar Devolución
                    </MenuItem>
                  )}
                  
                  {canRenew && (
                    <MenuItem
                      icon={<FiRefreshCw />}
                      onClick={handleRenewLoan}
                      isDisabled={renewLoading}
                    >
                      {renewLoading ? 'Renovando...' : 'Renovar Préstamo'}
                    </MenuItem>
                  )}
                  
                  <MenuItem icon={<FiEye />} onClick={handleViewDetails}>
                    Ver Detalles Completos
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Box>
        </Td>
        )}
      </Tr>

      {/* Diálogo de Confirmación de Devolución Rápida */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar Devolución Rápida
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="start" spacing={3}>
                <Text>
                  ¿Estás seguro de que quieres procesar la devolución de este préstamo?
                </Text>
                
                <Box p={3} bg="blue.50" rounded="md" w="full">
                  <Text fontSize="sm" fontWeight="medium">
                    {loan.person?.fullName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {loan.resource?.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Cantidad: {loan.quantity}
                  </Text>
                </Box>

                <Text fontSize="sm" color="gray.600">
                  Esto marcará el recurso como devuelto en buen estado.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="green"
                onClick={handleQuickReturn}
                ml={3}
                isLoading={processing}
                leftIcon={<FiCheck />}
              >
                Confirmar Devolución
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default LoanRow;