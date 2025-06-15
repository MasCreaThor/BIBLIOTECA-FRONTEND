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
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [observations, setObservations] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { checkCanBorrow, loading: loadingCanBorrow, error: canBorrowError } = useCanBorrow();

  const handlePersonSelected = (person: Person | null) => {
    setSelectedPerson(person);
    setError(null);
  };

  const handleResourceSelected = (resource: Resource | null) => {
    setSelectedResource(resource);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedPerson) {
      setError('Debes seleccionar una persona');
      return;
    }

    if (!selectedResource) {
      setError('Debes seleccionar un recurso');
      return;
    }

    const canBorrowResult = await checkCanBorrow(selectedPerson._id);
    if (!canBorrowResult?.canBorrow) {
      setError(canBorrowResult?.reason || canBorrowError || 'La persona no puede realizar más préstamos');
      return;
    }

    onSubmit({
      personId: selectedPerson._id,
      resourceId: selectedResource._id,
      quantity,
      observations: observations.trim() || undefined,
    });
  };

  const handleClose = () => {
    setSelectedPerson(null);
    setSelectedResource(null);
    setQuantity(1);
    setObservations('');
    setError(null);
    onClose();
  };

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

  // Obtener color del badge según disponibilidad
  const getAvailabilityBadgeColor = (available: boolean) => {
    return available ? 'green' : 'red';
  };

  // Obtener color del estado de préstamo
  const getBorrowStatusColor = (canBorrow: boolean) => {
    return canBorrow ? 'success' : 'warning';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crear Nuevo Préstamo</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text>{error}</Text>
              </Alert>
            )}

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
            <FormControl isRequired>
              <FormLabel>Persona</FormLabel>
              <PersonSearch
                onPersonSelected={handlePersonSelected}
                selectedPerson={selectedPerson}
                isDisabled={isLoading}
              />
            </FormControl>

            {/* Selección de recurso */}
            <FormControl isRequired>
              <FormLabel>Recurso</FormLabel>
              <ResourceSearch
                onSelect={handleResourceSelected}
                isDisabled={isLoading}
                filterAvailable={true}
              />
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
            <FormControl isInvalid={!!error}>
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
              <FormErrorMessage>{error}</FormErrorMessage>
              <FormHelperText>
                Máximo 5 unidades por préstamo
              </FormHelperText>
            </FormControl>

            {/* Observaciones */}
            <FormControl isInvalid={!!error}>
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
                <FormErrorMessage flex={1}>{error}</FormErrorMessage>
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
              <Card bg={useColorModeValue('gray.50', 'gray.700')} variant="filled">
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
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading || loadingCanBorrow}
            isDisabled={!selectedPerson || !selectedResource || loadingCanBorrow}
          >
            Crear Préstamo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}