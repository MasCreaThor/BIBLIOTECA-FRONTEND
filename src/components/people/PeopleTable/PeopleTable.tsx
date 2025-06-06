// src/components/people/PeopleTable/PeopleTable.tsx
'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import { PersonTableRow } from './PersonTableRow';
import { LoadingRows } from './LoadingRows';
import { EmptyPeople } from '@/components/ui/EmptyState';
import type { Person } from '@/types/api.types';

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

/**
 * Componente principal de tabla de personas
 * 
 * Responsabilidades:
 * - Estructura de la tabla
 * - Coordinación de subcomponentes
 * - Estados vacíos y de carga
 * 
 * Lógica delegada a:
 * - PersonTableRow (renderizado de filas)
 * - LoadingRows (estados de carga)
 * - PersonActions (acciones de fila)
 */
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