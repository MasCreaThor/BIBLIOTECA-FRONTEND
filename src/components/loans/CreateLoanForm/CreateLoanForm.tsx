// src/components/loans/CreateLoanForm/CreateLoanForm.tsx
'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Badge,
  Avatar,
  Box,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Spinner,
  Card,
  CardBody,
  Divider,
  Icon,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { PersonSearch } from '@/components/people';
import { ResourceSearch } from '@/components/resources';
import { Person } from '@/types/api.types';
import { Resource } from '@/types/resource.types';
import { CreateLoanRequest } from '@/types/loan.types';
import { useCanBorrow } from '@/hooks/useLoans';
import { 
  FiUser, 
  FiBook, 
  FiAlertTriangle, 
  FiCheck, 
  FiInfo, 
  FiClock, 
  FiCalendar,
  FiFileText,
  FiHash
} from 'react-icons/fi';

interface CreateLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (loanData: CreateLoanRequest) => void;
  isLoading?: boolean;
}

export function CreateLoanForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateLoanFormProps) {
  // Estados del formulario
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [borrowStatus, setBorrowStatus] = useState<any>(null);

  // Hooks
  const { checkCanBorrow, loading: checkingBorrow } = useCanBorrow();
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Verificar si la persona puede pedir préstamos cuando se selecciona
  useEffect(() => {
    if (selectedPerson?._id) {
      console.log('Checking borrow status for person:', selectedPerson._id);
      checkCanBorrow(selectedPerson._id).then((result) => {
        console.log('Borrow status result:', result);
        setBorrowStatus(result);
      });
    } else {
      setBorrowStatus(null);
    }
  }, [selectedPerson, checkCanBorrow]);

  // Calcular fecha de vencimiento
  const dueDate = useMemo(() => {
    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 15); // 15 días por defecto
    return due.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPerson) {
      newErrors.person = 'Debe seleccionar una persona';
    }

    if (!selectedResource) {
      newErrors.resource = 'Debe seleccionar un recurso';
    }

    // Validaciones específicas del recurso
    if (selectedResource && !selectedResource.available) {
      newErrors.resource = 'El recurso seleccionado no está disponible para préstamo';
    }

    // Validar cantidad
    if (quantity < 1 || quantity > 5) {
      newErrors.quantity = 'La cantidad debe estar entre 1 y 5';
    }

    // Validar observaciones
    if (observations && observations.length > 500) {
      newErrors.observations = 'Las observaciones no pueden exceder 500 caracteres';
    }

    // Validar estado de préstamo de la persona
    if (borrowStatus && !borrowStatus.canBorrow) {
      newErrors.person = borrowStatus.reason || 'La persona no puede solicitar préstamos en este momento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    const loanData: CreateLoanRequest = {
      personId: selectedPerson!._id,
      resourceId: selectedResource!._id,
      quantity,
      observations: observations.trim() || undefined,
    };

    console.log('Submitting loan data:', loanData);
    onSubmit(loanData);
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isLoading) {
      console.log('Closing loan form');
      setSelectedPerson(null);
      setSelectedResource(null);
      setQuantity(1);
      setObservations('');
      setErrors({});
      setBorrowStatus(null);
      onClose();
    }
  };

  // Verificar si se puede enviar el formulario
  const canSubmit = selectedPerson && 
                   selectedResource && 
                   selectedResource.available && 
                   borrowStatus?.canBorrow !== false &&
                   !isLoading &&
                   !checkingBorrow;

  // Obtener color del badge según disponibilidad
  const getAvailabilityBadgeColor = (available: boolean) => {
    return available ? 'green' : 'red';
  };

  // Obtener color del estado de préstamo
  const getBorrowStatusColor = (canBorrow: boolean) => {
    return canBorrow ? 'success' : 'warning';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="xl" 
      closeOnOverlayClick={!isLoading}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiFileText} color="blue.500" boxSize={6} />
            <Text>Crear Nuevo Préstamo</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Información del préstamo */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  Información del préstamo
                </Text>
                <Text fontSize="xs" mt={1}>
                  El préstamo se registrará por 15 días calendario. 
                  Fecha de vencimiento: <strong>{dueDate}</strong>
                </Text>
              </Box>
            </Alert>

            {/* Selección de persona */}
            <FormControl isInvalid={!!errors.person}>
              <FormLabel>
                <HStack spacing={2}>
                  <Icon as={FiUser} color="blue.500" />
                  <Text>Persona</Text>
                  <Text fontSize="xs" color="red.500">*</Text>
                </HStack>
              </FormLabel>
              <PersonSearch
                onPersonSelected={setSelectedPerson}
                selectedPerson={selectedPerson}
                placeholder="Buscar por nombre, apellido o documento..."
                isDisabled={isLoading}
              />
              <FormErrorMessage>{errors.person}</FormErrorMessage>
              
              {/* Información de la persona seleccionada */}
              {selectedPerson && (
                <Box mt={3}>
                  <Card size="sm" variant="outline">
                    <CardBody>
                      <HStack spacing={3}>
                        <Avatar 
                          size="sm" 
                          name={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
                        />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {selectedPerson.firstName} {selectedPerson.lastName}
                          </Text>
                          <HStack spacing={2} fontSize="xs" color="gray.600">
                            {selectedPerson.documentNumber && (
                              <Text>Doc: {selectedPerson.documentNumber}</Text>
                            )}
                            {selectedPerson.grade && (
                              <Text>Grado: {selectedPerson.grade}</Text>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>

                  {/* Estado de préstamos de la persona */}
                  <Box mt={2}>
                    {checkingBorrow ? (
                      <HStack spacing={2}>
                        <Spinner size="sm" />
                        <Text fontSize="sm" color="gray.500">
                          Verificando disponibilidad para préstamos...
                        </Text>
                      </HStack>
                    ) : borrowStatus ? (
                      <Alert 
                        status={getBorrowStatusColor(borrowStatus.canBorrow)} 
                        size="sm"
                        borderRadius="md"
                      >
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="medium" fontSize="sm">
                            {borrowStatus.canBorrow 
                              ? '✅ Puede solicitar préstamos' 
                              : '⚠️ No puede solicitar préstamos'
                            }
                          </Text>
                          {borrowStatus.reason && (
                            <Text fontSize="xs" mt={1}>{borrowStatus.reason}</Text>
                          )}
                          {borrowStatus.activeLoansCount !== undefined && (
                            <HStack spacing={1} mt={1}>
                              <Text fontSize="xs">
                                Préstamos activos: {borrowStatus.activeLoansCount}/{borrowStatus.maxLoansAllowed || 3}
                              </Text>
                              <Progress 
                                value={(borrowStatus.activeLoansCount / (borrowStatus.maxLoansAllowed || 3)) * 100}
                                size="sm"
                                width="60px"
                                colorScheme={borrowStatus.activeLoansCount >= (borrowStatus.maxLoansAllowed || 3) ? 'red' : 'green'}
                              />
                            </HStack>
                          )}
                        </Box>
                      </Alert>
                    ) : null}
                  </Box>
                </Box>
              )}
            </FormControl>

            <Divider />

            {/* Selección de recurso */}
            <FormControl isInvalid={!!errors.resource}>
              <FormLabel>
                <HStack spacing={2}>
                  <Icon as={FiBook} color="green.500" />
                  <Text>Recurso</Text>
                  <Text fontSize="xs" color="red.500">*</Text>
                </HStack>
              </FormLabel>
              <ResourceSearch
                onSelect={setSelectedResource}
                placeholder="Buscar por título, autor o ISBN..."
                isDisabled={isLoading}
                filterAvailable={true}
              />
              <FormErrorMessage>{errors.resource}</FormErrorMessage>
              <FormHelperText>
                Solo se muestran recursos disponibles para préstamo
              </FormHelperText>
            </FormControl>

            {/* Información del recurso seleccionado */}
            {selectedResource && (
              <Card size="sm" variant="outline">
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          {selectedResource.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {selectedResource.authors && selectedResource.authors.length > 0 
                            ? selectedResource.authors[0].name 
                            : 'Autor no especificado'}
                        </Text>
                        {selectedResource.isbn && (
                          <HStack spacing={1} fontSize="xs" color="gray.500">
                            <Icon as={FiHash} />
                            <Text>ISBN: {selectedResource.isbn}</Text>
                          </HStack>
                        )}
                      </VStack>
                      <Badge 
                        colorScheme={getAvailabilityBadgeColor(selectedResource.available)}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {selectedResource.available ? 'Disponible' : 'No disponible'}
                      </Badge>
                    </HStack>
                    
                    {/* Información adicional del recurso */}
                    {selectedResource.category && (
                      <HStack spacing={2} fontSize="xs">
                        <Text color="gray.500">Categoría:</Text>
                        <Badge size="sm" variant="outline">
                          {selectedResource.category.name}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            <Divider />

            {/* Cantidad */}
            <FormControl isInvalid={!!errors.quantity}>
              <FormLabel>
                <HStack spacing={2}>
                  <Icon as={FiHash} color="purple.500" />
                  <Text>Cantidad</Text>
                </HStack>
              </FormLabel>
              <NumberInput
                min={1}
                max={5}
                value={quantity}
                onChange={(_, value) => setQuantity(value || 1)}
                isDisabled={isLoading}
                size="md"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.quantity}</FormErrorMessage>
              <FormHelperText>
                Máximo 5 unidades por préstamo
              </FormHelperText>
            </FormControl>

            {/* Observaciones */}
            <FormControl isInvalid={!!errors.observations}>
              <FormLabel>
                <HStack spacing={2}>
                  <Icon as={FiFileText} color="orange.500" />
                  <Text>Observaciones</Text>
                  <Text fontSize="xs" color="gray.500">(opcional)</Text>
                </HStack>
              </FormLabel>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Comentarios adicionales sobre el préstamo..."
                maxLength={500}
                isDisabled={isLoading}
                rows={3}
                resize="vertical"
              />
              <HStack justify="space-between" mt={1}>
                <FormErrorMessage flex={1}>{errors.observations}</FormErrorMessage>
                <Text fontSize="xs" color="gray.500">
                  {observations.length}/500
                </Text>
              </HStack>
              <FormHelperText>
                Información adicional sobre el préstamo (opcional)
              </FormHelperText>
            </FormControl>

            {/* Resumen del préstamo */}
            {selectedPerson && selectedResource && (
              <Card bg={cardBg} variant="filled">
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={2}>
                      <Icon as={FiCheck} color="green.500" />
                      <Text fontSize="sm" fontWeight="medium">
                        Resumen del préstamo
                      </Text>
                    </HStack>
                    <VStack spacing={2} align="stretch" fontSize="sm">
                      <HStack justify="space-between">
                        <Text color="gray.600">Persona:</Text>
                        <Text fontWeight="medium">
                          {selectedPerson.firstName} {selectedPerson.lastName}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Recurso:</Text>
                        <Text fontWeight="medium" textAlign="right">
                          {selectedResource.title}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Cantidad:</Text>
                        <Text fontWeight="medium">{quantity}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Fecha límite:</Text>
                        <Text fontWeight="medium">{dueDate}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} width="100%">
            <Button
              variant="ghost"
              onClick={handleClose}
              isDisabled={isLoading}
              flex={1}
            >
              Cancelar
            </Button>
            <Tooltip 
              label={!canSubmit ? 'Complete todos los campos requeridos' : ''}
              isDisabled={!!canSubmit}
            >
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Creando préstamo..."
                isDisabled={!canSubmit}
                leftIcon={<Icon as={FiCheck} />}
                flex={1}
              >
                Crear Préstamo
              </Button>
            </Tooltip>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}