// src/components/resources/ResourceForm.tsx - FORMULARIO MEJORADO CON CANTIDADES
// ================================================================
// COMPONENTE DE FORMULARIO PARA CREAR/EDITAR RECURSOS CON STOCK
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
  FormHelperText,
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
  Badge,
  Divider,
  Switch,
  Tooltip,
  useToast
} from '@chakra-ui/react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Importar hooks y tipos
import { 
  useCreateResource, 
  useUpdateResource,
  useResourceStockManagement 
} from '@/hooks/useResources';
import { useCategories } from '@/hooks/useCategories';
import { useLocations } from '@/hooks/useLocations';
import { useAuthors } from '@/hooks/useAuthors';
import { usePublishers } from '@/hooks/usePublishers';
import { useResourceTypes } from '@/hooks/useResourceTypes';
import { useResourceStates } from '@/hooks/useResourceStates';
import type { 
  Resource, 
  CreateResourceRequest, 
  UpdateResourceRequest 
} from '@/types/api.types';
import type { Author } from '@/types/resource.types';
import { AuthorsSection } from './AuthorsSection';

// Íconos
import { 
  FiSave, 
  FiX, 
  FiBook, 
  FiPackage, 
  FiAlertCircle,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';

// ===== ESQUEMAS DE VALIDACIÓN =====
const createResourceSchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  typeId: z.string()
    .min(1, 'Debe seleccionar un tipo de recurso'),
  
  categoryId: z.string()
    .min(1, 'Debe seleccionar una categoría'),
  
  locationId: z.string()
    .min(1, 'Debe seleccionar una ubicación'),
  
  stateId: z.string()
    .min(1, 'Debe seleccionar un estado'),
  
  // ✅ CANTIDAD TOTAL OBLIGATORIA EN CREACIÓN
  totalQuantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(10000, 'La cantidad no puede exceder 10,000 unidades'),
  
  // ✅ CAMPOS OPCIONALES
  authorIds: z.union([z.array(z.string()), z.undefined()]).optional(),
  publisherId: z.union([z.string(), z.undefined()]).optional(),
  volumes: z.number().int().min(1).optional(),
  isbn: z.string().optional(),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
});

const editResourceSchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  categoryId: z.string()
    .min(1, 'Debe seleccionar una categoría'),
  
  locationId: z.string()
    .min(1, 'Debe seleccionar una ubicación'),
  
  stateId: z.string()
    .min(1, 'Debe seleccionar un estado'),
  
  // ✅ CAMPOS OPCIONALES EN EDICIÓN
  authorIds: z.union([z.array(z.string()), z.undefined()]).optional(),
  publisherId: z.union([z.string(), z.undefined()]).optional(),
  volumes: z.number().int().min(1).optional(),
  isbn: z.string().optional(),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
  available: z.boolean().optional(),
});

type CreateResourceFormData = z.infer<typeof createResourceSchema>;
type EditResourceFormData = z.infer<typeof editResourceSchema>;
type ResourceFormData = CreateResourceFormData | EditResourceFormData;

// ===== INTERFACES =====
interface ResourceFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  resource?: Resource;
  mode?: 'create' | 'edit';
  onSuccess?: (resource: Resource) => void;
  
  // ✅ PROPS ADICIONALES PARA COMPATIBILIDAD CON CÓDIGO EXISTENTE
  onSubmit?: (data: UpdateResourceRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

// ===== COMPONENTE PRINCIPAL =====
export const ResourceForm: React.FC<ResourceFormProps> = ({
  isOpen = true,
  onClose,
  resource,
  mode = 'create',
  onSuccess,
  // Props adicionales para compatibilidad
  onSubmit,
  onCancel,
  isLoading: externalIsLoading = false,
  isEdit = false,
  isSubmitting: externalIsSubmitting = false,
}) => {
  const toast = useToast();
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  
  // ✅ NUEVO: Estado para autores seleccionados
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  
  // Determinar el modo basado en props
  const actualMode = isEdit ? 'edit' : mode;
  const isModal = isOpen !== undefined && onClose !== undefined;

  // ✅ DEBUG: Log de props recibidas
  console.log('🔍 ResourceForm - Props received:', {
    isEdit,
    mode,
    actualMode,
    hasResource: !!resource,
    resourceId: resource?._id,
    resourceTitle: resource?.title,
    isModal
  });

  // ✅ NUEVO: Log detallado del recurso recibido
  console.log('🔍 ResourceForm - Resource details:', {
    resource: resource ? {
      _id: resource._id,
      title: resource.title,
      categoryId: resource.categoryId,
      locationId: resource.locationId,
      stateId: resource.stateId,
      publisherId: resource.publisherId,
      volumes: resource.volumes,
      authorIds: resource.authorIds,
      authors: resource.authors,
      category: resource.category,
      location: resource.location,
      state: resource.state,
      publisher: resource.publisher,
    } : null
  });

  // Estado de carga combinado
  const isLoading = externalIsLoading || internalIsSubmitting || externalIsSubmitting;

  // Hooks para obtener datos auxiliares
  const { data: categories } = useCategories({ active: true });
  const { data: locations } = useLocations({ active: true });
  const { data: authors } = useAuthors({ active: true });
  const { data: publishers } = usePublishers({ active: true });
  const { data: resourceTypes } = useResourceTypes({ active: true });
  const { data: resourceStates } = useResourceStates({ active: true });

  // ✅ DEBUG: Log para verificar datos auxiliares
  console.log('🔍 ResourceForm - Auxiliary data loaded:', {
    categoriesCount: categories?.length || 0,
    locationsCount: locations?.length || 0,
    authorsCount: authors?.length || 0,
    publishersCount: publishers?.length || 0,
    resourceTypesCount: resourceTypes?.data?.length || 0,
    resourceStatesCount: resourceStates?.data?.length || 0,
    allLoaded: !!(categories && locations && authors && publishers && resourceStates),
  });

  // Hooks para gestión de stock (solo en modo edición)
  const stockManagement = actualMode === 'edit' && resource?._id 
    ? useResourceStockManagement(resource._id)
    : null;

  // Mutations (solo si no hay onSubmit externo)
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  // Form configuration
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(actualMode === 'create' ? createResourceSchema : editResourceSchema),
    defaultValues: actualMode === 'edit' ? {
      title: '',
      categoryId: '',
      locationId: '',
      stateId: '',
      authorIds: [],
      publisherId: undefined,
      volumes: 1,
      notes: '',
      available: true,
    } : {
      title: '',
      typeId: '',
      categoryId: '',
      locationId: '',
      stateId: '',
      totalQuantity: 1,
      authorIds: [],
      publisherId: undefined,
      volumes: 1,
      isbn: '',
      notes: '',
      available: true,
    },
  });

  // Watch total quantity para validaciones dinámicas (solo en creación)
  const totalQuantity = watch('totalQuantity' as any);
  const currentLoans = stockManagement?.availability?.currentLoans || 0;

  // ===== EFECTOS =====
  
  // ✅ MEJORADO: Cargar datos del recurso en modo edición
  useEffect(() => {
    console.log('🔍 ResourceForm - useEffect triggered:', {
      actualMode,
      hasResource: !!resource,
      resourceId: resource?._id,
      resourceTitle: resource?.title
    });

    // ✅ NUEVO: Esperar a que todos los datos auxiliares estén cargados
    const allDataLoaded = categories && locations && authors && publishers && resourceStates;

    if (actualMode === 'edit' && resource && allDataLoaded) {
      console.log('📝 ResourceForm - Resource data received:', {
        title: resource.title,
        categoryId: resource.categoryId,
        locationId: resource.locationId,
        stateId: resource.stateId,
        authorIds: resource.authorIds,
        publisherId: resource.publisherId,
        volumes: resource.volumes,
        notes: resource.notes,
        available: resource.available,
        // Verificar campos populados
        hasCategory: !!resource.category,
        hasLocation: !!resource.location,
        hasState: !!resource.state,
        hasAuthors: !!resource.authors,
        hasPublisher: !!resource.publisher,
      });

      const formData = {
        title: resource.title || '',
        categoryId: resource.categoryId || '',
        locationId: resource.locationId || '',
        stateId: resource.stateId || '',
        authorIds: Array.isArray(resource.authorIds) ? resource.authorIds : [],
        publisherId: resource.publisherId || undefined,
        volumes: resource.volumes || 1,
        notes: resource.notes || '',
        available: resource.available ?? true,
      };

      console.log('📝 ResourceForm - Setting form data:', formData);
      console.log('📝 ResourceForm - Original resource data:', {
        title: resource.title,
        categoryId: resource.categoryId,
        locationId: resource.locationId,
        stateId: resource.stateId,
        authorIds: resource.authorIds,
        publisherId: resource.publisherId,
        volumes: resource.volumes,
        notes: resource.notes,
        available: resource.available,
      });
      
      // ✅ USAR setValue EN LUGAR DE reset PARA CAMPOS DE SELECCIÓN
      Object.entries(formData).forEach(([key, value]) => {
        console.log(`🔧 Setting ${key} to:`, value);
        // ✅ CORRECCIÓN: Manejar tipos correctamente
        setValue(key as keyof ResourceFormData, value as any);
      });

      // ✅ NUEVO: Verificar que los valores se establecieron correctamente
      setTimeout(() => {
        const currentValues = getValues();
        console.log('✅ ResourceForm - Values after setValue:', {
          categoryId: currentValues.categoryId,
          locationId: currentValues.locationId,
          stateId: currentValues.stateId,
          publisherId: currentValues.publisherId,
          volumes: currentValues.volumes,
        });
      }, 50);

      // ✅ NUEVO: Cargar autores seleccionados
      if (resource.authors && Array.isArray(resource.authors)) {
        setSelectedAuthors(resource.authors);
      } else if (resource.authorIds && Array.isArray(resource.authorIds)) {
        // Si no hay autores populados pero sí IDs, buscar los autores
        const authorsFromIds = authors?.filter(author => 
          resource.authorIds.includes(author._id)
        ) || [];
        setSelectedAuthors(authorsFromIds);
      }
    }
  }, [actualMode, resource, setValue, categories, locations, authors, publishers, resourceStates]);

  // ✅ VERIFICAR VALORES DEL FORMULARIO DESPUÉS DE ESTABLECERLOS
  useEffect(() => {
    if (actualMode === 'edit') {
      const subscription = watch((value, { name, type }) => {
        console.log('👀 Form values changed:', { name, type, value });
      });
      return () => subscription.unsubscribe();
    }
  }, [actualMode, watch]);

  // ✅ NUEVO: Verificar valores del formulario después de un delay
  useEffect(() => {
    if (actualMode === 'edit' && resource) {
      const timer = setTimeout(() => {
        const currentValues = getValues();
        console.log('🔍 ResourceForm - Current form values after setValue:', currentValues);
        console.log('🔍 ResourceForm - Expected values:', {
          title: resource.title,
          categoryId: resource.categoryId,
          locationId: resource.locationId,
          stateId: resource.stateId,
          authorIds: resource.authorIds,
          publisherId: resource.publisherId,
          volumes: resource.volumes,
          notes: resource.notes,
          available: resource.available,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [actualMode, resource, getValues]);

  // Limpiar formulario al cerrar (solo para modales)
  useEffect(() => {
    if (isModal && !isOpen) {
      reset();
    }
  }, [isModal, isOpen, reset]);

  // ===== HANDLERS =====

  const onSubmitForm = async (data: ResourceFormData) => {
    try {
      setInternalIsSubmitting(true);
      
      // ✅ DEBUG: Log para ver qué datos se están enviando
      console.log('📤 ResourceForm - Submitting data:', {
        mode: actualMode,
        data: data,
        totalQuantity: (data as any).totalQuantity,
        hasTotalQuantity: 'totalQuantity' in data,
        dataKeys: Object.keys(data),
      });
      
      // ✅ DEBUG: Verificar el valor actual del campo totalQuantity
      const currentTotalQuantity = getValues('totalQuantity' as any);
      console.log('🔍 ResourceForm - Current totalQuantity value:', currentTotalQuantity);
      console.log('🔍 ResourceForm - Form values before submit:', getValues());
      
      // ✅ NUEVO: Asegurar que totalQuantity sea un número válido en modo creación
      if (actualMode === 'create') {
        const totalQuantity = Number((data as any).totalQuantity);
        if (isNaN(totalQuantity) || totalQuantity < 1) {
          throw new Error('La cantidad total debe ser un número válido mayor a 0');
        }
        
        // Actualizar el dato con el valor numérico correcto
        (data as any).totalQuantity = totalQuantity;
        
        console.log('✅ ResourceForm - Validated totalQuantity:', totalQuantity);
      }
      
      if (onSubmit) {
        await onSubmit(data as any);
      } else if (actualMode === 'create') {
        const result = await createResource.mutateAsync(data as any);
        onSuccess?.(result);
      } else if (actualMode === 'edit' && resource?._id) {
        const result = await updateResource.mutateAsync({
          id: resource._id,
          data: data as any,
        });
        onSuccess?.(result);
      }

      if (isModal) {
        onClose?.();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!internalIsSubmitting && !externalIsLoading) {
      if (onCancel) {
        onCancel();
      } else if (onClose) {
        onClose();
      }
    }
  };

  // ===== VALIDACIONES DINÁMICAS =====
  
  const quantityValidation = {
    isValid: totalQuantity >= currentLoans,
    message: totalQuantity < currentLoans 
      ? `La cantidad no puede ser menor a los préstamos actuales (${currentLoans})`
      : undefined,
  };

  const availableQuantity = totalQuantity - currentLoans;
  
  // ===== CONTENIDO DEL FORMULARIO =====
  const formContent = (
    <form id="resource-form" onSubmit={handleSubmit(onSubmitForm)}>
      <VStack spacing={6} align="stretch">
        
        {/* Información básica */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Información Básica
          </Text>
          
          <VStack spacing={4}>
            {/* Título */}
            <FormControl isInvalid={!!errors.title} isRequired>
              <FormLabel>Título</FormLabel>
              <Input
                {...register('title')}
                placeholder="Ingrese el título del recurso"
                disabled={isLoading}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            {/* Tipo y Categoría */}
            <HStack spacing={4} w="full">
              {/* ✅ Tipo solo en modo creación */}
              {actualMode === 'create' && (
                <FormControl isInvalid={!!(errors as any).typeId} isRequired>
                  <FormLabel>Tipo de Recurso</FormLabel>
                  <Controller
                    name="typeId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Seleccionar tipo"
                        disabled={isLoading}
                      >
                        {resourceTypes?.data.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.description}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>{(errors as any).typeId?.message}</FormErrorMessage>
                </FormControl>
              )}

              <FormControl isInvalid={!!errors.categoryId} isRequired>
                <FormLabel>Categoría</FormLabel>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Seleccionar categoría"
                      disabled={isLoading}
                    >
                      {categories?.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                <FormErrorMessage>{errors.categoryId?.message}</FormErrorMessage>
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        <Divider />

        {/* ✅ GESTIÓN DE CANTIDAD Y STOCK - SOLO EN CREACIÓN */}
        {actualMode === 'create' && (
          <Box>
            <HStack spacing={3} mb={4}>
              <FiPackage />
              <Text fontSize="lg" fontWeight="semibold">
                Gestión de Cantidad
              </Text>
            </HStack>

            <VStack spacing={4}>
              {/* Cantidad Total */}
              <FormControl isInvalid={!!(errors as any).totalQuantity} isRequired>
                <FormLabel>
                  <HStack spacing={2}>
                    <Text>Cantidad Total</Text>
                    <Tooltip label="Número total de unidades disponibles">
                      <Box>
                        <FiInfo />
                      </Box>
                    </Tooltip>
                  </HStack>
                </FormLabel>
                <Controller
                  name="totalQuantity"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      onChange={(_, valueAsNumber) => field.onChange(isNaN(valueAsNumber) ? 1 : valueAsNumber)}
                      min={1}
                      max={10000}
                      isDisabled={isLoading}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>
                  {(errors as any).totalQuantity?.message}
                </FormErrorMessage>
              </FormControl>
            </VStack>
          </Box>
        )}

        {/* ✅ INFORMACIÓN DE STOCK - SOLO EN EDICIÓN */}
        {actualMode === 'edit' && stockManagement?.availability && (
          <Box>
            <HStack spacing={3} mb={4}>
              <FiPackage />
              <Text fontSize="lg" fontWeight="semibold">
                Estado del Stock
              </Text>
            </HStack>

            <Alert status={availableQuantity > 0 ? 'success' : 'warning'} borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="semibold">Información de Cantidad</Text>
                <HStack spacing={4} fontSize="sm">
                  <Badge colorScheme="blue">
                    Total: {stockManagement.availability.totalQuantity}
                  </Badge>
                  <Badge colorScheme="orange">
                    Prestados: {stockManagement.availability.currentLoans}
                  </Badge>
                  <Badge colorScheme={availableQuantity > 0 ? 'green' : 'red'}>
                    Disponibles: {availableQuantity}
                  </Badge>
                </HStack>
              </VStack>
            </Alert>
          </Box>
        )}

        <Divider />

        {/* Ubicación y Estado */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Ubicación y Estado
          </Text>
          
          <HStack spacing={4}>
            <FormControl isInvalid={!!errors.locationId} isRequired>
              <FormLabel>Ubicación</FormLabel>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Seleccionar ubicación"
                    disabled={isLoading}
                  >
                    {locations?.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.locationId?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.stateId} isRequired>
              <FormLabel>Estado</FormLabel>
              <Controller
                name="stateId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Seleccionar estado"
                    disabled={isLoading}
                  >
                    {Array.isArray(resourceStates?.data) && resourceStates.data.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.description}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.stateId?.message}</FormErrorMessage>
            </FormControl>
          </HStack>
        </Box>

        <Divider />

        {/* Información adicional */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Información Adicional
          </Text>
          
          <VStack spacing={4}>
            {/* Autores y Editorial */}
            <HStack spacing={4} w="full">
              <FormControl>
                <FormLabel>Editorial</FormLabel>
                <Controller
                  name="publisherId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Seleccionar editorial (opcional)"
                      disabled={isLoading}
                    >
                      {publishers?.map((publisher) => (
                        <option key={publisher._id} value={publisher._id}>
                          {publisher.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Volúmenes</FormLabel>
                <Controller
                  name="volumes"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      onChange={(_, valueAsNumber) => field.onChange(isNaN(valueAsNumber) ? 1 : valueAsNumber)}
                      min={1}
                      max={999}
                      isDisabled={isLoading}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
              </FormControl>
            </HStack>

            {/* ✅ NUEVO: Sección de Autores */}
            <AuthorsSection
              authors={selectedAuthors}
              onAuthorsChange={(authors) => {
                setSelectedAuthors(authors);
                // Actualizar el campo authorIds del formulario
                setValue('authorIds', authors.map(author => author._id));
              }}
              disabled={isLoading}
            />

            {/* ISBN - SOLO EN CREACIÓN */}
            {actualMode === 'create' && (
              <FormControl isInvalid={!!errors.isbn}>
                <FormLabel>ISBN</FormLabel>
                <Input
                  {...register('isbn')}
                  placeholder="ISBN (opcional)"
                  disabled={isLoading}
                />
                <FormErrorMessage>{errors.isbn?.message}</FormErrorMessage>
              </FormControl>
            )}

            {/* Notas */}
            <FormControl isInvalid={!!errors.notes}>
              <FormLabel>Notas</FormLabel>
              <Textarea
                {...register('notes')}
                placeholder="Notas adicionales (opcional)"
                rows={3}
                resize="vertical"
                disabled={isLoading}
              />
              <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
            </FormControl>

            {/* Disponibilidad */}
            <FormControl>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <FormLabel mb={0}>Disponible para préstamo</FormLabel>
                  <Text fontSize="sm" color="gray.600">
                    Controla si el recurso puede ser prestado
                  </Text>
                </VStack>
                <Controller
                  name="available"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      isChecked={field.value}
                      onChange={field.onChange}
                      colorScheme="green"
                      size="lg"
                      isDisabled={isLoading}
                    />
                  )}
                />
              </HStack>
            </FormControl>
          </VStack>
        </Box>

        {/* Botones para formulario inline */}
        {!isModal && (
          <HStack spacing={3} justify="flex-end" pt={4}>
            <Button
              variant="ghost"
              onClick={handleClose}
              isDisabled={isLoading}
              leftIcon={<FiX />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="resource-form"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText={actualMode === 'create' ? 'Creando...' : 'Actualizando...'}
              isDisabled={!isValid || (actualMode === 'create' && !quantityValidation.isValid)}
              leftIcon={<FiSave />}
            >
              {actualMode === 'create' ? 'Crear Recurso' : 'Actualizar Recurso'}
            </Button>
          </HStack>
        )}
      </VStack>
    </form>
  );

  // ===== RENDER =====

  // Si es modal, envolver en Modal
  if (isModal) {
    return (
      <Modal isOpen={isOpen || false} onClose={handleClose} size="xl" closeOnOverlayClick={!isLoading}>
        <ModalOverlay />
        <ModalContent maxW="4xl">
          <ModalHeader>
            <HStack spacing={3}>
              <FiBook />
              <Text>
                {actualMode === 'create' ? 'Crear Nuevo Recurso' : 'Editar Recurso'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isLoading} />

          <ModalBody>
            {formContent}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={handleClose}
                isDisabled={isLoading}
                leftIcon={<FiX />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="resource-form"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText={actualMode === 'create' ? 'Creando...' : 'Actualizando...'}
                isDisabled={!isValid || (actualMode === 'create' && !quantityValidation.isValid)}
                leftIcon={<FiSave />}
              >
                {actualMode === 'create' ? 'Crear Recurso' : 'Actualizar Recurso'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  // Si no es modal, retornar solo el contenido del formulario
  return (
    <Box>
      {formContent}
    </Box>
  );
};