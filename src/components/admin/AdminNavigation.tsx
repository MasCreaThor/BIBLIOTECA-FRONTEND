// src/components/admin/AdminNavigation.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { 
  FiGrid, 
  FiMapPin, 
  FiBook, 
  FiCheckCircle,
  FiUsers,
  FiSettings,
  FiBarChart,
} from 'react-icons/fi';

export interface AdminQuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  badge?: string;
  badgeColor?: string;
}

const adminActions: AdminQuickAction[] = [
  {
    title: 'Configuración del Sistema',
    description: 'Personalizar título, subtítulo e icono',
    icon: FiSettings,
    href: '/admin/system-config',
    color: 'teal',
    badge: 'Sistema',
    badgeColor: 'red',
  },
  {
    title: 'Categorías',
    description: 'Gestionar categorías de recursos',
    icon: FiGrid,
    href: '/admin/categories',
    color: 'blue',
  },
  {
    title: 'Ubicaciones',
    description: 'Administrar ubicaciones físicas',
    icon: FiMapPin,
    href: '/admin/locations',
    color: 'green',
  },
  {
    title: 'Tipos de Recursos',
    description: 'Configurar tipos de recursos',
    icon: FiBook,
    href: '/admin/resource-types',
    color: 'purple',
    badge: 'Sistema',
    badgeColor: 'red',
  },
  {
    title: 'Estados de Recursos',
    description: 'Gestionar estados de conservación',
    icon: FiCheckCircle,
    href: '/admin/resource-states',
    color: 'orange',
    badge: 'Sistema',
    badgeColor: 'red',
  },
];

interface AdminNavigationProps {
  onActionClick?: (action: AdminQuickAction) => void;
}

function ActionCard({ 
  action, 
  onClick,
  isDisabled = false,
}: { 
  action: AdminQuickAction; 
  onClick: () => void;
  isDisabled?: boolean;
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Card
      size="sm"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      onClick={isDisabled ? undefined : onClick}
      _hover={isDisabled ? {} : {
        shadow: 'md',
        transform: 'translateY(-2px)',
        borderColor: `${action.color}.300`,
      }}
      transition="all 0.2s"
      border="1px"
      borderColor={borderColor}
      bg={cardBg}
      opacity={isDisabled ? 0.6 : 1}
    >
      <CardBody p={4}>
        <VStack spacing={3} align="start" h="full">
          <HStack justify="space-between" w="full">
            <Box
              p={2}
              borderRadius="lg"
              bg={`${action.color}.50`}
              color={`${action.color}.600`}
            >
              <Icon as={action.icon} boxSize={5} />
            </Box>
            
            {action.badge && (
              <Badge 
                colorScheme={action.badgeColor || action.color} 
                variant="subtle"
                fontSize="xs"
              >
                {action.badge}
              </Badge>
            )}
          </HStack>
          
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
              {action.title}
            </Text>
            <Text fontSize="xs" color="gray.600" lineHeight="short">
              {action.description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

export function AdminNavigation({
  onActionClick,
}: AdminNavigationProps) {
  const router = useRouter();

  const handleActionClick = (action: AdminQuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Para acciones que aún no están implementadas
      if (action.badge === 'Próximamente') {
        alert('Esta funcionalidad estará disponible próximamente');
        return;
      }
      router.push(action.href);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Gestión General */}
      <Box>
        <Text fontWeight="medium" color="gray.700" mb={3} fontSize="sm">
          Gestión General
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {adminActions.map((action) => (
            <ActionCard
              key={action.href}
              action={action}
              onClick={() => handleActionClick(action)}
              isDisabled={action.badge === 'Próximamente'}
            />
          ))}
        </SimpleGrid>
        <Text fontSize="xs" color="gray.500" mt={2}>
          * Los elementos marcados como "Sistema" requieren permisos especiales
        </Text>
      </Box>

      {/* Información de ayuda */}
      <Box>
        <Card bg="blue.50" border="1px" borderColor="blue.200">
          <CardBody p={4}>
            <HStack spacing={3}>
              <Icon as={FiSettings} color="blue.600" boxSize={5} />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color="blue.800">
                  Panel de Administración
                </Text>
                <Text fontSize="xs" color="blue.700" lineHeight="tall">
                  • Configuración del Sistema: Personaliza la apariencia del menú lateral<br />
                  • Categorías y Ubicaciones: Gestionables por bibliotecarios<br />
                  • Tipos y Estados: Solo administradores pueden modificar<br />
                  • Los cambios afectan todo el sistema, úsalos con cuidado
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </Box>
    </VStack>
  );
}