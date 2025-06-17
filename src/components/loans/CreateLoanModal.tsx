// src/components/loans/CreateLoanModal.tsx
// ================================================================
// MODAL PARA CREAR NUEVOS PRÉSTAMOS - CORREGIDO
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
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Box,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react';

// FIX: Usar react-icons en lugar de lucide-react
import { 
  FiSave, 
  FiRefreshCw, 
  FiUser, 
  FiBook, 
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText
} from 'react-icons/fi';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Importar hooks y tipos
import { useLoans, useLoanValidation } from '@/hooks/useLoans';
import type { CreateLoanRequest, LoanWithDetails } from '@/types/loan.types';

// ===== ESQUEMA DE VALIDACIÓN =====

const createLoanSchema = z.object({
  personId: z.string().min(1, 'Debe seleccionar una persona'),
  resourceId: z.string().min(1, 'Debe seleccionar un recurso'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0').max(50, 'Cantidad máxima: 50'),
  observations: z.string().optional()
});

type CreateLoanFormData = z.infer<typeof createLoanSchema>;

// ===== INTERFACES =====

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (loan: LoanWithDetails) => void;
}

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentNumber?: string;
  personType?: {
    name: string;
  };
}

interface Resource {
  _id: string;
  title: string;
  author?: string;
  isbn?: string;
  totalQuantity: number;
  availableQuantity: number;
}

// ===== COMPONENTE PRINCIPAL =====

export const CreateLoanModal: React.FC<CreateLoanModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const toast = useToast();
  
  // Estados
  const [people, setPeople] = useState<Person[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Hooks
  const { createLoan, loading: creating } = useLoans();
  const {
    isValid,
    validationErrors,
    loading: validating,
    validateLoan,
    canPersonBorrow,
    checkResourceAvailability
  } = useLoanValidation();

  // Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreateLoanFormData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      quantity: 1
    }
  });

  const watchedValues = watch();

  // ===== EFECTOS =====

  useEffect(() => {
    if (isOpen) {
      loadPeople();
      loadResources();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchedValues.personId && watchedValues.resourceId && watchedValues.quantity) {
      validateCurrentLoan();
    }
  }, [watchedValues.personId, watchedValues.resourceId, watchedValues.quantity]);

  // ===== FUNCIONES DE CARGA =====

  const loadPeople = async () => {
    setLoadingPeople(true);
    try {
      // Aquí deberías llamar a tu servicio para obtener personas
      // const response = await PersonService.getPeople({ active: true });
      // setPeople(response.data);
      
      // Mock data por ahora
      setPeople([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al cargar personas',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoadingPeople(false);
    }
  };

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      // Aquí deberías llamar a tu servicio para obtener recursos
      // const response = await ResourceService.getResources({ available: true });
      // setResources(response.data);
      
      // Mock data por ahora
      setResources([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al cargar recursos',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoadingResources(false);
    }
  };

  // ===== VALIDACIONES =====

  const validateCurrentLoan = async () => {
    if (!watchedValues.personId || !watchedValues.resourceId) return;

    try {
      await validateLoan({
        personId: watchedValues.personId,
        resourceId: watchedValues.resourceId,
        quantity: watchedValues.quantity || 1
      });
    } catch (error) {
      // Error manejado por el hook
    }
  };

  // ===== MANEJADORES =====

  // FIX: Tipos explícitos para los parámetros
  const handleFilterChange = (key: string, value: string | number | boolean) => {
    // Implementar filtrado si es necesario
  };

  const handlePersonChange = async (personId: string) => {
    setValue('personId', personId);
    
    const person = people.find(p => p._id === personId);
    setSelectedPerson(person || null);

    if (personId) {
      try {
        const canBorrow = await canPersonBorrow(personId);
        if (!canBorrow.canBorrow) {
          toast({
            title: 'Advertencia',
            description: canBorrow.reason || 'Esta persona no puede tomar préstamos',
            status: 'warning',
            duration: 5000,
            isClosable: true
          });
        }
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleResourceChange = async (resourceId: string) => {
    setValue('resourceId', resourceId);
    
    const resource = resources.find(r => r._id === resourceId);
    setSelectedResource(resource || null);

    if (resourceId) {
      try {
        const availability = await checkResourceAvailability(resourceId);
        if (!availability.canLoan) {
          toast({
            title: 'Advertencia',
            description: 'Este recurso no tiene unidades disponibles',
            status: 'warning',
            duration: 5000,
            isClosable: true
          });
        }
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleSubmit_Internal = async (data: CreateLoanFormData) => {
    try {
      const loan = await createLoan(data);
      
      toast({
        title: 'Éxito',
        description: 'Préstamo creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onSuccess?.(loan);
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el préstamo',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleClose = () => {
    reset();
    setSelectedPerson(null);
    setSelectedResource(null);
    onClose();
  };

  // ===== RENDER =====

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiBook />
            <Text>Crear Nuevo Préstamo</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(handleSubmit_Internal)}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Validación Global */}
              {validationErrors.length > 0 && (
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    {validationErrors.map((error, index) => (
                      <Text key={index} fontSize="sm">{error}</Text>
                    ))}
                  </Box>
                </Alert>
              )}

              {/* Selección de Persona */}
              <FormControl isInvalid={!!errors.personId} isRequired>
                <FormLabel>
                  <HStack>
                    <FiUser />
                    <Text>Persona</Text>
                  </HStack>
                </FormLabel>
                <Select
                  placeholder="Seleccionar persona..."
                  {...register('personId')}
                  onChange={(e) => handlePersonChange(e.target.value)}
                >
                  {loadingPeople ? (
                    <option disabled>Cargando personas...</option>
                  ) : (
                    people.map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.fullName} 
                        {person.documentNumber && ` - ${person.documentNumber}`}
                        {person.personType && ` (${person.personType.name})`}
                      </option>
                    ))
                  )}
                </Select>
                <FormErrorMessage>{errors.personId?.message}</FormErrorMessage>
              </FormControl>

              {/* Información de la Persona Seleccionada */}
              {selectedPerson && (
                <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{selectedPerson.fullName}</Text>
                      {selectedPerson.documentNumber && (
                        <Text fontSize="sm" color="gray.600">
                          Documento: {selectedPerson.documentNumber}
                        </Text>
                      )}
                    </VStack>
                    {selectedPerson.personType && (
                      <Badge colorScheme={selectedPerson.personType.name === 'student' ? 'blue' : 'purple'}>
                        {selectedPerson.personType.name === 'student' ? 'Estudiante' : 'Profesor'}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )}

              {/* Selección de Recurso */}
              <FormControl isInvalid={!!errors.resourceId} isRequired>
                <FormLabel>
                  <HStack>
                    <FiBook />
                    <Text>Recurso</Text>
                  </HStack>
                </FormLabel>
                <Select
                  placeholder="Seleccionar recurso..."
                  {...register('resourceId')}
                  onChange={(e) => handleResourceChange(e.target.value)}
                >
                  {loadingResources ? (
                    <option disabled>Cargando recursos...</option>
                  ) : (
                    resources.map((resource) => (
                      <option key={resource._id} value={resource._id}>
                        {resource.title}
                        {resource.author && ` - ${resource.author}`}
                        {` (Disponibles: ${resource.availableQuantity})`}
                      </option>
                    ))
                  )}
                </Select>
                <FormErrorMessage>{errors.resourceId?.message}</FormErrorMessage>
              </FormControl>

              {/* Información del Recurso Seleccionado */}
              {selectedResource && (
                <Box p={4} bg="green.50" borderRadius="md" borderLeft="4px solid" borderColor="green.500">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">{selectedResource.title}</Text>
                    {selectedResource.author && (
                      <Text fontSize="sm" color="gray.600">
                        Autor: {selectedResource.author}
                      </Text>
                    )}
                    {selectedResource.isbn && (
                      <Text fontSize="sm" color="gray.600">
                        ISBN: {selectedResource.isbn}
                      </Text>
                    )}
                    <HStack>
                      <Badge colorScheme="green">
                        Disponibles: {selectedResource.availableQuantity}
                      </Badge>
                      <Badge colorScheme="blue">
                        Total: {selectedResource.totalQuantity}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Cantidad */}
              <FormControl isInvalid={!!errors.quantity} isRequired>
                <FormLabel>Cantidad</FormLabel>
                <NumberInput min={1} max={selectedResource?.availableQuantity || 50}>
                  <NumberInputField {...register('quantity', { valueAsNumber: true })} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
              </FormControl>

              {/* Observaciones */}
              <FormControl isInvalid={!!errors.observations}>
                <FormLabel>
                  <HStack>
                    <FiFileText />
                    <Text>Observaciones (Opcional)</Text>
                  </HStack>
                </FormLabel>
                <Textarea
                  {...register('observations')}
                  placeholder="Observaciones adicionales del préstamo..."
                  rows={3}
                />
                <FormErrorMessage>{errors.observations?.message}</FormErrorMessage>
              </FormControl>

              {/* Estado de Validación */}
              {validating && (
                <HStack justify="center" p={4}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.600">Validando préstamo...</Text>
                </HStack>
              )}

              {isValid && !validating && watchedValues.personId && watchedValues.resourceId && (
                <Alert status="success">
                  <AlertIcon />
                  <Text fontSize="sm">El préstamo es válido y puede ser creado</Text>
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
                colorScheme="blue"
                leftIcon={creating ? <Spinner size="sm" /> : <FiSave />}
                isLoading={creating}
                isDisabled={!isValid || creating || validating}
              >
                {creating ? 'Creando...' : 'Crear Préstamo'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateLoanModal;