// src/app/dashboard/page.tsx
'use client';

import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  FiUsers,
  FiBook,
  FiBookOpen,
  FiAlertTriangle,
  FiPlus,
  FiArrowRight,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth, useRole } from '@/hooks/useAuth';
import { useDashboardData, useAdminDashboardData, useSystemHealth } from '@/hooks/useDashboard';
import { DateUtils } from '@/utils';
import { SafeLink } from '@/components/ui/SafeLink';

const quickActions = [
  {
    name: 'Nuevo Préstamo',
    href: '/loans/new',
    icon: FiBookOpen,
    description: 'Registrar un nuevo préstamo',
    color: 'blue',
  },
  {
    name: 'Devolver Recurso',
    href: '/loans/return',
    icon: FiArrowRight,
    description: 'Procesar una devolución',
    color: 'green',
  },
  {
    name: 'Agregar Recurso',
    href: '/inventory/new',
    icon: FiBook,
    description: 'Registrar nuevo recurso',
    color: 'purple',
  },
  {
    name: 'Registrar Persona',
    href: '/people/new',
    icon: FiUsers,
    description: 'Agregar estudiante o docente',
    color: 'orange',
  },
];

function StatCard({
  label,
  value,
  helpText,
  icon,
  color = 'blue',
  trend,
  href,
  isLoading = false,
}: {
  label: string;
  value: string | number;
  helpText?: string;
  icon: any;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  href?: string;
  isLoading?: boolean;
}) {
  const bg = useColorModeValue('white', 'gray.800');
  
  const CardContent = () => (
    <Box
      p={6}
      bg={bg}
      borderRadius="xl"
      shadow="sm"
      border="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      cursor={href ? 'pointer' : 'default'}
      _hover={href ? {
        shadow: 'md',
        transform: 'translateY(-2px)',
      } : {}}
      transition="all 0.2s"
    >
      <HStack justify="space-between" align="start">
        <Stat>
          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
            {label}
          </StatLabel>
          {isLoading ? (
            <Skeleton height="32px" width="80px" />
          ) : (
            <StatNumber fontSize="2xl" fontWeight="bold" color="gray.800">
              {value}
            </StatNumber>
          )}
          {helpText && !isLoading && (
            <StatHelpText color="gray.500" fontSize="sm">
              {helpText}
            </StatHelpText>
          )}
          {isLoading && <SkeletonText mt={2} noOfLines={1} />}
        </Stat>
        <Box
          p={3}
          borderRadius="lg"
          bg={`${color}.50`}
        >
          <Icon as={icon} boxSize={6} color={`${color}.500`} />
        </Box>
      </HStack>
    </Box>
  );

  if (href && typeof href === 'string' && href.trim() !== '') {
    return (
      <SafeLink href={href}>
        <CardContent />
      </SafeLink>
    );
  }

  return <CardContent />;
}

function QuickActionCard({
  name,
  href,
  icon,
  description,
  color,
}: {
  name: string;
  href: string;
  icon: any;
  description: string;
  color: string;
}) {
  return (
    <SafeLink href={href}>
      <Box
        p={6}
        bg="white"
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        cursor="pointer"
        _hover={{
          shadow: 'md',
          transform: 'translateY(-2px)',
        }}
        transition="all 0.2s"
        h="full"
      >
        <VStack spacing={4} align="start" h="full">
          <Box
            p={3}
            borderRadius="lg"
            bg={`${color}.50`}
          >
            <Icon as={icon} boxSize={6} color={`${color}.500`} />
          </Box>
          
          <VStack spacing={2} align="start" flex={1}>
            <Text fontWeight="semibold" color="gray.800">
              {name}
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              {description}
            </Text>
          </VStack>
          
          <Button
            size="sm"
            variant="outline"
            colorScheme={color}
            rightIcon={<FiArrowRight />}
            w="full"
          >
            Acceder
          </Button>
        </VStack>
      </Box>
    </SafeLink>
  );
}

function SystemHealthIndicator() {
  const { data: health, isLoading, error } = useSystemHealth();
  
  if (isLoading) return null;
  
  if (error || !health?.backend) {
    return (
      <Alert status="warning" borderRadius="md" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>Problemas de conectividad</AlertTitle>
          <AlertDescription fontSize="sm">
            Hay problemas de conexión con el servidor. Algunos datos pueden no estar actualizados.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }
  
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  // Usar hooks específicos según el rol
  const baseDashboardData = useDashboardData();
  const adminData = useAdminDashboardData();
  
  // Seleccionar los datos apropiados según el rol
  const dashboardData = isAdmin ? adminData : baseDashboardData;
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetchAll,
    isStale,
  } = dashboardData;

  return (
    <DashboardLayout>
      <VStack spacing={8} align="stretch">
        {/* Indicador de salud del sistema */}
        <SystemHealthIndicator />

        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={2}>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="gray.800">
                ¡Bienvenido de nuevo!
              </Heading>
              <Text color="gray.600">
                Aquí tienes un resumen de la actividad de tu biblioteca.
                {user?.lastLogin && (
                  <> Último acceso: {DateUtils.formatRelative(user.lastLogin)}</>
                )}
              </Text>
            </VStack>
            
            {/* Botón de actualizar */}
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={refetchAll}
              isLoading={isLoading}
              colorScheme={isStale ? 'orange' : 'gray'}
            >
              {isStale ? 'Actualizar' : 'Refrescar'}
            </Button>
          </HStack>
        </Box>

        {/* Error state */}
        {isError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error al cargar datos</AlertTitle>
              <AlertDescription fontSize="sm">
                {error?.message || 'No se pudieron cargar las estadísticas. Intenta refrescar la página.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Estadísticas principales */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Estadísticas Generales
          </Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <StatCard
              label="Total de Recursos"
              value={data.stats?.totalResources || 0}
              helpText="Libros, juegos, mapas, etc."
              icon={FiBook}
              color="blue"
              href="/inventory"
              isLoading={isLoading}
            />
            <StatCard
              label="Préstamos Activos"
              value={data.stats?.activeLoans || 0}
              helpText="Recursos actualmente prestados"
              icon={FiBookOpen}
              color="green"
              href="/loans?status=active"
              isLoading={isLoading}
            />
            <StatCard
              label="Préstamos Vencidos"
              value={data.stats?.overdueLoans || 0}
              helpText="Requieren seguimiento"
              icon={FiAlertTriangle}
              color="red"
              href="/loans?status=overdue"
              isLoading={isLoading}
            />
            <StatCard
              label="Personas Registradas"
              value={data.stats?.totalPeople || 0}
              helpText="Estudiantes y docentes"
              icon={FiUsers}
              color="purple"
              href="/people"
              isLoading={isLoading}
            />
          </Grid>
        </Box>

        {/* Estadísticas detalladas por tipo */}
        {data.people && !isLoading && (
          <Box>
            <Heading size="md" color="gray.800" mb={4}>
              Desglose de Personas
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <StatCard
                label="Estudiantes"
                value={data.people.students}
                icon={FiUsers}
                color="blue"
                href="/people?personType=student"
              />
              <StatCard
                label="Docentes"
                value={data.people.teachers}
                icon={FiUsers}
                color="green"
                href="/people?personType=teacher"
              />
            </Grid>
          </Box>
        )}

        {/* Estadísticas de usuarios (solo admin) */}
        {isAdmin && adminData.users?.data && (
          <Box>
            <Heading size="md" color="gray.800" mb={4}>
              Gestión de Usuarios
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <StatCard
                label="Usuarios Activos"
                value={adminData.users.data.active}
                icon={FiUsers}
                color="green"
                href="/admin/users?status=active"
              />
              <StatCard
                label="Administradores"
                value={adminData.users.data.admins}
                icon={FiUsers}
                color="red"
                href="/admin/users?role=admin"
              />
              <StatCard
                label="Bibliotecarios"
                value={adminData.users.data.librarians}
                icon={FiUsers}
                color="blue"
                href="/admin/users?role=librarian"
              />
            </Grid>
          </Box>
        )}

        {/* Acciones rápidas */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Acciones Rápidas
          </Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
            {quickActions.map((action) => (
              <QuickActionCard key={action.name} {...action} />
            ))}
          </Grid>
        </Box>

        {/* Actividad reciente */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Actividad de Hoy
          </Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <StatCard
              label="Préstamos del Día"
              value={data.stats?.recentActivity?.loans || 0}
              icon={FiBookOpen}
              color="blue"
              isLoading={isLoading}
            />
            <StatCard
              label="Devoluciones del Día"
              value={data.stats?.recentActivity?.returns || 0}
              icon={FiArrowRight}
              color="green"
              isLoading={isLoading}
            />
            <StatCard
              label="Recursos Agregados"
              value={data.stats?.recentActivity?.newResources || 0}
              icon={FiPlus}
              color="purple"
              isLoading={isLoading}
            />
            <StatCard
              label="Personas Registradas"
              value={data.stats?.recentActivity?.newPeople || 0}
              icon={FiUsers}
              color="orange"
              isLoading={isLoading}
            />
          </Grid>
        </Box>

        {/* Acceso rápido para administradores */}
        {isAdmin && (
          <Box>
            <Heading size="md" color="gray.800" mb={4}>
              Administración
            </Heading>
            <SafeLink href="/admin">
              <Button
                colorScheme="red"
                variant="outline"
                leftIcon={<Icon as={FiUsers} />}
                size="lg"
              >
                Gestionar Usuarios del Sistema
              </Button>
            </SafeLink>
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
}