// src/components/loans/ReturnModal.tsx
// ================================================================
// MODAL DE PROCESAMIENTO DE DEVOLUCIONES - COMPLETO Y CORREGIDO
// ================================================================

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Badge,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';

// FIX: Usar react-icons/fi en lugar de lucide-react
import { 
  FiX, 
  FiSave, 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiUser,
  FiBook,
  FiAlertCircle,
  FiFileText
} from 'react-icons/fi';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar tipos y hooks
import type { LoanWithDetails, ReturnLoanRequest } from '@/types/loan.types';
import { useReturn } from '@/hooks/useLoans';

// ===== ESQUEMA DE VALIDACIÓN =====

const returnLoanSchema = z.object({
  returnDate: z.string().min(1, 'La fecha de devolución es requerida'),
  resourceCondition: z.enum(['good', 'damaged', 'lost'], {
    errorMap: () => ({ message: 'Debe seleccionar el estado del recurso' })
  }),
  returnObservations: z.string().optional()
});

type ReturnLoanFormData = z.infer<typeof returnLoanSchema>;

// ===== INTERFACES =====

interface ReturnModalProps {
  loan: LoanWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ===== COMPONENTE PRINCIPAL =====

const ReturnModal: React.FC<ReturnModalProps> = ({
  loan,
  isOpen,
  onClose,
  onSuccess
}) => {
  const toast = useToast();
  
  // Estados locales
  const [processing, setProcessing] = useState(false);
  const [calculateFine, setCalculateFine] = useState(false);

  // Hooks
  const { returnLoan } = useReturn();

  // Valores de color
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Form hook
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ReturnLoanFormData>({
    resolver: zodResolver(returnLoanSchema),
    defaultValues: {
      returnDate: format(new Date(), 'yyyy-MM-dd'),
      resourceCondition: 'good',
      returnObservations: ''
    }
  });

  const watchedCondition = watch('resourceCondition');

  // ===== EFECTOS =====

  useEffect(() => {
    if (isOpen && loan) {
      // Resetear el formulario cuando se abre el modal
      reset({
        returnDate: format(new Date(), 'yyyy-MM-dd'),
        resourceCondition: 'good',
        returnObservations: ''
      });
      
      // Verificar si necesita calcular multa
      setCalculateFine(loan.isOverdue || false);
    }
  }, [isOpen, loan, reset]);

  // ===== FUNCIONES DE UTILIDAD =====

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getConditionInfo = (condition: string) => {
    switch (condition) {
      case 'good':
        return {
          label: 'Buen Estado',
          colorScheme: 'green',
          icon: FiCheckCircle,
          description: 'El recurso se encuentra en perfecto estado'
        };
      case 'damaged':
        return {
          label: 'Dañado',
          colorScheme: 'orange',
          icon: FiAlertTriangle,
          description: 'El recurso presenta daños menores'
        };
      case 'lost':
        return {
          label: 'Perdido',
          colorScheme: 'red',
          icon: FiX,
          description: 'El recurso se ha perdido y no puede ser devuelto'
        };
      default:
        return {
          label: 'Desconocido',
          colorScheme: 'gray',
          icon: FiAlertCircle,
          description: 'Estado no definido'
        };
    }
  };

  const calculatePotentialFine = () => {
    if (!loan?.isOverdue || !loan.daysOverdue) return 0;
    
    // Ejemplo de cálculo de multa: $500 por día de retraso
    const finePerDay = 500;
    return loan.daysOverdue * finePerDay;
  };

  // ===== MANEJADORES =====

  const handleSubmitForm = async (data: ReturnLoanFormData) => {
    if (!loan) return;

    setProcessing(true);
    try {
      const request: ReturnLoanRequest = {
        loanId: loan._id,
        returnDate: data.returnDate,
        resourceCondition: data.resourceCondition,
        returnObservations: data.returnObservations || undefined
      };

      await returnLoan(request);

      toast({
        title: 'Éxito',
        description: 'Devolución procesada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onSuccess?.();
      handleClose();
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
    }
  };

  const handleClose = () => {
    reset();
    setCalculateFine(false);
    onClose();
  };

  // ===== INFORMACIÓN DERIVADA =====

  if (!loan) return null;

  const conditionInfo = getConditionInfo(watchedCondition);
  const ConditionIcon = conditionInfo.icon;
  const potentialFine = calculatePotentialFine();

  // ===== RENDER =====

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <FiRefreshCw />
            <Text>Procesar Devolución</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Información del Préstamo */}
              <Box
                p={4}
                bg={useColorModeValue('blue.50', 'blue.900')}
                border="1px"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
                borderLeft="4px"
                borderLeftColor="blue.500"
                rounded="md"
              >
                <VStack align="start" spacing={3}>
                  {/* Información de la Persona */}
                  <HStack spacing={3}>
                    <FiUser color="gray" />
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">
                        {loan.person?.fullName || 'N/A'}
                      </Text>
                      <HStack spacing={2}>
                        {loan.person?.personType && (
                          <Badge
                            colorScheme={loan.person.personType.name === 'student' ? 'blue' : 'purple'}
                          >
                            {loan.person.personType.name === 'student' ? 'Estudiante' : 'Profesor'}
                          </Badge>
                        )}
                        {loan.person?.documentNumber && (
                          <Text fontSize="sm" color="gray.600">
                            Doc: {loan.person.documentNumber}
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  </HStack>

                  {/* Información del Recurso */}
                  <HStack spacing={3}>
                    <FiBook color="gray" />
                    <Box>
                      <Text fontWeight="medium">
                        {loan.resource?.title || 'N/A'}
                      </Text>
                      <VStack align="start" spacing={1}>
                        {loan.resource?.author && (
                          <Text fontSize="sm" color="gray.600">
                            Autor: {loan.resource.author}
                          </Text>
                        )}
                        <HStack spacing={4}>
                          <Text fontSize="sm" color="gray.600">
                            Cantidad: {loan.quantity}
                          </Text>
                          {loan.resource?.isbn && (
                            <Text fontSize="sm" color="gray.600">
                              ISBN: {loan.resource.isbn}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              {/* Fechas del Préstamo */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={3}>
                  Información del Préstamo
                </Text>
                <HStack justify="space-between" spacing={4}>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <FiCalendar size={16} color="blue" />
                      <Text fontSize="sm" color="gray.500">Fecha de préstamo</Text>
                    </HStack>
                    <Text fontWeight="medium">{formatDate(loan.loanDate)}</Text>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <FiClock size={16} color={loan.isOverdue ? "red" : "green"} />
                      <Text fontSize="sm" color="gray.500">Fecha de vencimiento</Text>
                    </HStack>
                    <Text 
                      fontWeight="medium"
                      color={loan.isOverdue ? "red.500" : "gray.900"}
                    >
                      {formatDate(loan.dueDate)}
                    </Text>
                  </VStack>

                  {loan.isOverdue && (
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <FiAlertTriangle size={16} color="red" />
                        <Text fontSize="sm" color="gray.500">Días vencido</Text>
                      </HStack>
                      <Badge colorScheme="red" fontSize="sm">
                        {loan.daysOverdue} días
                      </Badge>
                    </VStack>
                  )}
                </HStack>
              </Box>

              <Divider />

              {/* Formulario de Devolución */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={4}>
                  Datos de la Devolución
                </Text>
                
                <VStack spacing={4} align="stretch">
                  {/* Fecha de Devolución */}
                  <FormControl isInvalid={!!errors.returnDate} isRequired>
                    <FormLabel>
                      <HStack>
                        <FiCalendar />
                        <Text>Fecha de Devolución</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="date"
                      {...register('returnDate')}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <FormErrorMessage>{errors.returnDate?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Estado del Recurso */}
                  <FormControl isInvalid={!!errors.resourceCondition} isRequired>
                    <FormLabel>Estado del Recurso</FormLabel>
                    <Select {...register('resourceCondition')}>
                      <option value="good">Buen Estado</option>
                      <option value="damaged">Dañado</option>
                      <option value="lost">Perdido</option>
                    </Select>
                    <FormErrorMessage>{errors.resourceCondition?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Información del Estado Seleccionado */}
                  <Box
                    p={3}
                    bg={`${conditionInfo.colorScheme}.50`}
                    border="1px"
                    borderColor={`${conditionInfo.colorScheme}.200`}
                    rounded="md"
                  >
                    <HStack spacing={2}>
                      <ConditionIcon size={16} />
                      <Text fontSize="sm" fontWeight="medium">
                        {conditionInfo.label}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {conditionInfo.description}
                    </Text>
                  </Box>

                  {/* Observaciones */}
                  <FormControl isInvalid={!!errors.returnObservations}>
                    <FormLabel>
                      <HStack>
                        <FiFileText />
                        <Text>Observaciones (Opcional)</Text>
                      </HStack>
                    </FormLabel>
                    <Textarea
                      {...register('returnObservations')}
                      placeholder="Observaciones adicionales sobre la devolución..."
                      rows={3}
                    />
                    <FormErrorMessage>{errors.returnObservations?.message}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </Box>

              {/* Alertas y Advertencias */}
              {loan.isOverdue && (
                <Alert status="warning">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Préstamo Vencido
                    </Text>
                    <Text fontSize="xs">
                      Este préstamo está vencido desde hace {loan.daysOverdue} días.
                      {potentialFine > 0 && ` Multa estimada: $${potentialFine.toLocaleString()}`}
                    </Text>
                  </VStack>
                </Alert>
              )}

              {watchedCondition === 'damaged' && (
                <Alert status="warning">
                  <AlertIcon />
                  <Text fontSize="sm">
                    El recurso se marcará como dañado y requerirá revisión antes de poder ser prestado nuevamente.
                  </Text>
                </Alert>
              )}

              {watchedCondition === 'lost' && (
                <Alert status="error">
                  <AlertIcon />
                  <Text fontSize="sm">
                    El recurso se marcará como perdido y se iniciará el proceso de reposición.
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <Divider />

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme={watchedCondition === 'lost' ? 'red' : 'green'}
                isLoading={processing}
                leftIcon={processing ? <FiRefreshCw /> : <FiSave />}
              >
                {processing 
                  ? 'Procesando...' 
                  : watchedCondition === 'lost' 
                    ? 'Marcar como Perdido'
                    : 'Procesar Devolución'
                }
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ReturnModal;