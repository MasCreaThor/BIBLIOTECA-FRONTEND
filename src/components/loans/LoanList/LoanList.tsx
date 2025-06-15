// components/loans/LoanList/LoanList.tsx
'use client';

import {
  VStack,
  SimpleGrid,
  Text,
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  Button,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { LoanCard } from '../LoanCard/LoanCard';
import { Loan } from '@/types';
import { FiRefreshCw } from 'react-icons/fi';

interface LoanListProps {
  loans: Loan[];
  loading?: boolean;
  error?: string | null;
  onReturn?: (loanId: string, observations?: string) => void;
  onMarkAsLost?: (loanId: string, observations: string) => void;
  onRetry?: () => void;
  compact?: boolean;
  showActions?: boolean;
  columns?: number;
}

export function LoanList({
  loans,
  loading = false,
  error = null,
  onReturn,
  onMarkAsLost,
  onRetry,
  compact = false,
  showActions = true,
  columns = 3,
}: LoanListProps) {
  if (error) {
    return (
      <Alert 
        status="error" 
        borderRadius="md"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        p={6}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error al cargar préstamos
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
        {onRetry && (
          <Button
            mt={4}
            size="md"
            leftIcon={<FiRefreshCw />}
            onClick={onRetry}
            colorScheme="red"
            variant="outline"
          >
            Reintentar
          </Button>
        )}
      </Alert>
    );
  }

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: columns }} spacing={4}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height="300px" borderRadius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (loans.length === 0) {
    return (
      <Box 
        textAlign="center" 
        py={8}
        bg="gray.50"
        borderRadius="md"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <Text color="gray.500" fontSize="lg">
          No se encontraron préstamos
        </Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Intenta ajustar los filtros de búsqueda
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: columns }} spacing={4}>
      {loans.map((loan) => (
        <LoanCard
          key={loan._id}
          loan={loan}
          onReturn={onReturn}
          onMarkAsLost={onMarkAsLost}
          compact={compact}
          showActions={showActions}
        />
      ))}
    </SimpleGrid>
  );
}