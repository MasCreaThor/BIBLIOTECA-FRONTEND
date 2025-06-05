// src/app/people/page.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Center,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUsers,
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiEdit,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PeopleTable } from '@/components/people/PeopleTable';
import { PeopleFilters, type PeopleFiltersState } from '@/components/people/PeopleFilters';
import { PersonForm } from '@/components/people/PersonForm';
import { 
  usePeople, 
  useCreatePerson, 
  useUpdatePerson, 
  useActivatePerson, 
  useDeactivatePerson,
  useDeletePerson,
  usePersonStats
} from '@/hooks/usePeople';
import type { Person, SearchFilters, CreatePersonRequest, UpdatePersonRequest } from '@/types/api.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SafeLink } from '@/components/ui/SafeLink';

const DEFAULT_FILTERS: PeopleFiltersState = {
  search: '',
  personType: '',
  status: '',
  grade: '',
  sortBy: 'firstName',
  sortOrder: 'asc',
};

const PAGE_SIZE = 20;

export default function PeoplePage() {
  const router = useRouter();
  
  // Estado local
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PeopleFiltersState>(DEFAULT_FILTERS);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  // Modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Preparar filtros para la API
  const apiFilters: SearchFilters = useMemo(() => {
    const result: SearchFilters = {
      page: currentPage,
      limit: PAGE_SIZE,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.search.trim()) result.search = filters.search.trim();
    if (filters.personType) result.personType = filters.personType as any;
    if (filters.status) result.status = filters.status;
    // El filtro de grade se maneja como búsqueda en el backend
    if (filters.grade.trim()) {
      result.search = result.search 
        ? `${result.search} ${filters.grade.trim()}` 
        : filters.grade.trim();
    }

    return result;
  }, [filters, currentPage]);

  // Queries y mutations
  const {
    data: peopleResponse,
    isLoading: isLoadingPeople,
    isError: isPeopleError,
    error: peopleError,
    refetch: refetchPeople,
    isRefetching,
  } = usePeople(apiFilters);

  const { data: stats, isLoading: isLoadingStats } = usePersonStats();

  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const activateMutation = useActivatePerson();
  const deactivateMutation = useDeactivatePerson();
  const deleteMutation = useDeletePerson();

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.personType, filters.status, filters.grade]);

  // Handlers
  const handleFiltersChange = (newFilters: PeopleFiltersState) => {
    setFilters(newFilters);
  };

  const handleCreatePerson = async (data: CreatePersonRequest) => {
    try {
      await createMutation.mutateAsync(data);
      onCreateClose();
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleEditPerson = async (data: UpdatePersonRequest) => {
    if (!editingPerson) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingPerson._id,
        data,
      });
      setEditingPerson(null);
      onEditClose();
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleStartEdit = (person: Person) => {
    setEditingPerson(person);
    onEditOpen();
  };

  const handleActivate = async (person: Person) => {
    try {
      await activateMutation.mutateAsync(person._id);
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleDeactivate = async (person: Person) => {
    try {
      await deactivateMutation.mutateAsync(person._id);
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleDelete = async (person: Person) => {
    try {
      await deleteMutation.mutateAsync(person._id);
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleRefresh = () => {
    refetchPeople();
  };

  const handleNavigateToNew = () => {
    router.push('/people/new');
  };

  // Loading state
  const isLoading = isLoadingPeople || isRefetching;
  const isMutating = createMutation.isPending || 
                    updateMutation.isPending || 
                    activateMutation.isPending || 
                    deactivateMutation.isPending || 
                    deleteMutation.isPending;

  return (
    <DashboardLayout>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg="blue.50"
                  borderRadius="lg"
                >
                  <FiUsers size={24} color="#3182CE" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="gray.800">
                    Gestión de Personas
                  </Heading>
                  <Text color="gray.600">
                    Administra estudiantes y docentes de la institución
                  </Text>
                </VStack>
              </HStack>

              {/* Estadísticas rápidas */}
              {stats && !isLoadingStats && (
                <HStack spacing={4} pt={2}>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
                    Total: {stats.total}
                  </Badge>
                  <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                    Estudiantes: {stats.students}
                  </Badge>
                  <Badge colorScheme="purple" variant="subtle" px={3} py={1}>
                    Docentes: {stats.teachers}
                  </Badge>
                </HStack>
              )}
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleNavigateToNew}
                size="lg"
              >
                Registrar Persona
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Error state */}
        {isPeopleError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error al cargar personas</AlertTitle>
              <AlertDescription>
                {peopleError?.message || 'No se pudieron cargar las personas. Intenta refrescar la página.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Filtros */}
        <PeopleFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
          resultCount={peopleResponse?.pagination.total}
          isLoading={isLoading}
        />

        {/* Tabla de personas */}
        <Card>
          <CardBody p={0}>
            <Box position="relative">
              {/* Overlay de loading para mutaciones */}
              {isMutating && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="rgba(255, 255, 255, 0.8)"
                  zIndex={10}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <LoadingSpinner message="Procesando..." />
                </Box>
              )}

              <PeopleTable
                people={peopleResponse?.data || []}
                isLoading={isLoading}
                onEdit={handleStartEdit}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
                onCreate={handleNavigateToNew}
              />
            </Box>
          </CardBody>
        </Card>

        {/* Paginación */}
        {peopleResponse?.pagination && peopleResponse.pagination.totalPages > 1 && (
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  Página {peopleResponse.pagination.page} de {peopleResponse.pagination.totalPages}
                  {' '}({peopleResponse.pagination.total} personas en total)
                </Text>
                
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!peopleResponse.pagination.hasPrevPage || isLoading}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </Button>
                  
                  <Text fontSize="sm" color="gray.600" px={3}>
                    {currentPage}
                  </Text>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!peopleResponse.pagination.hasNextPage || isLoading}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Siguiente
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Información adicional */}
        {!isLoading && peopleResponse?.data && peopleResponse.data.length > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Consejo</AlertTitle>
              <AlertDescription fontSize="sm">
                Puedes hacer clic en cualquier persona para ver sus detalles completos y historial de préstamos.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Modal de creación */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrar Nueva Persona</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PersonForm
              onSubmit={handleCreatePerson}
              onCancel={onCreateClose}
              isLoading={createMutation.isPending}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Persona</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingPerson && (
              <PersonForm
                person={editingPerson}
                onSubmit={handleEditPerson}
                onCancel={onEditClose}
                isLoading={updateMutation.isPending}
                isEdit={true}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}