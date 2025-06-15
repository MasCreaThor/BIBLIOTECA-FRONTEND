// app/loans/page.tsx
'use client';

import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  useDisclosure,
  Flex,
  Spacer,
  Badge,
  Text,
  Divider,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiTrendingUp, FiClock, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { LoanList, CreateLoanForm } from '@/components/loans';
import { Pagination } from '@/components/ui';
import { useLoans, useCreateLoan, useReturnLoan, useLoanStats } from '@/hooks/useLoans';
import { LoanSearchFilters } from '@/types/loan.types';

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'returned' | 'overdue' | 'lost' | undefined>(undefined);
  const [overdueFilter, setOverdueFilter] = useState('');
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  
  const { loans, loading, error, filters, updateFilters, changePage, refresh } = useLoans({
    limit: 12,
  });
  
  const { createLoan, loading: creating } = useCreateLoan();
  const { returnLoan, markAsLost, loading: processing } = useReturnLoan();
  const { stats, loading: loadingStats } = useLoanStats();

  const cardBg = useColorModeValue('white', 'gray.800');

  // Aplicar filtros con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters: LoanSearchFilters = {
        ...filters,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        isOverdue: overdueFilter === 'true' ? true : overdueFilter === 'false' ? false : undefined,
        page: 1,
      };
      updateFilters(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, overdueFilter]);

  const handleCreateLoan = async (loanData: any) => {
    const result = await createLoan(loanData);
    if (result) {
      onCreateClose();
      refresh();
    }
  };

  const handleReturnLoan = async (loanId: string, observations?: string) => {
    const result = await returnLoan({
      loanId,
      returnObservations: observations,
    });
    if (result) {
      refresh();
    }
  };

  const handleMarkAsLost = async (loanId: string, observations: string) => {
    const result = await markAsLost(loanId, observations);
    if (result) {
      refresh();
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Flex align="center">
              <VStack align="start" spacing={2}>
                <Heading size="lg">Gestión de Préstamos</Heading>
                <Text color="gray.600">
                  Administra los préstamos y devoluciones de recursos
                </Text>
              </VStack>
              <Spacer />
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={onCreateOpen}
                size="lg"
              >
                Nuevo Préstamo
              </Button>
            </Flex>

            {/* Estadísticas */}
            {stats && (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Préstamos</StatLabel>
                      <StatNumber color="blue.500">{stats.total}</StatNumber>
                      <StatHelpText>
                        <FiTrendingUp />
                        Histórico
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Activos</StatLabel>
                      <StatNumber color="green.500">{stats.active}</StatNumber>
                      <StatHelpText>
                        <FiCheck />
                        En curso
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Vencidos</StatLabel>
                      <StatNumber color="orange.500">{stats.overdue}</StatNumber>
                      <StatHelpText>
                        <FiAlertTriangle />
                        Requieren atención
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Devueltos</StatLabel>
                      <StatNumber color="gray.500">{stats.returned}</StatNumber>
                      <StatHelpText>
                        <FiClock />
                        Completados
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            )}

            {/* Filtros */}
            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={4}>
                  <HStack spacing={4} width="100%" align="end">
                    <Box flex={1}>
                      <InputGroup>
                        <InputLeftElement>
                          <FiSearch />
                        </InputLeftElement>
                        <Input
                          placeholder="Buscar por persona, recurso o documento..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Box>

                    <Select
                      placeholder="Todos los estados"
                      value={statusFilter ?? ''}
                      onChange={e => setStatusFilter(
                        e.target.value === '' ? undefined : e.target.value as 'active' | 'returned' | 'overdue' | 'lost'
                      )}
                      width="200px"
                    >
                      <option value="active">Activos</option>
                      <option value="returned">Devueltos</option>
                      <option value="overdue">Vencidos</option>
                      <option value="lost">Perdidos</option>
                    </Select>

                    <Select
                      placeholder="Vencimiento"
                      value={overdueFilter}
                      onChange={(e) => setOverdueFilter(e.target.value)}
                      width="150px"
                    >
                      <option value="false">Al día</option>
                      <option value="true">Vencidos</option>
                    </Select>

                    <Button
                      leftIcon={<FiFilter />}
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter(undefined);
                        setOverdueFilter('');
                        updateFilters({ search: undefined, status: undefined, isOverdue: undefined });
                      }}
                    >
                      Limpiar
                    </Button>
                  </HStack>

                  {/* Resumen de filtros */}
                  <HStack spacing={2} width="100%" justify="start">
                    <Text fontSize="sm" color="gray.600">
                      Mostrando {loans.data.length} de {loans.pagination.total} préstamos
                    </Text>
                    {statusFilter && (
                      <Badge colorScheme="blue" fontSize="xs">
                        Estado: {statusFilter}
                      </Badge>
                    )}
                    {overdueFilter && (
                      <Badge colorScheme="orange" fontSize="xs">
                        {overdueFilter === 'true' ? 'Vencidos' : 'Al día'}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Lista de préstamos */}
            <LoanList
              loans={loans.data}
              loading={loading}
              error={error}
              onReturn={handleReturnLoan}
              onMarkAsLost={handleMarkAsLost}
              onRetry={refresh}
            />

            {/* Paginación */}
            {loans.pagination.totalPages > 1 && (
              <Flex justify="center">
                <Pagination
                  currentPage={loans.pagination.page}
                  totalPages={loans.pagination.totalPages}
                  onPageChange={changePage}
                />
              </Flex>
            )}
          </VStack>
        </Container>

        {/* Modal de crear préstamo */}
        <CreateLoanForm
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          onSubmit={handleCreateLoan}
          isLoading={creating}
        />
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}