// src/components/loans/CreateLoanModal.tsx
// ================================================================
// MODAL PARA CREAR NUEVOS PRÉSTAMOS - VERSIÓN MEJORADA CON BÚSQUEDA DINÁMICA
// ================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  useToast,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  useDisclosure
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
  FiFileText,
  FiSearch,
  FiInfo,
  FiClock,
  FiShield,
  FiX,
  FiPlus
} from 'react-icons/fi';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Importar hooks y tipos
import { useLoans, useLoanValidation } from '@/hooks/useLoans';
import { PersonService } from '@/services/person.service';
import { ResourceService } from '@/services/resource.service';
import type { CreateLoanRequest, LoanWithDetails } from '@/types/loan.types';
import type { Person } from '@/types/api.types';
import type { Resource } from '@/types/resource.types';
import { useRouter } from 'next/navigation';

// ===== ESQUEMA DE VALIDACIÓN =====

const createLoanSchema = z.object({
  personId: z.string().min(1, 'Debe seleccionar una persona'),
  resourceId: z.string().min(1, 'Debe seleccionar un recurso'),
  quantity: z.number()
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(1000, 'Cantidad máxima: 1000'),
  observations: z.string()
    .max(500, 'Las observaciones no deben exceder 500 caracteres')
    .optional()
});

type CreateLoanFormData = z.infer<typeof createLoanSchema>;

// ===== INTERFACES =====

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (loan: LoanWithDetails) => void;
  preSelectedResourceId?: string;
}

// Usar el tipo Person directamente ya que ya incluye personType
type PersonWithType = Person;

// Usar el tipo Resource directamente ya que ya incluye los campos necesarios
type ResourceWithStock = Resource;

interface ValidationState {
  personValid: boolean;
  resourceValid: boolean;
  quantityValid: boolean;
  overallValid: boolean;
  errors: string[];
  warnings: string[];
}

// ===== COMPONENTE PRINCIPAL =====

export const CreateLoanModal: React.FC<CreateLoanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedResourceId
}) => {
  const toast = useToast();
  const router = useRouter();
  
  // Estados
  const [people, setPeople] = useState<PersonWithType[]>([]);
  const [resources, setResources] = useState<ResourceWithStock[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithType | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceWithStock | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    personValid: false,
    resourceValid: false,
    quantityValid: false,
    overallValid: false,
    errors: [],
    warnings: []
  });
  const [searchPerson, setSearchPerson] = useState('');
  const [searchResource, setSearchResource] = useState('');
  const [showPersonResults, setShowPersonResults] = useState(false);
  const [showResourceResults, setShowResourceResults] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  
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
    control,
    formState: { errors, isValid: formIsValid }
  } = useForm<CreateLoanFormData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      quantity: 1
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  // ===== EFECTOS =====

  useEffect(() => {
    if (isOpen) {
      setPeople([]); // Limpiar resultados al abrir
      loadResources();
      
      // ✅ NUEVO: Pre-seleccionar recurso si se proporciona un ID
      if (preSelectedResourceId) {
        preSelectResource(preSelectedResourceId);
      }
    }
  }, [isOpen, preSelectedResourceId]);

  // Validación automática cuando cambian los valores
  useEffect(() => {
    if (watchedValues.personId && watchedValues.resourceId && watchedValues.quantity) {
      validateCurrentLoan();
    } else {
      // Limpiar validación si faltan campos
      setValidationState({
        personValid: false,
        resourceValid: false,
        quantityValid: false,
        overallValid: false,
        errors: [],
        warnings: []
      });
    }
  }, [watchedValues.personId, watchedValues.resourceId, watchedValues.quantity, selectedPerson, selectedResource]);

  // Búsqueda de personas en tiempo real con debounce
  useEffect(() => {
    if (!searchPerson || !searchPerson.trim()) {
      setPeople([]);
      return;
    }
    setLoadingPeople(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await PersonService.searchPeople(searchPerson, 10);
        setPeople(results);
      } catch (error) {
        setPeople([]);
      } finally {
        setLoadingPeople(false);
      }
    }, 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPerson]);

  // Cerrar resultados de búsqueda cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowPersonResults(false);
        setShowResourceResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ===== FUNCIONES DE CARGA =====

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const response = await ResourceService.searchResourcesForLoan({
        limit: 100,
        sortBy: 'title',
        sortOrder: 'asc'
      });
      setResources(response);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al cargar recursos',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  // ✅ NUEVO: Función para pre-seleccionar un recurso
  const preSelectResource = async (resourceId: string) => {
    try {
      setLoadingResources(true);
      const resource = await ResourceService.getResourceById(resourceId);
      if (resource) {
        setSelectedResource(resource);
        setValue('resourceId', resource._id);
        setSearchResource(resource.title);
        setShowResourceResults(false);
      }
    } catch (error) {
      console.error('Error pre-seleccionando recurso:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  // ===== VALIDACIONES =====

  const validateCurrentLoan = async () => {
    console.log('🔍 validateCurrentLoan llamado con:', {
      personId: watchedValues.personId,
      resourceId: watchedValues.resourceId,
      quantity: watchedValues.quantity,
      selectedResource,
      selectedPerson
    });

    if (!watchedValues.personId || !watchedValues.resourceId || !watchedValues.quantity) {
      console.log('🔍 Validación cancelada - faltan campos requeridos');
      return;
    }

    try {
      // ✅ VALIDACIONES LOCALES PRIMERO
      const localErrors: string[] = [];
      const localWarnings: string[] = [];
      let localResourceValid = true;
      let localPersonValid = true;
      let localQuantityValid = true;

      // ✅ CORRECCIÓN: Obtener disponibilidad actualizada del backend
      let currentAvailability = null;
      try {
        currentAvailability = await checkResourceAvailability(watchedValues.resourceId);
        console.log('🔍 Disponibilidad actualizada del backend:', currentAvailability);
      } catch (error) {
        console.error('🔍 Error obteniendo disponibilidad:', error);
        localErrors.push('No se pudo verificar la disponibilidad del recurso');
        localResourceValid = false;
      }

      // Validar estado del recurso
      if (selectedResource) {
        console.log('🔍 Validando estado del recurso:', selectedResource.stateId);
        if (selectedResource.stateId && typeof selectedResource.stateId === 'object') {
          const state = selectedResource.stateId as any;
          console.log('🔍 Estado del recurso:', state);
          if (state.name === 'damaged' || state.name === 'lost' || state.name === 'maintenance') {
            const errorMsg = `El recurso no se puede prestar porque está en estado: ${state.description || state.name}`;
            console.log('🔍 Error de estado:', errorMsg);
            localErrors.push(errorMsg);
            localResourceValid = false;
          }
        }

        // ✅ CORRECCIÓN: Usar disponibilidad del backend en lugar de datos locales
        if (currentAvailability) {
          if (!currentAvailability.canLoan) {
            localErrors.push('Recurso no disponible: stock insuficiente');
            localResourceValid = false;
          }

          // Validar cantidad vs disponibilidad real
          if (watchedValues.quantity > currentAvailability.availableQuantity) {
            localErrors.push(`Cantidad solicitada (${watchedValues.quantity}) excede la disponibilidad (${currentAvailability.availableQuantity})`);
            localQuantityValid = false;
          }
        } else {
          // Fallback a datos locales si no se pudo obtener del backend
          if ((selectedResource.availableQuantity || 0) <= 0) {
            localErrors.push('No hay unidades disponibles del recurso');
            localResourceValid = false;
          }

          if (watchedValues.quantity > (selectedResource.availableQuantity || 0)) {
            localErrors.push(`Cantidad solicitada (${watchedValues.quantity}) excede la disponibilidad (${selectedResource.availableQuantity || 0})`);
            localQuantityValid = false;
          }
        }
      }

      // Validar cantidad según tipo de persona
      if (selectedPerson?.personType?.name === 'student' && watchedValues.quantity > 1) {
        localErrors.push('Los estudiantes solo pueden prestar 1 unidad');
        localQuantityValid = false;
      }

      console.log('🔍 Errores locales encontrados:', localErrors);

      // Si hay errores locales, no hacer validación del backend
      if (localErrors.length > 0) {
        console.log('🔍 Estableciendo estado de validación con errores locales');
        setValidationState({
          personValid: localPersonValid,
          resourceValid: localResourceValid,
          quantityValid: localQuantityValid,
          overallValid: false,
          errors: localErrors,
          warnings: localWarnings
        });
        return;
      }

      // ✅ VALIDACIÓN DEL BACKEND
      const validationData: CreateLoanRequest = {
        personId: watchedValues.personId,
        resourceId: watchedValues.resourceId,
        quantity: watchedValues.quantity,
        observations: watchedValues.observations
      };

      const result = await validateLoan(validationData);
      
      // Combinar validaciones locales y del backend
      setValidationState({
        personValid: localPersonValid && (result.personInfo?.canBorrow || false),
        resourceValid: localResourceValid && (result.resourceInfo?.available || false),
        quantityValid: localQuantityValid && (result.quantityInfo?.requested <= (result.quantityInfo?.maxAllowed || 0)),
        overallValid: localErrors.length === 0 && result.isValid,
        errors: [...localErrors, ...(result.errors || [])],
        warnings: [...localWarnings, ...(result.warnings || [])]
      });
    } catch (error: any) {
      console.error('🔍 Error en validación:', error);
      setValidationState({
        personValid: false,
        resourceValid: false,
        quantityValid: false,
        overallValid: false,
        errors: [error.message || 'Error de validación'],
        warnings: []
      });
    }
  };

  // ===== MANEJADORES DE CAMBIO =====

  const handlePersonSelect = async (person: PersonWithType) => {
    setSelectedPerson(person);
    setValue('personId', person._id);
    setSearchPerson(person.fullName || '');
    setShowPersonResults(false);
    
    try {
      const canBorrow = await canPersonBorrow(person._id);
      if (!canBorrow.canBorrow) {
        toast({
          title: 'Persona no elegible',
          description: canBorrow.reason || 'La persona no puede realizar préstamos',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      }
    } catch (error: any) {
      console.error('Error al verificar elegibilidad:', error);
    }
  };

  const handleResourceSelect = async (resource: ResourceWithStock) => {
    console.log('🔍 handleResourceSelect llamado con:', resource);
    setSelectedResource(resource);
    setValue('resourceId', resource._id);
    setSearchResource(resource.title || '');
    setShowResourceResults(false);
    
    // ✅ FORZAR VALIDACIÓN INMEDIATA si ya tenemos persona y cantidad
    if (watchedValues.personId && watchedValues.quantity) {
      console.log('🔍 Forzando validación inmediata...');
      setTimeout(() => validateCurrentLoan(), 100);
    }
    
    try {
      const availability = await checkResourceAvailability(resource._id);
      
      // Validar si el recurso se puede prestar
      if (!availability.canLoan) {
        let reason = 'Stock insuficiente';
        
        // Verificar si es por estado del recurso
        if (resource.stateId && typeof resource.stateId === 'object') {
          const state = resource.stateId as any;
          if (state.name === 'damaged' || state.name === 'lost' || state.name === 'maintenance') {
            reason = `Estado: ${state.description || state.name}`;
          }
        }
        
        // Verificar si es por disponibilidad
        if (availability.availableQuantity <= 0) {
          reason = 'No hay unidades disponibles';
        }
        
        toast({
          title: 'Recurso no disponible',
          description: reason,
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
        
        // ✅ NO limpiar la selección - permitir que se muestre el error en la validación
        // setSelectedResource(null);
        // setValue('resourceId', '');
        // setSearchResource('');
        // return;
      }
      
      // Ajustar cantidad máxima según disponibilidad
      const maxQuantity = selectedPerson?.personType?.name === 'student' 
        ? Math.min(availability.availableQuantity, 1)  // Estudiantes: máximo 1 unidad
        : availability.availableQuantity;              // Docentes: toda la cantidad disponible
      
      if (watchedValues.quantity > maxQuantity) {
        setValue('quantity', maxQuantity);
      }
    } catch (error: any) {
      console.error('Error al verificar disponibilidad:', error);
      toast({
        title: 'Error al verificar recurso',
        description: 'No se pudo verificar la disponibilidad del recurso',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleQuantityChange = (value: number) => {
    setValue('quantity', value);
    
    // Validar cantidad según tipo de persona
    if (selectedPerson?.personType?.name === 'student' && value > 1) {
      toast({
        title: 'Cantidad inválida',
        description: 'Los estudiantes solo pueden prestar 1 unidad',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      setValue('quantity', 1);
    }
  };

  // ===== ENVÍO DEL FORMULARIO =====

  const handleSubmit_Internal = async (data: CreateLoanFormData) => {
    try {
      const loan = await createLoan(data);
      
      toast({
        title: 'Préstamo creado',
        description: 'El préstamo se ha creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      if (onSuccess) {
        onSuccess(loan);
      }
      
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
    setValidationState({
      personValid: false,
      resourceValid: false,
      quantityValid: false,
      overallValid: false,
      errors: [],
      warnings: []
    });
    setSearchPerson('');
    setSearchResource('');
    setShowPersonResults(false);
    setShowResourceResults(false);
    onClose();
  };

  // ===== FILTROS =====

  const filteredResources = useMemo(() => {
    if (!searchResource.trim()) return [];
    
    return resources.filter(resource => {
      const searchTerm = searchResource.toLowerCase();
      const title = resource.title?.toLowerCase() || '';
      const authors = resource.authors?.some(author => 
        author.name?.toLowerCase().includes(searchTerm)
      ) || false;
      const isbn = resource.isbn?.toLowerCase() || '';
      
      return title.includes(searchTerm) || authors || isbn.includes(searchTerm);
    }).slice(0, 10); // Limitar a 10 resultados
  }, [resources, searchResource]);

  // ===== CÁLCULOS =====

  const maxQuantityForPerson = useMemo(() => {
    if (!selectedPerson?.personType) return 5;
    
    switch (selectedPerson.personType.name) {
      case 'student':
        return 1;
      case 'teacher':
        return selectedResource?.availableQuantity || 50;
      default:
        return 5;
    }
  }, [selectedPerson, selectedResource]);

  const canSubmit = useMemo(() => {
    // Validaciones básicas del formulario (sin depender de observaciones)
    const hasRequiredFields = !!watchedValues.personId && !!watchedValues.resourceId && !!watchedValues.quantity;
    const basicValid = hasRequiredFields && !creating && !validating;
    
    // Validar que se haya seleccionado una persona
    const personSelected = !!selectedPerson && !!watchedValues.personId;
    
    // Validar que se haya seleccionado un recurso
    const resourceSelected = !!selectedResource && !!watchedValues.resourceId;
    
    // Validar que el recurso se pueda prestar
    const resourceCanBeLoaned = !selectedResource || (() => {
      if (selectedResource.stateId && typeof selectedResource.stateId === 'object') {
        const state = selectedResource.stateId as any;
        // No se puede prestar si está dañado, perdido o en mantenimiento
        if (state.name === 'damaged' || state.name === 'lost' || state.name === 'maintenance') {
          return false;
        }
      }
      // Verificar que haya unidades disponibles
      return (selectedResource.availableQuantity || 0) > 0;
    })();
    
    // Validar cantidad
    const quantityValid = watchedValues.quantity > 0 && watchedValues.quantity <= maxQuantityForPerson;
    
    // Validar que no haya errores de validación del backend
    const noValidationErrors = validationState.errors.length === 0;
    
    // El botón se habilita si:
    // 1. Tiene todos los campos requeridos
    // 2. No está creando ni validando
    // 3. Ha seleccionado persona y recurso
    // 4. El recurso se puede prestar
    // 5. La cantidad es válida
    // 6. No hay errores de validación del backend
    return basicValid && personSelected && resourceSelected && resourceCanBeLoaned && quantityValid && noValidationErrors;
  }, [watchedValues, creating, validating, selectedPerson, selectedResource, maxQuantityForPerson, validationState.errors.length]);

  // ===== RENDER =====

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh" h="auto">
        <ModalHeader>
          <HStack>
            <FiBook />
            <Text>Crear Nuevo Préstamo</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(handleSubmit_Internal)}>
          <ModalBody maxH="calc(90vh - 140px)" overflowY="auto">
            <VStack spacing={4} align="stretch">
              {/* Estado de Validación Global */}
              {validationState.errors.length > 0 && (
                <Alert status="error" size="sm">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold" mb={1} fontSize="sm">Errores de validación:</Text>
                    {validationState.errors.map((error, index) => (
                      <Text key={index} fontSize="xs">• {error}</Text>
                    ))}
                  </Box>
                </Alert>
              )}

              {validationState.warnings.length > 0 && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold" mb={1} fontSize="sm">Advertencias:</Text>
                    {validationState.warnings.map((warning, index) => (
                      <Text key={index} fontSize="xs">• {warning}</Text>
                    ))}
                  </Box>
                </Alert>
              )}

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                {/* COLUMNA IZQUIERDA - SELECCIÓN */}
                <GridItem>
                  <VStack spacing={4} align="stretch">
                    {/* Búsqueda de Persona */}
                    <FormControl isInvalid={!!errors.personId} isRequired>
                      <FormLabel fontSize="sm">
                        <HStack>
                          <FiUser size={16} />
                          <Text>Buscar Persona</Text>
                        </HStack>
                      </FormLabel>
                      
                      <Box position="relative" className="search-container">
                        <Input
                          size="sm"
                          placeholder="Buscar por nombre, documento o tipo de persona..."
                          value={searchPerson}
                          onChange={(e) => {
                            setSearchPerson(e.target.value);
                            setShowPersonResults(true);
                            if (!e.target.value.trim()) {
                              setSelectedPerson(null);
                              setValue('personId', '');
                              setShowPersonResults(false);
                            }
                          }}
                          onFocus={() => setShowPersonResults(true)}
                        />
                        
                        {showPersonResults && searchPerson.trim() && (
                          <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            boxShadow="lg"
                            zIndex={10}
                            maxH="150px"
                            overflowY="auto"
                          >
                            {loadingPeople ? (
                              <Box p={2} textAlign="center">
                                <Spinner size="sm" />
                                <Text fontSize="xs" ml={2}>Buscando...</Text>
                              </Box>
                            ) : people.length === 0 ? (
                              <Box p={2} textAlign="center">
                                <VStack spacing={2}>
                                  <Text fontSize="xs" color="gray.500">No se encontraron personas</Text>
                                  <Button
                                    size="xs"
                                    colorScheme="blue"
                                    variant="outline"
                                    leftIcon={<FiPlus size={12} />}
                                    onClick={() => {
                                      setShowPersonResults(false);
                                      setSearchPerson('');
                                      router.push('/people/new');
                                    }}
                                  >
                                    Registrar nueva persona
                                  </Button>
                                </VStack>
                              </Box>
                            ) : (
                              <List spacing={0}>
                                {people.map((person) => (
                                  <ListItem
                                    key={person._id}
                                    p={2}
                                    cursor="pointer"
                                    _hover={{ bg: "gray.50" }}
                                    onClick={() => handlePersonSelect(person)}
                                  >
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="medium" fontSize="sm">{person.fullName}</Text>
                                      {person.documentNumber && (
                                        <Text fontSize="xs" color="gray.600">
                                          Documento: {person.documentNumber}
                                        </Text>
                                      )}
                                      {person.personType && (
                                        <Badge size="sm" colorScheme={person.personType.name === 'student' ? 'blue' : 'purple'}>
                                          {person.personType.name === 'student' ? 'Estudiante' : 'Profesor'}
                                        </Badge>
                                      )}
                                    </VStack>
                                  </ListItem>
                                ))}
                                <ListItem
                                  p={2}
                                  cursor="pointer"
                                  _hover={{ bg: "gray.50" }}
                                  borderTop="1px solid"
                                  borderColor="gray.100"
                                  onClick={() => {
                                    setShowPersonResults(false);
                                    setSearchPerson('');
                                    router.push('/people/new');
                                  }}
                                >
                                  <HStack spacing={2} justify="center">
                                    <FiPlus size={14} />
                                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                      Registrar nueva persona
                                    </Text>
                                  </HStack>
                                </ListItem>
                              </List>
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      <FormErrorMessage fontSize="xs">{errors.personId?.message}</FormErrorMessage>
                    </FormControl>

                    {/* Búsqueda de Recurso */}
                    <FormControl isInvalid={!!errors.resourceId} isRequired>
                      <FormLabel fontSize="sm">
                        <HStack>
                          <FiBook size={16} />
                          <Text>Buscar Recurso</Text>
                        </HStack>
                      </FormLabel>
                      
                      <Box position="relative" className="search-container">
                        <Input
                          size="sm"
                          placeholder="Buscar por título, autor o ISBN..."
                          value={searchResource}
                          onChange={(e) => {
                            setSearchResource(e.target.value);
                            setShowResourceResults(true);
                            if (!e.target.value.trim()) {
                              setSelectedResource(null);
                              setValue('resourceId', '');
                              setShowResourceResults(false);
                            }
                          }}
                          onFocus={() => setShowResourceResults(true)}
                        />
                        
                        {showResourceResults && searchResource.trim() && (
                          <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            boxShadow="lg"
                            zIndex={10}
                            maxH="150px"
                            overflowY="auto"
                          >
                            {loadingResources ? (
                              <Box p={2} textAlign="center">
                                <Spinner size="sm" />
                                <Text fontSize="xs" ml={2}>Buscando...</Text>
                              </Box>
                            ) : filteredResources.length === 0 ? (
                              <Box p={2} textAlign="center">
                                <Text fontSize="xs" color="gray.500">No se encontraron recursos</Text>
                              </Box>
                            ) : (
                              <List spacing={0}>
                                {filteredResources.map((resource) => (
                                  <ListItem
                                    key={resource._id}
                                    p={2}
                                    cursor="pointer"
                                    _hover={{ bg: "gray.50" }}
                                    onClick={() => handleResourceSelect(resource)}
                                  >
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="medium" fontSize="sm">{resource.title}</Text>
                                      {resource.authors && resource.authors.length > 0 && (
                                        <Text fontSize="xs" color="gray.600">
                                          Autor: {resource.authors[0].name}
                                        </Text>
                                      )}
                                      <HStack spacing={2}>
                                        <Badge size="sm" colorScheme="green">
                                          Disponibles: {resource.availableQuantity || 0}
                                        </Badge>
                                        {resource.isbn && (
                                          <Badge size="sm" variant="outline">
                                            ISBN: {resource.isbn}
                                          </Badge>
                                        )}
                                      </HStack>
                                    </VStack>
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      <FormErrorMessage fontSize="xs">{errors.resourceId?.message}</FormErrorMessage>
                    </FormControl>

                    {/* Cantidad */}
                    <FormControl isInvalid={!!errors.quantity} isRequired>
                      <FormLabel fontSize="sm">Cantidad</FormLabel>
                      <Controller
                        name="quantity"
                        control={control}
                        render={({ field }) => (
                          <NumberInput
                            size="sm"
                            min={1}
                            max={maxQuantityForPerson}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(Number(value));
                              handleQuantityChange(Number(value));
                            }}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        )}
                      />
                      <FormErrorMessage fontSize="xs">{errors.quantity?.message}</FormErrorMessage>
                    </FormControl>

                    {/* Observaciones */}
                    <FormControl isInvalid={!!errors.observations}>
                      <FormLabel fontSize="sm">
                        <HStack>
                          <FiFileText size={16} />
                          <Text>Observaciones (Opcional)</Text>
                        </HStack>
                      </FormLabel>
                      <Textarea
                        size="sm"
                        {...register('observations')}
                        placeholder="Observaciones adicionales del préstamo..."
                        rows={2}
                      />
                      <FormErrorMessage fontSize="xs">{errors.observations?.message}</FormErrorMessage>
                    </FormControl>
                  </VStack>
                </GridItem>

                {/* COLUMNA DERECHA - INFORMACIÓN Y VALIDACIÓN */}
                <GridItem>
                  <VStack spacing={4} align="stretch">
                    {/* Información de la Persona Seleccionada */}
                    {selectedPerson && (
                      <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" fontSize="md">{selectedPerson.fullName}</Text>
                            {selectedPerson.personType && (
                              <Badge size="sm" colorScheme={selectedPerson.personType.name === 'student' ? 'blue' : 'purple'}>
                                {selectedPerson.personType.name === 'student' ? 'Estudiante' : 'Profesor'}
                              </Badge>
                            )}
                          </HStack>
                          
                          {selectedPerson.documentNumber && (
                            <Text fontSize="xs" color="gray.600">
                              Documento: {selectedPerson.documentNumber}
                            </Text>
                          )}
                          
                          {selectedPerson.grade && (
                            <Text fontSize="xs" color="gray.600">
                              Grado: {selectedPerson.grade}
                            </Text>
                          )}

                          <HStack spacing={4}>
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Préstamos máx.</StatLabel>
                              <StatNumber fontSize="sm">{selectedPerson.personType?.name === 'student' ? 1 : 'Sin límite'}</StatNumber>
                            </Stat>
                          </HStack>
                        </VStack>
                      </Box>
                    )}

                    {/* Información del Recurso Seleccionado */}
                    {selectedResource && (
                      <Box 
                        p={3} 
                        bg={(() => {
                          // Determinar color según estado del recurso
                          if (selectedResource.stateId && typeof selectedResource.stateId === 'object') {
                            const state = selectedResource.stateId as any;
                            if (state.name === 'damaged' || state.name === 'lost') {
                              return 'red.50';
                            } else if (state.name === 'maintenance') {
                              return 'orange.50';
                            }
                          }
                          return 'green.50';
                        })()}
                        borderRadius="md" 
                        borderLeft="4px solid" 
                        borderColor={(() => {
                          // Determinar color del borde según estado
                          if (selectedResource.stateId && typeof selectedResource.stateId === 'object') {
                            const state = selectedResource.stateId as any;
                            if (state.name === 'damaged' || state.name === 'lost') {
                              return 'red.500';
                            } else if (state.name === 'maintenance') {
                              return 'orange.500';
                            }
                          }
                          return 'green.500';
                        })()}
                      >
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" fontSize="md">{selectedResource.title}</Text>
                            {selectedResource.stateId && typeof selectedResource.stateId === 'object' && (
                              <Badge 
                                size="sm" 
                                colorScheme={(() => {
                                  const state = selectedResource.stateId as any;
                                  if (state.name === 'damaged' || state.name === 'lost') {
                                    return 'red';
                                  } else if (state.name === 'maintenance') {
                                    return 'orange';
                                  }
                                  return 'green';
                                })()}
                              >
                                {(() => {
                                  const state = selectedResource.stateId as any;
                                  return state.description || state.name;
                                })()}
                              </Badge>
                            )}
                          </HStack>
                          
                          {selectedResource.authors && selectedResource.authors.length > 0 && (
                            <Text fontSize="xs" color="gray.600">
                              Autor: {selectedResource.authors[0].name}
                            </Text>
                          )}
                          
                          {selectedResource.isbn && (
                            <Text fontSize="xs" color="gray.600">
                              ISBN: {selectedResource.isbn}
                            </Text>
                          )}

                          <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Disponibles</StatLabel>
                              <StatNumber fontSize="sm" color="green.500">{selectedResource.availableQuantity || 0}</StatNumber>
                            </Stat>
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Total</StatLabel>
                              <StatNumber fontSize="sm">{selectedResource.totalQuantity}</StatNumber>
                            </Stat>
                          </Grid>

                          <Progress 
                            value={((selectedResource.availableQuantity || 0) / selectedResource.totalQuantity) * 100} 
                            colorScheme="green" 
                            size="sm"
                          />
                          
                          {/* Advertencia si el recurso no se puede prestar */}
                          {selectedResource.stateId && typeof selectedResource.stateId === 'object' && (() => {
                            const state = selectedResource.stateId as any;
                            if (state.name === 'damaged' || state.name === 'lost' || state.name === 'maintenance') {
                              return (
                                <Alert status="warning" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="xs">
                                    Este recurso no se puede prestar debido a su estado: {state.description || state.name}
                                  </Text>
                                </Alert>
                              );
                            }
                            return null;
                          })()}
                        </VStack>
                      </Box>
                    )}

                    {/* Estado de Validación */}
                    {validating && (
                      <HStack justify="center" p={3}>
                        <Spinner size="sm" />
                        <Text fontSize="xs" color="gray.600">Validando préstamo...</Text>
                      </HStack>
                    )}

                    {!validating && validationState.overallValid && (
                      <Alert status="success" size="sm">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">✅ Préstamo válido</Text>
                          <Text fontSize="xs">El préstamo cumple con todas las validaciones y se puede procesar</Text>
                        </Box>
                      </Alert>
                    )}

                    {!validating && !validationState.overallValid && validationState.errors.length > 0 && (
                      <Alert status="error" size="sm">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">❌ Préstamo inválido</Text>
                          <VStack align="start" spacing={1} mt={2}>
                            {validationState.errors.map((error, index) => (
                              <Text key={index} fontSize="xs">• {error}</Text>
                            ))}
                          </VStack>
                        </Box>
                      </Alert>
                    )}

                    {!validating && validationState.warnings.length > 0 && (
                      <Alert status="warning" size="sm">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">⚠️ Advertencias</Text>
                          <VStack align="start" spacing={1} mt={2}>
                            {validationState.warnings.map((warning, index) => (
                              <Text key={index} fontSize="xs">• {warning}</Text>
                            ))}
                          </VStack>
                        </Box>
                      </Alert>
                    )}

                    {!validating && !validationState.overallValid && validationState.errors.length === 0 && (
                      <Alert status="info" size="sm">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">ℹ️ Información</Text>
                          <Text fontSize="xs">Complete todos los campos para validar el préstamo</Text>
                        </Box>
                      </Alert>
                    )}

                    {/* Información de Fechas */}
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" fontSize="xs">Información del Préstamo</Text>
                        <HStack spacing={4}>
                          <Stat size="sm">
                            <StatLabel fontSize="xs">Fecha de préstamo</StatLabel>
                            <StatNumber fontSize="xs">{new Date().toLocaleDateString()}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel fontSize="xs">Fecha de vencimiento</StatLabel>
                            <StatNumber fontSize="xs">
                              {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </StatNumber>
                          </Stat>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
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
                isDisabled={!canSubmit}
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