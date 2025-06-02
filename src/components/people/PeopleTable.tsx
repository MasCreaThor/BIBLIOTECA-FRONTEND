// src/components/people/PeopleTable.tsx
'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  useDisclosure,
  Skeleton,
  Avatar,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiUser,
  FiBook,
  FiUsers,
} from 'react-icons/fi';
import Link from 'next/link';
import type { Person } from '@/types/api.types';
import { DateUtils, TextUtils } from '@/utils';
import { EmptyPeople } from '@/components/ui/EmptyState';
import { DeleteConfirmDialog, DeactivateConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SafeLink } from '@/components/ui/SafeLink';

interface PeopleTableProps {
  people: Person[];
  isLoading?: boolean;
  onEdit?: (person: Person) => void;
  onActivate?: (person: Person) => void;
  onDeactivate?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  onCreate?: () => void;
  showActions?: boolean;
  isCompact?: boolean;
}

interface TableRowProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onActivate?: (person: Person) => void;
  onDeactivate?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  showActions?: boolean;
  isCompact?: boolean;
}

function PersonTableRow({
  person,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  showActions = true,
  isCompact = false,
}: TableRowProps) {
  const [selectedAction, setSelectedAction] = useState<'delete' | 'deactivate' | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();

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

  // Determinar tipo y color
  const personTypeConfig = {
    student: {
      label: 'Estudiante',
      color: 'blue',
      icon: FiBook,
    },
    teacher: {
      label: 'Docente',
      color: 'green',
      icon: FiUsers,
    },
  };

  const typeConfig = personTypeConfig[person.personType?.name as keyof typeof personTypeConfig] || {
    label: person.personType?.description || 'Desconocido',
    color: 'gray',
    icon: FiUser,
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
              name={person.fullName}
              bg={`${typeConfig.color}.500`}
              color="white"
            />
            <VStack spacing={0} align="start">
              <Text fontWeight="medium" color="gray.800" fontSize={isCompact ? 'sm' : 'md'}>
                {person.fullName}
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
          {person.grade ? (
            <Text fontSize="sm" color="gray.700">
              {person.grade}
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.400" fontStyle="italic">
              No especificado
            </Text>
          )}
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
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Acciones"
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <SafeLink href={`/people/${person._id}`}>
                  <MenuItem icon={<FiEye />}>
                    Ver detalles
                  </MenuItem>
                </SafeLink>
                
                {onEdit && (
                  <MenuItem
                    icon={<FiEdit />}
                    onClick={() => handleActionClick('edit')}
                  >
                    Editar
                  </MenuItem>
                )}

                <MenuDivider />

                {person.active ? (
                  onDeactivate && (
                    <MenuItem
                      icon={<FiUserX />}
                      onClick={() => handleActionClick('deactivate')}
                      color="orange.600"
                    >
                      Desactivar
                    </MenuItem>
                  )
                ) : (
                  onActivate && (
                    <MenuItem
                      icon={<FiUserCheck />}
                      onClick={() => handleActionClick('activate')}
                      color="green.600"
                    >
                      Activar
                    </MenuItem>
                  )
                )}

                {onDelete && (
                  <>
                    <MenuDivider />
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => handleActionClick('delete')}
                      color="red.600"
                    >
                      Eliminar
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Td>
        )}
      </Tr>

      {/* Diálogos de confirmación */}
      <DeactivateConfirmDialog
        isOpen={isDeactivateOpen}
        onClose={onDeactivateClose}
        onConfirm={handleConfirmDeactivate}
        itemName={person.fullName}
        itemType="persona"
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        itemName={person.fullName}
        itemType="persona"
      />
    </>
  );
}

function LoadingRows({ count = 5, isCompact = false }: { count?: number; isCompact?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Tr key={index}>
          <Td>
            <HStack spacing={3}>
              <Skeleton borderRadius="full" boxSize={isCompact ? '32px' : '48px'} />
              <VStack spacing={1} align="start">
                <Skeleton height="16px" width="120px" />
                <Skeleton height="12px" width="80px" />
              </VStack>
            </HStack>
          </Td>
          <Td>
            <Skeleton height="24px" width="80px" borderRadius="12px" />
          </Td>
          <Td>
            <Skeleton height="16px" width="60px" />
          </Td>
          <Td>
            <Skeleton height="24px" width="60px" borderRadius="12px" />
          </Td>
          {!isCompact && (
            <Td>
              <VStack spacing={1} align="start">
                <Skeleton height="16px" width="80px" />
                <Skeleton height="12px" width="60px" />
              </VStack>
            </Td>
          )}
          <Td>
            <Skeleton height="32px" width="32px" borderRadius="md" />
          </Td>
        </Tr>
      ))}
    </>
  );
}

export function PeopleTable({
  people,
  isLoading = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onCreate,
  showActions = true,
  isCompact = false,
}: PeopleTableProps) {
  // Estado vacío
  if (!isLoading && people.length === 0) {
    return <EmptyPeople onCreate={onCreate} />;
  }

  return (
    <Box>
      <TableContainer>
        <Table variant="simple" size={isCompact ? 'sm' : 'md'}>
          <Thead>
            <Tr>
              <Th>Persona</Th>
              <Th>Tipo</Th>
              <Th>Grado/Área</Th>
              <Th>Estado</Th>
              {!isCompact && <Th>Registro</Th>}
              {showActions && <Th width="60px">Acciones</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && <LoadingRows isCompact={isCompact} />}
            
            {!isLoading &&
              people.map((person) => (
                <PersonTableRow
                  key={person._id}
                  person={person}
                  onEdit={onEdit}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onDelete={onDelete}
                  showActions={showActions}
                  isCompact={isCompact}
                />
              ))
            }
          </Tbody>
        </Table>
      </TableContainer>

      {/* Información adicional */}
      {!isLoading && people.length > 0 && (
        <Box pt={4}>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Mostrando {people.length} persona{people.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}