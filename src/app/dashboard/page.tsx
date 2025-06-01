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
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  FiUsers,
  FiBook,
  FiBookOpen,
  FiAlertTriangle,
  FiPlus,
  FiArrowRight,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth, useRole } from '@/hooks/useAuth';
import { DateUtils } from '@/utils';

// Datos mock para estadísticas (reemplazar con datos reales)
const mockStats = {
  totalResources: 245,
  activeLoans: 23,
  overdueLoans: 5,
  totalPeople: 156,
  recentActivity: {
    loans: 8,
    returns: 12,
    newResources: 3,
  }
};

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
}: {
  label: string;
  value: string | number;
  helpText?: string;
  icon: any;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  href?: string;
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
          <StatNumber fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText color="gray.500" fontSize="sm">
              {helpText}
            </StatHelpText>
          )}
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

  // Solo renderizar Link si href existe y es válido
  if (href && typeof href === 'string' && href.trim() !== '') {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
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
  // Validar que href sea válido antes de renderizar el Link
  if (!href || typeof href !== 'string' || href.trim() === '') {
    console.warn(`QuickActionCard "${name}" has invalid href:`, href);
    return null;
  }

  return (
    <Link href={href}>
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
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useRole();

  return (
    <DashboardLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            ¡Bienvenido de nuevo!
          </Heading>
          <Text color="gray.600">
            Aquí tienes un resumen de la actividad de tu biblioteca.
            {user?.lastLogin && (
              <> Último acceso: {DateUtils.formatRelative(user.lastLogin)}</>
            )}
          </Text>
        </Box>

        {/* Estadísticas principales */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Estadísticas Generales
          </Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <StatCard
              label="Total de Recursos"
              value={mockStats.totalResources}
              helpText="Libros, juegos, mapas, etc."
              icon={FiBook}
              color="blue"
              href="/inventory"
            />
            <StatCard
              label="Préstamos Activos"
              value={mockStats.activeLoans}
              helpText="Recursos actualmente prestados"
              icon={FiBookOpen}
              color="green"
              href="/loans?status=active"
            />
            <StatCard
              label="Préstamos Vencidos"
              value={mockStats.overdueLoans}
              helpText="Requieren seguimiento"
              icon={FiAlertTriangle}
              color="red"
              href="/loans?status=overdue"
            />
            <StatCard
              label="Personas Registradas"
              value={mockStats.totalPeople}
              helpText="Estudiantes y docentes"
              icon={FiUsers}
              color="purple"
              href="/people"
            />
          </Grid>
        </Box>

        {/* Acciones rápidas */}
        <Box>
          <Heading size="md" color="gray.800" mb={4}>
            Acciones Rápidas
          </Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
            {quickActions
              .filter(action => action.href && typeof action.href === 'string' && action.href.trim() !== '')
              .map((action) => (
                <QuickActionCard key={action.name} {...action} />
              ))
            }
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
              value={mockStats.recentActivity.loans}
              icon={FiBookOpen}
              color="blue"
            />
            <StatCard
              label="Devoluciones del Día"
              value={mockStats.recentActivity.returns}
              icon={FiArrowRight}
              color="green"
            />
            <StatCard
              label="Recursos Agregados"
              value={mockStats.recentActivity.newResources}
              icon={FiPlus}
              color="purple"
            />
          </Grid>
        </Box>

        {/* Acceso rápido para administradores */}
        {isAdmin && (
          <Box>
            <Heading size="md" color="gray.800" mb={4}>
              Administración
            </Heading>
            <Link href="/admin" passHref>
              <Button
                colorScheme="red"
                variant="outline"
                leftIcon={<Icon as={FiUsers} />}
                size="lg"
                as="a"
              >
                Gestionar Usuarios del Sistema
              </Button>
            </Link>
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
}