// src/components/inventory/InventoryNavigation.tsx
'use client';

import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSearch, FiBook, FiDownload, FiUpload } from 'react-icons/fi';

export interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  variant: 'primary' | 'secondary';
}

const quickActions: QuickAction[] = [
  {
    title: 'Agregar Recurso',
    description: 'Registra libros, juegos, mapas manualmente',
    icon: FiPlus,
    href: '/inventory/new',
    color: 'blue',
    variant: 'primary',
  },
  {
    title: 'Buscar en Google Books',
    description: 'Encuentra y agrega libros automáticamente',
    icon: FiSearch,
    href: '/inventory/google-books',
    color: 'green',
    variant: 'primary',
  },
];

const secondaryActions: QuickAction[] = [
  {
    title: 'Importar Recursos',
    description: 'Cargar desde archivo CSV o Excel',
    icon: FiUpload,
    href: '/inventory/import',
    color: 'purple',
    variant: 'secondary',
  },
  {
    title: 'Exportar Inventario',
    description: 'Descargar listado completo',
    icon: FiDownload,
    href: '/inventory/export',
    color: 'orange',
    variant: 'secondary',
  },
];

interface InventoryNavigationProps {
  showSecondaryActions?: boolean;
  onActionClick?: (action: QuickAction) => void;
}

function ActionCard({ 
  action, 
  onClick 
}: { 
  action: QuickAction; 
  onClick: () => void;
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Card
      size="sm"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        shadow: 'md',
        transform: 'translateY(-2px)',
        borderColor: `${action.color}.300`,
      }}
      transition="all 0.2s"
      border="1px"
      borderColor={borderColor}
      bg={cardBg}
    >
      <CardBody p={4}>
        <VStack spacing={3} align="start" h="full">
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="lg"
              bg={`${action.color}.50`}
              color={`${action.color}.600`}
            >
              <Icon as={action.icon} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
              <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                {action.title}
              </Text>
              <Text fontSize="xs" color="gray.600" lineHeight="short">
                {action.description}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

export function InventoryNavigation({
  showSecondaryActions = false,
  onActionClick,
}: InventoryNavigationProps) {
  const router = useRouter();

  const handleActionClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Para acciones que aún no están implementadas, mostrar mensaje
      if (action.href === '/inventory/import' || action.href === '/inventory/export') {
        alert('Esta funcionalidad estará disponible próximamente');
        return;
      }
      router.push(action.href);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Acciones principales */}
      <Box>
        <Text fontWeight="medium" color="gray.700" mb={3} fontSize="sm">
          Acciones Principales
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {quickActions.map((action) => (
            <ActionCard
              key={action.href}
              action={action}
              onClick={() => handleActionClick(action)}
            />
          ))}
        </SimpleGrid>
      </Box>

      {/* Acciones secundarias */}
      {showSecondaryActions && (
        <Box>
          <Text fontWeight="medium" color="gray.700" mb={3} fontSize="sm">
            Herramientas Adicionales
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {secondaryActions.map((action) => (
              <ActionCard
                key={action.href}
                action={action}
                onClick={() => handleActionClick(action)}
              />
            ))}
          </SimpleGrid>
          <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
            * Funcionalidades de importación y exportación próximamente disponibles
          </Text>
        </Box>
      )}

      {/* Información de ayuda */}
      <Box>
        <Card bg="blue.50" border="1px" borderColor="blue.200">
          <CardBody p={4}>
            <HStack spacing={3}>
              <Icon as={FiBook} color="blue.600" boxSize={5} />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color="blue.800">
                  Consejos para gestionar tu inventario
                </Text>
                <Text fontSize="xs" color="blue.700" lineHeight="tall">
                  • Usa Google Books para libros rápidos con información completa<br />
                  • El registro manual es perfecto para juegos, mapas y otros recursos<br />
                  • Mantén las ubicaciones organizadas para encontrar recursos fácilmente
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </Box>
    </VStack>
  );
}