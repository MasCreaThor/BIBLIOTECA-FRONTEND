// components/loans/LoanHistory/LoanHistory.tsx
'use client';

import {
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiRefreshCw, FiCalendar, FiUser, FiBook } from 'react-icons/fi';
import { Loan } from '@/types';
import { LoanService } from '@/services/loan.service';
import { DateUtils } from '@/utils';

interface LoanHistoryProps {
  personId?: string;
  resourceId?: string;
  limit?: number;
  title?: string;
}

export function LoanHistory({ 
  personId, 
  resourceId, 
  limit = 10, 
  title = "Historial de Préstamos" 
}: LoanHistoryProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const fetchHistory = async () => {
    if (!personId && !resourceId) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (personId) {
        response = await LoanService.getPersonLoans(personId, { limit });
      } else if (resourceId) {
        response = await LoanService.getResourceLoans(resourceId, { limit });
      }

      if (response) {
        setLoans(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [personId, resourceId, limit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'returned': return 'green';
      case 'overdue': return 'orange';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <Text>{error}</Text>
        </Box>
        <Button size="sm" leftIcon={<FiRefreshCw />} onClick={fetchHistory}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center">
        <Text fontWeight="bold">{title}</Text>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<FiRefreshCw />}
          onClick={fetchHistory}
          isLoading={loading}
        >
          Actualizar
        </Button>
      </HStack>

      {loading ? (
        <VStack spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="80px" borderRadius="md" />
          ))}
        </VStack>
      ) : loans.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color={textColor}>No hay historial de préstamos</Text>
        </Box>
      ) : (
        <VStack spacing={0} align="stretch">
          {loans.map((loan, index) => (
            <Box key={loan._id}>
              <HStack spacing={4} p={4} align="start">
                <Avatar
                  size="sm"
                  name={personId ? loan.resource?.title : loan.person?.fullName}
                />
                
                <VStack spacing={1} align="start" flex={1}>
                  <HStack spacing={2} align="center">
                    {personId ? (
                      <HStack spacing={2}>
                        <FiBook size={14} />
                        <Text fontWeight="medium" fontSize="sm">
                          {loan.resource?.title}
                        </Text>
                      </HStack>
                    ) : (
                      <HStack spacing={2}>
                        <FiUser size={14} />
                        <Text fontWeight="medium" fontSize="sm">
                          {loan.person?.fullName}
                        </Text>
                      </HStack>
                    )}
                    
                    <Badge
                      colorScheme={getStatusColor(loan.status?.name || 'active')}
                      fontSize="xs"
                    >
                      {loan.status?.description}
                    </Badge>
                  </HStack>

                  <HStack spacing={4} fontSize="xs" color={textColor}>
                    <HStack spacing={1}>
                      <FiCalendar size={12} />
                      <Text>Prestado: {DateUtils.formatDate(loan.loanDate)}</Text>
                    </HStack>
                    
                    {loan.returnedDate ? (
                      <HStack spacing={1}>
                        <Text>Devuelto: {DateUtils.formatDate(loan.returnedDate)}</Text>
                      </HStack>
                    ) : (
                      <HStack spacing={1}>
                        <Text>Vence: {DateUtils.formatDate(loan.dueDate)}</Text>
                        {loan.isOverdue && (
                          <Badge colorScheme="orange" fontSize="xs">
                            {loan.daysOverdue} días
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </HStack>

                  {loan.observations && (
                    <Text fontSize="xs" color={textColor} noOfLines={2}>
                      {loan.observations}
                    </Text>
                  )}
                </VStack>
              </HStack>
              
              {index < loans.length - 1 && <Divider />}
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}