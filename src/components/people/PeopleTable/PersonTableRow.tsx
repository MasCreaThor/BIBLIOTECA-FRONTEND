// src/components/people/PeopleTable/PersonTableRow.tsx
'use client';

import {
  Tr,
  Td,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { PersonTypeManager } from '@/lib/personType';
import { DateUtils, TextUtils } from '@/utils';
import { PersonActions } from './PersonActions';
import { DeleteConfirmDialog, DeactivateConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePersonTypes } from '@/hooks/usePeople';
import type { Person } from '@/types/api.types';

interface PersonTableRowProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onActivate?: (person: Person) => void;
  onDeactivate?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  showActions?: boolean;
  isCompact?: boolean;
}

/**
 * Subcomponente para renderizar una fila de persona en la tabla
 * Responsabilidad única: Presentación de datos de una persona individual
 */
export function PersonTableRow({
  person,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  showActions = true,
  isCompact = false,
}: PersonTableRowProps) {
  const [selectedAction, setSelectedAction] = useState<'delete' | 'deactivate' | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();
  
  // Obtener tipos de persona para fallback
  const { data: personTypes } = usePersonTypes();

  // ✅ USAR PersonTypeManager centralizado
  const typeConfig = PersonTypeManager.getConfig(person, personTypes);
  const fullName = PersonTypeManager.getFullName(person);
  const gradeInfo = PersonTypeManager.getGradeDisplayInfo(person, personTypes);

  const handleActionClick = (action: 'edit' | 'activate' | 'deactivate' | 'delete') => {
    switch (action) {
      case 'edit':
        onEdit?.(person);
        break;
      case 'activate':
        onActivate?.(person);
        break;
      case 'deactivate':
        setSelectedAction('deactivate');
        onDeactivateOpen();
        break;
      case 'delete':
        setSelectedAction('delete');
        onDeleteOpen();
        break;
    }
  };

  const handleConfirmDeactivate = () => {
    onDeactivate?.(person);
    onDeactivateClose();
    setSelectedAction(null);
  };

  const handleConfirmDelete = () => {
    onDelete?.(person);
    onDeleteClose();
    setSelectedAction(null);
  };

  // Función para renderizar el grado/área usando el manager
  const renderGradeArea = () => {
    if (gradeInfo.isValid && gradeInfo.text !== 'N/A') {
      return (
        <VStack spacing={0} align="start">
          <Text fontSize="sm" color="gray.700" fontWeight="medium">
            {gradeInfo.text}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {gradeInfo.label}
          </Text>
        </VStack>
      );
    }

    if (gradeInfo.text === 'N/A') {
      return (
        <VStack spacing={0} align="start">
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            N/A
          </Text>
          <Text fontSize="xs" color="gray.500">
            No aplica
          </Text>
        </VStack>
      );
    }

    // Para casos donde no está especificado
    return (
      <VStack spacing={0} align="start">
        <Text fontSize="sm" color="gray.400" fontStyle="italic">
          No especificado
        </Text>
        <Text fontSize="xs" color="gray.400">
          {gradeInfo.label}
        </Text>
      </VStack>
    );
  };

  return (
    <>
      <Tr
        _hover={{ bg: 'gray.50' }}
        opacity={person.active ? 1 : 0.6}
      >
        {/* Avatar y nombre */}
        <Td>
          <HStack spacing={3}>
            <Avatar
              size={isCompact ? 'sm' : 'md'}
              name={fullName}
              bg={`${typeConfig.color}.500`}
              color="white"
            />
            <VStack spacing={0} align="start">
              <Text fontWeight="medium" color="gray.800" fontSize={isCompact ? 'sm' : 'md'}>
                {fullName}
              </Text>
              {person.documentNumber && (
                <Text fontSize="xs" color="gray.500">
                  Doc: {TextUtils.formatDocument(person.documentNumber)}
                </Text>
              )}
            </VStack>
          </HStack>
        </Td>

        {/* Tipo de persona */}
        <Td>
          <HStack spacing={2}>
            <Badge
              colorScheme={typeConfig.color}
              variant="subtle"
              fontSize="xs"
            >
              <HStack spacing={1}>
                <typeConfig.icon size={12} />
                <Text>{typeConfig.label}</Text>
              </HStack>
            </Badge>
          </HStack>
        </Td>

        {/* Grado/Área */}
        <Td>
          {renderGradeArea()}
        </Td>

        {/* Estado */}
        <Td>
          <Badge
            colorScheme={person.active ? 'green' : 'red'}
            variant="subtle"
            fontSize="xs"
          >
            {person.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </Td>

        {/* Fecha de registro */}
        {!isCompact && (
          <Td>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" color="gray.700">
                {DateUtils.formatDate(person.createdAt)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {DateUtils.formatRelative(person.createdAt)}
              </Text>
            </VStack>
          </Td>
        )}

        {/* Acciones */}
        {showActions && (
          <Td>
            <PersonActions
              person={person}
              onActionClick={handleActionClick}
            />
          </Td>
        )}
      </Tr>

      {/* Diálogos de confirmación */}
      <DeactivateConfirmDialog
        isOpen={isDeactivateOpen}
        onClose={onDeactivateClose}
        onConfirm={handleConfirmDeactivate}
        itemName={fullName}
        itemType="persona"
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        itemName={fullName}
        itemType="persona"
      />
    </>
  );
}