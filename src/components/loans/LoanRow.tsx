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
}

// ===== COMPONENTE PRINCIPAL =====

const LoanRow: React.FC<LoanRowProps> = ({ 
  loan, 
  onUpdate, 
  onViewDetails,
  onReturnLoan 
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
        <Td>
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium" fontSize="sm">
              {loan.person?.fullName || 'N/A'}
            </Text>
            <HStack spacing={2}>
              {getPersonTypeBadge(loan.person?.personType)}
              {loan.person?.documentNumber && (
                <Text fontSize="xs" color="gray.500">
                  {loan.person.documentNumber}
                </Text>
              )}
            </HStack>
          </VStack>
        </Td>

        {/* Información del Recurso */}
        <Td>
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
              {loan.resource?.title || 'N/A'}
            </Text>
            {loan.resource?.author && (
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {loan.resource.author}
              </Text>
            )}
          </VStack>
        </Td>

        {/* Fecha de Préstamo */}
        <Td>
          <HStack spacing={2}>
            <FiCalendar size={14} color="gray" />
            <Text fontSize="sm">{formatDate(loan.loanDate)}</Text>
          </HStack>
        </Td>

        {/* Fecha de Vencimiento */}
        <Td>
          <HStack spacing={2}>
            <FiClock 
              size={14} 
              color={loan.isOverdue ? "red" : "gray"} 
            />
            <Text 
              fontSize="sm"
              color={loan.isOverdue ? "red.500" : "gray.600"}
            >
              {formatDate(loan.dueDate)}
            </Text>
          </HStack>
        </Td>

        {/* Estado */}
        <Td>
          <Badge
            colorScheme={statusInfo.colorScheme}
            variant={statusInfo.variant}
          >
            <StatusIcon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {statusInfo.label}
          </Badge>
        </Td>

        {/* Cantidad */}
        <Td>
          <Badge colorScheme="blue" variant="outline">
            {loan.quantity}
          </Badge>
        </Td>

        {/* Acciones */}
        <Td>
          <HStack spacing={2}>
            {/* Acciones Rápidas */}
            {canReturn && (
              <Tooltip label="Devolución rápida">
                <IconButton
                  size="sm"
                  aria-label="Devolución rápida"
                  icon={<FiCheck />}
                  colorScheme="green"
                  variant="outline"
                  onClick={onOpen}
                  isDisabled={processing}
                />
              </Tooltip>
            )}

            <Tooltip label="Ver detalles">
              <IconButton
                size="sm"
                aria-label="Ver detalles"
                icon={<FiEye />}
                variant="outline"
                onClick={handleViewDetails}
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
        </Td>
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