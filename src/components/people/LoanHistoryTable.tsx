import React from 'react';
import {
  Box,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  useColorModeValue,
  Spinner,
  Flex,
  HStack,
  Button,
} from '@chakra-ui/react';
import { useLoans } from '@/hooks/useLoans';
import LoanRow from '@/components/loans/LoanRow';
import type { LoanWithDetails } from '@/types/loan.types';

interface LoanHistoryTableProps {
  personId: string;
}

export const LoanHistoryTable: React.FC<LoanHistoryTableProps> = ({ personId }) => {
  const {
    loans,
    loading,
    error,
    pagination,
    changePage,
    refetch,
  } = useLoans({ personId, limit: 5 });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (loading) {
    return (
      <Flex justify="center" p={6}>
        <Spinner size="lg" color="blue.500" thickness="3px" />
        <Text ml={4}>Cargando historial de préstamos...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
        <Text color="red.500">Error al cargar el historial de préstamos: {error}</Text>
        <Button mt={2} onClick={refetch} colorScheme="red" size="sm">Reintentar</Button>
      </Box>
    );
  }

  if (!loans || loans.length === 0) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
        <Text color="gray.500">Esta persona no tiene préstamos registrados.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box overflowX="auto">
        <Table size="sm" variant="simple" sx={{ tableLayout: 'fixed', minWidth: 800 }}>
          <Thead>
            <Tr>
              <Th w="240px">Recurso</Th>
              <Th w="140px">Fecha Préstamo</Th>
              <Th w="140px">Fecha Vencimiento</Th>
              <Th w="120px">Estado</Th>
              <Th w="100px">Cantidad</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loans.map((loan: LoanWithDetails) => (
              <LoanRow
                key={loan._id}
                loan={loan}
                onUpdate={refetch}
                hidePerson
                hideActions
              />
            ))}
          </Tbody>
        </Table>
      </Box>
      {pagination && pagination.totalPages > 1 && (
        <HStack justify="center" spacing={2}>
          <Button
            size="xs"
            onClick={() => changePage(pagination.page - 1)}
            isDisabled={!pagination.hasPrev}
          >
            Anterior
          </Button>
          <Text fontSize="xs">Página {pagination.page} de {pagination.totalPages}</Text>
          <Button
            size="xs"
            onClick={() => changePage(pagination.page + 1)}
            isDisabled={!pagination.hasNext}
          >
            Siguiente
          </Button>
        </HStack>
      )}
    </VStack>
  );
}; 