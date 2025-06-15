// src/components/resources/ResourceForm/PublisherSection.tsx
'use client';

import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FiHome, FiPlus } from 'react-icons/fi';
import { usePublishers, useFindOrCreatePublisher } from '@/hooks/useResources';
import { TextUtils } from '@/utils';
import { Publisher } from '@/types/resource.types';

interface PublisherSectionProps {
  form: UseFormReturn<any>;
}

export function PublisherSection({ form }: PublisherSectionProps) {
  const { register, watch, setValue } = form;
  const [newPublisherName, setNewPublisherName] = useState('');
  const [showNewPublisherInput, setShowNewPublisherInput] = useState(false);
  
  const selectedPublisherId = watch('publisherId');
  
  // Queries y mutations
  const { data: publishers = [], isLoading } = usePublishers();
  const findOrCreateMutation = useFindOrCreatePublisher();

  const handleCreatePublisher = async () => {
    if (!newPublisherName.trim()) return;

    try {
      const publisher = await findOrCreateMutation.mutateAsync(
        TextUtils.capitalize(newPublisherName.trim())
      ) as Publisher;
      
      // Seleccionar automáticamente la editorial creada/encontrada
      setValue('publisherId', publisher._id, { shouldDirty: true });
      setNewPublisherName('');
      setShowNewPublisherInput(false);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleCancelNewPublisher = () => {
    setNewPublisherName('');
    setShowNewPublisherInput(false);
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontWeight="medium" color="gray.700" fontSize="md">
          Editorial/Publisher
        </Text>
        {!showNewPublisherInput && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiHome />}
            onClick={() => setShowNewPublisherInput(true)}
          >
            Nueva Editorial
          </Button>
        )}
      </HStack>

      {/* Selector de editorial existente */}
      {!showNewPublisherInput && (
        <FormControl>
          <FormLabel>Editorial (Opcional)</FormLabel>
          <Select
            {...register('publisherId')}
            placeholder="Selecciona una editorial"
            isDisabled={isLoading}
          >
            {publishers.map((publisher) => (
              <option key={publisher._id} value={publisher._id}>
                {publisher.name}
              </option>
            ))}
          </Select>
          <FormHelperText>
            La editorial es opcional. Puedes dejar en blanco si no aplica o no conoces la editorial.
          </FormHelperText>
        </FormControl>
      )}

      {/* Formulario para nueva editorial */}
      {showNewPublisherInput && (
        <VStack spacing={3} align="stretch">
          <FormControl>
            <FormLabel>Nombre de la Nueva Editorial</FormLabel>
            <Input
              value={newPublisherName}
              onChange={(e) => setNewPublisherName(e.target.value)}
              placeholder="Ej: Planeta, Santillana, McGraw-Hill..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreatePublisher();
                }
              }}
            />
            <FormHelperText>
              Si la editorial ya existe, se seleccionará automáticamente
            </FormHelperText>
          </FormControl>

          <HStack spacing={2} justify="flex-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelNewPublisher}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              onClick={handleCreatePublisher}
              disabled={!newPublisherName.trim()}
              isLoading={findOrCreateMutation.isPending}
              loadingText="Creando..."
              leftIcon={<FiPlus />}
            >
              Crear Editorial
            </Button>
          </HStack>
        </VStack>
      )}

      {/* Información sobre la editorial seleccionada */}
      {selectedPublisherId && !showNewPublisherInput && (
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            Editorial seleccionada: {' '}
            <strong>
              {publishers.find(p => p._id === selectedPublisherId)?.name}
            </strong>
          </Text>
        </Alert>
      )}
    </VStack>
  );
}