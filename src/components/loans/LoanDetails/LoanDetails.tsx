// components/loans/LoanDetails/LoanDetails.tsx
'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Divider,
  Box,
  Button,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiUser, FiBook, FiAlertTriangle, FiCheck, FiClock } from 'react-icons/fi';
import { Loan } from '@/types';
import { DateUtils } from '@/utils';

interface LoanDetailsProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onReturn?: (loanId: string) => void;
  onMarkAsLost?: (loanId: string) => void;
  isLoading?: boolean;
}

export function LoanDetails({
  loan,
  isOpen,
  onClose,
  onReturn,
  onMarkAsLost,
  isLoading = false,
}: LoanDetailsProps) {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  if (!loan) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'returned': return 'green';
      case 'overdue': return 'orange';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const isActive = loan.status?.name === 'active';
  const canTakeActions = isActive && !isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Detalles del Préstamo</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Estado del préstamo */}
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold">
                Estado del Préstamo
              </Text>
              <Badge
                colorScheme={getStatusColor(loan.status?.name || 'active')}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {loan.status?.description || 'Activo'}
              </Badge>
            </HStack>

            {/* Alerta si está vencido */}
            {loan.isOverdue && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Préstamo Vencido</Text>
                  <Text fontSize="sm">
                    Este préstamo lleva {loan.daysOverdue} días vencido
                  </Text>
                </Box>
              </Alert>
            )}

            {/* Información de la persona */}
            <Box bg={cardBg} p={4} borderRadius="md">
              <VStack spacing={3} align="start">
                <Text fontWeight="bold" color={textColor} fontSize="sm">
                  PERSONA
                </Text>
                <HStack spacing={3}>
                  <Avatar size="md" name={loan.person?.fullName} />
                  <VStack spacing={0} align="start">
                    <Text fontWeight="bold" fontSize="lg">
                      {loan.person?.fullName || 'Usuario no especificado'}
                    </Text>
                    <HStack spacing={2} color={textColor}>
                      <Text fontSize="sm">{loan.person?.documentNumber}</Text>
                      <Text fontSize="sm">•</Text>
                      <Text fontSize="sm">{loan.person?.grade}</Text>
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Información del recurso */}
            <Box bg={cardBg} p={4} borderRadius="md">
              <VStack spacing={3} align="start">
                <Text fontWeight="bold" color={textColor} fontSize="sm">
                  RECURSO
                </Text>
                <HStack spacing={3} align="start">
                  <FiBook size={24} />
                  <VStack spacing={1} align="start">
                    <Text fontWeight="bold" fontSize="lg">
                      {loan.resource?.title || 'Recurso no especificado'}
                    </Text>
                    {loan.resource?.isbn && (
                      <Text fontSize="sm" color={textColor} fontFamily="mono">
                        ISBN: {loan.resource.isbn}
                      </Text>
                    )}
                    <HStack spacing={2}>
                      <Text fontSize="sm" color={textColor}>
                        Cantidad:
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        {loan.quantity}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Fechas importantes */}
            <SimpleGrid columns={2} spacing={4}>
              <Stat bg={cardBg} p={4} borderRadius="md">
                <StatLabel color={textColor}>
                  <HStack spacing={2}>
                    <FiCalendar />
                    <Text>Fecha de Préstamo</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="md">
                  {DateUtils.formatDate(loan.loanDate)}
                </StatNumber>
                <StatHelpText>
                  {DateUtils.formatRelative(loan.loanDate)}
                </StatHelpText>
              </Stat>

              <Stat bg={cardBg} p={4} borderRadius="md">
                <StatLabel color={textColor}>
                  <HStack spacing={2}>
                    <FiClock />
                    <Text>Fecha de Vencimiento</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="md" color={loan.isOverdue ? 'orange.500' : 'inherit'}>
                  {DateUtils.formatDate(loan.dueDate)}
                </StatNumber>
                <StatHelpText color={loan.isOverdue ? 'orange.500' : 'inherit'}>
                  {loan.isOverdue ? `Vencido hace ${loan.daysOverdue} días` : DateUtils.formatRelative(loan.dueDate)}
                </StatHelpText>
              </Stat>

              {loan.returnedDate && (
                <Stat bg={cardBg} p={4} borderRadius="md">
                  <StatLabel color={textColor}>
                    <HStack spacing={2}>
                      <FiCheck />
                      <Text>Fecha de Devolución</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="md" color="green.500">
                    {DateUtils.formatDate(loan.returnedDate)}
                  </StatNumber>
                  <StatHelpText>
                    {DateUtils.formatRelative(loan.returnedDate)}
                  </StatHelpText>
                </Stat>
              )}
            </SimpleGrid>

            {/* Observaciones */}
            {loan.observations && (
              <Box bg={cardBg} p={4} borderRadius="md">
                <VStack spacing={2} align="start">
                  <Text fontWeight="bold" color={textColor} fontSize="sm">
                    OBSERVACIONES
                  </Text>
                  <Text fontSize="sm">{loan.observations}</Text>
                </VStack>
              </Box>
            )}

            {/* Información de sistema */}
            <Box bg={cardBg} p={4} borderRadius="md">
              <SimpleGrid columns={2} spacing={4}>
                <VStack spacing={1} align="start">
                  <Text fontWeight="bold" color={textColor} fontSize="xs">
                    CREADO
                  </Text>
                  <Text fontSize="sm">{DateUtils.formatDateTime(loan.createdAt)}</Text>
                </VStack>
                <VStack spacing={1} align="start">
                  <Text fontWeight="bold" color={textColor} fontSize="xs">
                    ACTUALIZADO
                  </Text>
                  <Text fontSize="sm">{DateUtils.formatDateTime(loan.updatedAt)}</Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button onClick={onClose}>
              Cerrar
            </Button>
            
            {canTakeActions && (
              <>
                {onMarkAsLost && (
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => onMarkAsLost(loan._id)}
                    isLoading={isLoading}
                  >
                    Marcar como Perdido
                  </Button>
                )}
                
                {onReturn && (
                  <Button
                    colorScheme="green"
                    onClick={() => onReturn(loan._id)}
                    isLoading={isLoading}
                  >
                    Procesar Devolución
                  </Button>
                )}
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}