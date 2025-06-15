// app/loans/[id]/page.tsx
'use client';

import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Card,
  CardBody,
  SimpleGrid,
  Avatar,
  Badge,
  Divider,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  useDisclosure,
  Skeleton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiX, FiCalendar, FiUser, FiBook, FiAlertTriangle, FiClock, FiEdit } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { LoanHistory } from '@/components/loans';
import { loanService } from '@/services/loan.service';
import { useReturnLoan } from '@/hooks/useLoans';
import { Loan, LoanResponse } from '@/types/loan.types';
import { DateUtils } from '@/utils';

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;

  const [loan, setLoan] = useState<LoanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnObservations, setReturnObservations] = useState('');
  const [lostObservations, setLostObservations] = useState('');

  const { isOpen: isReturnOpen, onOpen: onReturnOpen, onClose: onReturnClose } = useDisclosure();
  const { isOpen: isLostOpen, onOpen: onLostOpen, onClose: onLostClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { returnLoan, markAsLost, loading: processing } = useReturnLoan();
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Cargar datos del préstamo
  useEffect(() => {
    if (loanId) {
      fetchLoan();
    }
  }, [loanId]);

  const fetchLoan = async () => {
    setLoading(true);
    setError(null);

    try {
      const loanData = await loanService.getLoanById(loanId);
      setLoan(loanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar préstamo');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!loan) return;

    const result = await returnLoan({
      loanId: loan.loan._id,
      returnObservations: returnObservations.trim() || undefined,
    });

    if (result) {
      setReturnObservations('');
      onReturnClose();
      fetchLoan(); // Recargar datos
    }
  };

  const handleMarkAsLost = async () => {
    if (!loan || !lostObservations.trim()) return;

    const result = await markAsLost(loan.loan._id, lostObservations.trim());
    
    if (result) {
      setLostObservations('');
      onLostClose();
      fetchLoan(); // Recargar datos
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'returned': return 'green';
      case 'overdue': return 'orange';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <Container maxW="6xl" py={8}>
            <VStack spacing={6} align="stretch">
              <Skeleton height="40px" width="300px" />
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Skeleton height="400px" />
                <Skeleton height="400px" />
              </SimpleGrid>
            </VStack>
          </Container>
        </DashboardLayout>
      </AuthenticatedRoute>
    );
  }

  if (error || !loan) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <Container maxW="6xl" py={8}>
            <VStack spacing={6} align="stretch">
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={() => router.back()}
                variant="ghost"
                alignSelf="start"
              >
                Volver
              </Button>
              
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error || 'Préstamo no encontrado'}
              </Alert>
            </VStack>
          </Container>
        </DashboardLayout>
      </AuthenticatedRoute>
    );
  }

  const isActive = loan?.loan.status?.name === 'active';
  const canTakeActions = isActive && !processing;

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header con navegación */}
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="center">
                <Button
                  leftIcon={<FiArrowLeft />}
                  onClick={() => router.back()}
                  variant="ghost"
                >
                  Volver
                </Button>

                <Breadcrumb>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => router.push('/loans')}>
                      Préstamos
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>Detalles</BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
              </HStack>

              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2}>
                  <Heading size="lg">Detalles del Préstamo</Heading>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={getStatusColor(loan.loan.status?.name || 'active')}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {loan.loan.status?.description}
                    </Badge>
                    {loan.loan.isOverdue && (
                      <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                        Vencido {loan.loan.daysOverdue} días
                      </Badge>
                    )}
                  </HStack>
                </VStack>

                {canTakeActions && (
                  <HStack spacing={3}>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FiX />}
                      onClick={onLostOpen}
                      isLoading={processing}
                    >
                      Marcar como Perdido
                    </Button>
                    <Button
                      colorScheme="green"
                      leftIcon={<FiCheck />}
                      onClick={onReturnOpen}
                      isLoading={processing}
                    >
                      Procesar Devolución
                    </Button>
                  </HStack>
                )}
              </HStack>
            </VStack>

            {/* Alerta si está vencido */}
            {loan.loan.isOverdue && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">¡Préstamo Vencido!</Text>
                  <Text fontSize="sm">
                    Este préstamo lleva {loan.loan.daysOverdue} días vencido. 
                    Es importante gestionar la devolución para mantener el inventario actualizado.
                  </Text>
                </Box>
              </Alert>
            )}

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              {/* Información principal */}
              <VStack spacing={6} align="stretch">
                {/* Información de la persona */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack spacing={4} align="start">
                      <HStack spacing={2}>
                        <FiUser />
                        <Text fontWeight="bold" color={textColor} fontSize="sm">
                          PERSONA
                        </Text>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Avatar size="lg" name={loan.loan.person?.fullName} />
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" fontSize="xl">
                            {loan.loan.person?.fullName || 'Usuario no especificado'}
                          </Text>
                          <HStack spacing={2} color={textColor}>
                            <Text fontSize="sm">{loan.loan.person?.documentNumber}</Text>
                            <Text fontSize="sm">•</Text>
                            <Text fontSize="sm">{loan.loan.person?.grade}</Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Información del recurso */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack spacing={4} align="start">
                      <HStack spacing={2}>
                        <FiBook />
                        <Text fontWeight="bold" color={textColor} fontSize="sm">
                          RECURSO
                        </Text>
                      </HStack>
                      
                      <VStack spacing={2} align="start" width="100%">
                        <Text fontWeight="bold" fontSize="xl">
                          {loan.loan.resource?.title || 'Recurso no especificado'}
                        </Text>
                        
                        {loan.loan.resource?.isbn && (
                          <Text fontSize="sm" color={textColor} fontFamily="mono">
                            ISBN: {loan.loan.resource.isbn}
                          </Text>
                        )}
                        
                        <HStack spacing={4} width="100%">
                          <VStack spacing={0} align="start">
                            <Text fontSize="xs" color={textColor}>CANTIDAD</Text>
                            <Badge colorScheme="blue" size="sm">
                              {loan.loan.quantity}
                            </Badge>
                          </VStack>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Observaciones */}
                {loan.loan.observations && (
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack spacing={3} align="start">
                        <Text fontWeight="bold" color={textColor} fontSize="sm">
                          OBSERVACIONES
                        </Text>
                        <Text fontSize="sm">{loan.loan.observations}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>

              {/* Información temporal y estadísticas */}
              <VStack spacing={6} align="stretch">
                {/* Fechas importantes */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={2}>
                        <FiCalendar />
                        <Text fontWeight="bold" color={textColor} fontSize="sm">
                          FECHAS IMPORTANTES
                        </Text>
                      </HStack>

                      <SimpleGrid columns={1} spacing={4}>
                        <Stat size="sm">
                          <StatLabel>Fecha de Préstamo</StatLabel>
                          <StatNumber fontSize="md">
                            {DateUtils.formatDate(loan.loan.loanDate)}
                          </StatNumber>
                          <StatHelpText>
                            {DateUtils.formatRelative(loan.loan.loanDate)}
                          </StatHelpText>
                        </Stat>

                        <Divider />

                        <Stat size="sm">
                          <StatLabel>Fecha de Vencimiento</StatLabel>
                          <StatNumber fontSize="md" color={loan.loan.isOverdue ? 'orange.500' : 'inherit'}>
                            {DateUtils.formatDate(loan.loan.dueDate)}
                          </StatNumber>
                          <StatHelpText color={loan.loan.isOverdue ? 'orange.500' : 'inherit'}>
                            {loan.loan.isOverdue ? 
                              `Vencido hace ${loan.loan.daysOverdue} días` : 
                              DateUtils.formatRelative(loan.loan.dueDate)
                            }
                          </StatHelpText>
                        </Stat>

                        {loan.loan.returnedDate && (
                          <>
                            <Divider />
                            <Stat size="sm">
                              <StatLabel>Fecha de Devolución</StatLabel>
                              <StatNumber fontSize="md" color="green.500">
                                {DateUtils.formatDate(loan.loan.returnedDate)}
                              </StatNumber>
                              <StatHelpText>
                                {DateUtils.formatRelative(loan.loan.returnedDate)}
                              </StatHelpText>
                            </Stat>
                          </>
                        )}
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Información del sistema */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={2}>
                        <FiClock />
                        <Text fontWeight="bold" color={textColor} fontSize="sm">
                          INFORMACIÓN DEL SISTEMA
                        </Text>
                      </HStack>

                      <SimpleGrid columns={1} spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>Creado:</Text>
                          <Text fontSize="sm">{DateUtils.formatDateTime(loan.loan.createdAt)}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>Actualizado:</Text>
                          <Text fontSize="sm">{DateUtils.formatDateTime(loan.loan.updatedAt)}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>ID:</Text>
                          <Text fontSize="xs" fontFamily="mono" color={textColor}>
                            {loan.loan._id}
                          </Text>
                        </HStack>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>

            {/* Historial relacionado */}
            <Card bg={cardBg}>
              <CardBody>
                <LoanHistory
                  personId={loan.loan.personId}
                  title={`Otros préstamos de ${loan.loan.person?.fullName}`}
                  limit={5}
                />
              </CardBody>
            </Card>
          </VStack>
        </Container>

        {/* Modal de devolución */}
        <AlertDialog
          isOpen={isReturnOpen}
          leastDestructiveRef={cancelRef}
          onClose={onReturnClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Procesar Devolución
              </AlertDialogHeader>

              <AlertDialogBody>
                <VStack spacing={4} align="stretch">
                  <Text>
                    ¿Confirmas la devolución del recurso "<strong>{loan.loan.resource?.title}</strong>"?
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
                  isLoading={processing}
                >
                  Confirmar Devolución
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Modal para marcar como perdido */}
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
                  <Alert status="warning" size="sm">
                    <AlertIcon />
                    Esta acción marcará el recurso como perdido permanentemente.
                  </Alert>
                  
                  <Text>
                    ¿Confirmas que el recurso "<strong>{loan.loan.resource?.title}</strong>" se ha perdido?
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
                  isLoading={processing}
                  isDisabled={!lostObservations.trim()}
                >
                  Marcar como Perdido
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}