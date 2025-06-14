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
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <Text>{error}</Text>
        </Box>
        {onRetry && (
          <Button
            size="sm"
            leftIcon={<FiRefreshCw />}
            onClick={onRetry}
            ml={3}
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
      <Box textAlign="center" py={8}>
        <Text color="gray.500" fontSize="lg">
          No se encontraron préstamos
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