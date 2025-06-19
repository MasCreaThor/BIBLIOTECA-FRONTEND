// src/components/people/PeopleTable/PersonActions.tsx
'use client';

import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiUserCheck,
  FiUserX,
  FiTrash2,
} from 'react-icons/fi';
import { SafeLink } from '@/components/ui/SafeLink';
import type { Person } from '@/types/api.types';

interface PersonActionsProps {
  person: Person;
  onActionClick: (action: 'edit' | 'activate' | 'deactivate' | 'delete') => void;
}

/**
 * Subcomponente para el menú de acciones de una persona
 * Responsabilidad única: Presentación y manejo de acciones disponibles
 */
export function PersonActions({ person, onActionClick }: PersonActionsProps) {
  return (
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
        
        <MenuDivider />

        {person.active ? (
          <MenuItem
            icon={<FiUserX />}
            onClick={() => onActionClick('deactivate')}
            color="orange.600"
          >
            Desactivar
          </MenuItem>
        ) : (
          <MenuItem
            icon={<FiUserCheck />}
            onClick={() => onActionClick('activate')}
            color="green.600"
          >
            Activar
          </MenuItem>
        )}

        <MenuDivider />
        <MenuItem
          icon={<FiTrash2 />}
          onClick={() => onActionClick('delete')}
          color="red.600"
        >
          Eliminar
        </MenuItem>
      </MenuList>
    </Menu>
  );
}