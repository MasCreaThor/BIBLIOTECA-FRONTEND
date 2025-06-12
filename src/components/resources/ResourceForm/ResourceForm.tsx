// src/components/resources/ResourceForm/ResourceForm.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Button,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiBook, FiCheck, FiX } from 'react-icons/fi';
import { BasicInfoSection } from './BasicInfoSection';
import { AuthorsSection } from './AuthorsSection';
import { PublisherSection } from './PublisherSection';
import { MetadataSection } from './MetadataSection';
import { useResourceTypes, useResourceStates, useCategories, useLocations } from '@/hooks/useResources';
import type { Resource, CreateResourceRequest, UpdateResourceRequest } from '@/types/resource.types';

// Schema de validación
const resourceSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(300, 'El título no puede exceder 300 caracteres'),
  typeId: z.string().min(1, 'Selecciona un tipo de recurso'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  locationId: z.string().min(1, 'Selecciona una ubicación'),
  stateId: z.string().min(1, 'Selecciona un estado'),
  authorIds: z.array(z.string()).optional(),
  publisherId: z.string().optional(),
  volumes: z.number().int().min(1, 'Debe haber al menos 1 volumen').max(100, 'No puede haber más de 100 volúmenes').optional(),
  isbn: z.string().optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

// Interfaces específicas para cada modo
interface ResourceFormCreateProps {
  resource?: never;
  onSubmit: (data: CreateResourceRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: false;
}

interface ResourceFormEditProps {
  resource: Resource;
  onSubmit: (data: UpdateResourceRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit: true;
}

// Tipo union para las props
type ResourceFormProps = ResourceFormCreateProps | ResourceFormEditProps;

export function ResourceForm(props: ResourceFormProps) {
  const { onSubmit, onCancel, isLoading = false } = props;
  const resource = 'resource' in props ? props.resource : undefined;
  const isEdit = 'isEdit' in props ? props.isEdit : false;
  
  const [businessRulesErrors, setBusinessRulesErrors] = useState<string[]>([]);

  // Queries para datos auxiliares
  const { data: resourceTypes, isLoading: isLoadingTypes } = useResourceTypes();
  const { data: resourceStates, isLoading: isLoadingStates } = useResourceStates();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: locations, isLoading: isLoadingLocations } = useLocations();

  // Configurar formulario
  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: resource?.title || '',
      typeId: resource?.typeId || '',
      categoryId: resource?.categoryId || '',
      locationId: resource?.locationId || '',
      stateId: resource?.stateId || '',
      authorIds: resource?.authorIds || [],
      publisherId: resource?.publisherId || '',
      volumes: resource?.volumes || 1,
      isbn: resource?.isbn || '',
      notes: resource?.notes || '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, formState: { isValid, isDirty } } = form;

  // Validaciones de reglas de negocio
  const validateBusinessRules = (data: ResourceFormData): string[] => {
    const errors: string[] = [];

    // Validar ISBN si se proporciona
    if (data.isbn && data.isbn.trim()) {
      const cleanISBN = data.isbn.replace(/[-\s]/g, '');
      if (!/^(?:\d{10}|\d{13})$/.test(cleanISBN)) {
        errors.push('El ISBN debe tener 10 o 13 dígitos');
      }
    }

    // Validar que los libros tengan al menos un autor
    if (data.typeId && resourceTypes) {
      const resourceType = resourceTypes.find(type => type._id === data.typeId);
      if (resourceType?.name === 'book' && (!data.authorIds || data.authorIds.length === 0)) {
        errors.push('Los libros deben tener al menos un autor');
      }
    }

    return errors;
  };

  const handleFormSubmit = handleSubmit(async (data: ResourceFormData) => {
    // Validar reglas de negocio
    const businessErrors = validateBusinessRules(data);
    if (businessErrors.length > 0) {
      setBusinessRulesErrors(businessErrors);
      return;
    }

    setBusinessRulesErrors([]);

    // Limpiar datos antes de enviar
    const cleanData = {
      title: data.title.trim(),
      typeId: data.typeId,
      categoryId: data.categoryId,
      locationId: data.locationId,
      stateId: data.stateId,
      authorIds: data.authorIds?.filter(id => id.trim()) || [],
      publisherId: data.publisherId?.trim() || undefined,
      volumes: data.volumes || 1,
      isbn: data.isbn?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };

    if (isEdit) {
      // Para edición, omitir campos que no se pueden cambiar y crear UpdateResourceRequest
      const updateData: UpdateResourceRequest = {
        title: cleanData.title,
        categoryId: cleanData.categoryId,
        authorIds: cleanData.authorIds,
        publisherId: cleanData.publisherId,
        volumes: cleanData.volumes,
        locationId: cleanData.locationId,
        stateId: cleanData.stateId,
        notes: cleanData.notes,
        // isbn no se incluye porque no se puede cambiar en edición
      };
      await (onSubmit as (data: UpdateResourceRequest) => Promise<void>)(updateData);
    } else {
      // Para creación, incluir todos los campos requeridos
      const createData: CreateResourceRequest = {
        title: cleanData.title,
        typeId: cleanData.typeId,
        categoryId: cleanData.categoryId,
        locationId: cleanData.locationId,
        stateId: cleanData.stateId,
        authorIds: cleanData.authorIds,
        publisherId: cleanData.publisherId,
        volumes: cleanData.volumes,
        isbn: cleanData.isbn,
        notes: cleanData.notes,
      };
      await (onSubmit as (data: CreateResourceRequest) => Promise<void>)(createData);
    }
  });

  const canSubmit = isValid && isDirty && businessRulesErrors.length === 0;
  const isLoadingData = isLoadingTypes || isLoadingStates || isLoadingCategories || isLoadingLocations;

  if (isLoadingData) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Icon as={FiBook} boxSize={8} color="gray.400" />
            <Text color="gray.600">Cargando formulario...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleFormSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={FiBook} color="blue.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {isEdit ? 'Editar Recurso' : 'Registrar Nuevo Recurso'}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {isEdit 
                  ? 'Modifica la información del recurso'
                  : 'Completa la información para registrar un nuevo recurso en el sistema'
                }
              </Text>
            </Box>

            <Divider />

            {/* Errores de reglas de negocio */}
            {businessRulesErrors.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Errores de validación</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={1} mt={2}>
                      {businessRulesErrors.map((error, index) => (
                        <Text key={index} fontSize="sm">• {error}</Text>
                      ))}
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Secciones del formulario */}
            <VStack spacing={6} align="stretch">
              <BasicInfoSection
                form={form}
                resourceTypes={resourceTypes || []}
                categories={categories || []}
                locations={locations || []}
                resourceStates={resourceStates || []}
              />

              <AuthorsSection form={form} />

              <PublisherSection form={form} />

              <MetadataSection form={form} />
            </VStack>

            <Divider />

            {/* Botones de acción */}
            <HStack spacing={3} justify="flex-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                leftIcon={<Icon as={FiX} />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText={isEdit ? 'Actualizando...' : 'Registrando...'}
                disabled={!canSubmit}
                leftIcon={<Icon as={FiCheck} />}
              >
                {isEdit ? 'Actualizar Recurso' : 'Registrar Recurso'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}