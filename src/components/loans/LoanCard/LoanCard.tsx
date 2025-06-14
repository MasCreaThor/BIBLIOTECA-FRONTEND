// components/loans/LoanCard/LoanCard.tsx
'use client';

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Avatar,
  Divider,
  Tooltip,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { FiCalendar, FiUser, FiBook, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { Loan } from '@/types/loan.types';
import { DateUtils } from '@/utils';

interface LoanCardProps {
  loan: Loan;
  onReturn?: (loanId: string, observations?: string) => void;
  onMarkAsLost?: (loanId: string, observations: string) => void;
  compact?: boolean;
  showActions?: boolean;
  isLoading?: boolean;
}

export function LoanCard({
  loan,
  onReturn,
  onMarkAsLost,
  compact = false,
  showActions = true,
  isLoading = false,
}: LoanCardProps) {
  const [returnObservations, setReturnObservations] = useState('');
  const [lostObservations, setLostObservations] = useState('');
  const { isOpen: isReturnOpen, onOpen: onReturnOpen, onClose: onReturnClose } = useDisclosure();
  const { isOpen: isLostOpen, onOpen: onLostOpen, onClose: onLostClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'blue';
      case 'returned':
        return 'green';
      case 'overdue':
        return 'orange';
      case 'lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getOverdueColor = (daysOverdue: number) => {
    if (daysOverdue <= 0) return 'green';
    if (daysOverdue <= 3) return 'yellow';
    if (daysOverdue <= 7) return 'orange';
    return 'red';
  };

  const handleReturn = () => {
    if (onReturn) {
      onReturn(loan._id, returnObservations.trim() || undefined);
      setReturnObservations('');
      onReturnClose();
    }
  };

  const handleMarkAsLost = () => {
    if (onMarkAsLost && lostObservations.trim()) {
      onMarkAsLost(loan._id, lostObservations.trim());
      setLostObservations('');
      onLostClose();
    }
  };

  return (
    <>
      <Card
        bg={cardBg}
        borderColor={loan.isOverdue ? 'orange.300' : borderColor}
        borderWidth={loan.isOverdue ? '2px' : '1px'}
        shadow={loan.isOverdue ? 'lg' : 'sm'}
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        opacity={isLoading ? 0.6 : 1}
        position="relative"
      >
        <CardBody p={compact ? 4 : 6}>
          <VStack spacing={compact ? 3 : 4} align="stretch">
            {/* Header con persona y estado */}
            <HStack justify="space-between" align="start">
              <HStack spacing={3}>
                <Avatar
                  size={compact ? 'sm' : 'md'}
                  name={loan.person?.fullName}
                  src={undefined}
                />
                <VStack spacing={0} align="start">
                  <Text fontWeight="bold" fontSize={compact ? 'sm' : 'md'}>
                    {loan.person?.fullName || 'Usuario no especificado'}
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    {loan.person?.documentNumber} • {loan.person?.grade}
                  </Text>
                </VStack>
              </HStack>
              
              <Badge
                colorScheme={getStatusColor(loan.status?.name || 'active')}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
              >
                {loan.status?.description || 'Activo'}
              </Badge>
            </HStack>

            {/* Información del recurso */}
            <VStack spacing={1} align="start">
              <HStack spacing={2}>
                <FiBook />
                <Text fontWeight="medium" fontSize={compact ? 'sm' : 'md'}>
                  {loan.resource?.title || 'Recurso no especificado'}
                </Text>
              </HStack>
              {loan.resource?.isbn && (
                <Text fontSize="xs" color={textColor} fontFamily="mono">
                  ISBN: {loan.resource.isbn}
                </Text>
              )}
            </VStack>

            <Divider />

            {/* Fechas */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2} color={textColor}>
                  <FiCalendar size={14} />
                  <Text fontSize="xs">Prestado:</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="medium">
                  {DateUtils.formatDate(loan.loanDate)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2} color={textColor}>
                  <FiCalendar size={14} />
                  <Text fontSize="xs">Vence:</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="medium">
                  {DateUtils.formatDate(loan.dueDate)}
                </Text>
              </HStack>

              {loan.isOverdue && loan.daysOverdue && (
                <HStack justify="space-between">
                  <HStack spacing={2} color="orange.500">
                    <FiAlertTriangle size={14} />
                    <Text fontSize="xs">Vencido:</Text>
                  </HStack>
                  <Badge
                    colorScheme={getOverdueColor(loan.daysOverdue)}
                    fontSize="xs"
                  >
                    {loan.daysOverdue} días
                  </Badge>
                </HStack>
              )}

              {loan.returnedDate && (
                <HStack justify="space-between">
                  <HStack spacing={2} color="green.500">
                    <FiCheck size={14} />
                    <Text fontSize="xs">Devuelto:</Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="medium">
                    {DateUtils.formatDate(loan.returnedDate)}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Observaciones */}
            {loan.observations && (
              <>
                <Divider />
                <VStack spacing={1} align="start">
                  <Text fontSize="xs" fontWeight="medium" color={textColor}>
                    Observaciones:
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    {loan.observations}
                  </Text>
                </VStack>
              </>
            )}

            {/* Acciones */}
            {showActions && loan.status?.name === 'active' && (
              <>
                <Divider />
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    leftIcon={<FiCheck />}
                    onClick={onReturnOpen}
                    isLoading={isLoading}
                    flex={1}
                  >
                    Devolver
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<FiX />}
                    onClick={onLostOpen}
                    isLoading={isLoading}
                  >
                    Perdido
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Dialog para devolver préstamo */}
      <AlertDialog
        isOpen={isReturnOpen}
        leastDestructiveRef={cancelRef}
        onClose={onReturnClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Devolver Préstamo
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  ¿Confirmas la devolución del recurso "{loan.resource?.title}"?
                </Text>
                
                <FormControl>
                  <FormLabel fontSize="sm">Observaciones (opcional)</FormLabel>
                  <Textarea
                    value={returnObservations}
                    onChange={(e) => setReturnObservations(e.target.value)}
                    placeholder="Agregar observaciones sobre el estado del recurso..."
                    size="sm"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onReturnClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="green"
                onClick={handleReturn}
                ml={3}
                isLoading={isLoading}
              >
                Confirmar Devolución
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Dialog para marcar como perdido */}
      <AlertDialog
        isOpen={isLostOpen}
        leastDestructiveRef={cancelRef}
        onClose={onLostClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Marcar como Perdido
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  ¿Confirmas que el recurso "{loan.resource?.title}" se ha perdido?
                </Text>
                
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Observaciones</FormLabel>
                  <Textarea
                    value={lostObservations}
                    onChange={(e) => setLostObservations(e.target.value)}
                    placeholder="Describe las circunstancias de la pérdida..."
                    size="sm"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onLostClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleMarkAsLost}
                ml={3}
                isLoading={isLoading}
                isDisabled={!lostObservations.trim()}
              >
                Marcar como Perdido
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}