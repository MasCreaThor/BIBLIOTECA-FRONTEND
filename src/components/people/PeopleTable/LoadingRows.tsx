// src/components/people/PeopleTable/LoadingRows.tsx
'use client';

import {
  Tr,
  Td,
  HStack,
  VStack,
  Skeleton,
} from '@chakra-ui/react';

interface LoadingRowsProps {
  count?: number;
  isCompact?: boolean;
}

/**
 * Subcomponente para mostrar filas de carga en la tabla
 * Responsabilidad única: Estados de carga de la tabla
 */
export function LoadingRows({ count = 5, isCompact = false }: LoadingRowsProps) {
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
            <VStack spacing={1} align="start">
              <Skeleton height="16px" width="60px" />
              <Skeleton height="12px" width="40px" />
            </VStack>
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