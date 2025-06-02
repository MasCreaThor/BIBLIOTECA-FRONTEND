// src/components/layout/DashboardLayout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useColorModeValue,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Tooltip,
  Skeleton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiBook,
  FiBookOpen,
  FiFileText,
  FiBarChart,
  FiSettings,
  FiChevronRight,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/components/auth/UserProfile';
import { DebugInfo } from '@/components/ui/DebugInfo';
import { useRole } from '@/hooks/useAuth';
import { useSystemHealth } from '@/hooks/useDashboard';
import { SafeLink } from '@/components/ui/SafeLink';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
  description?: string;
  badge?: string;
  badgeColor?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: FiHome,
    description: 'Vista general del sistema',
  },
  {
    name: 'Personas',
    href: '/people',
    icon: FiUsers,
    description: 'Gestionar estudiantes y docentes',
  },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: FiBook,
    description: 'Gestionar recursos de la biblioteca',
  },
  {
    name: 'Préstamos',
    href: '/loans',
    icon: FiBookOpen,
    description: 'Gestionar préstamos y devoluciones',
    badge: 'Próximamente',
    badgeColor: 'orange',
  },
  {
    name: 'Solicitudes',
    href: '/requests',
    icon: FiFileText,
    description: 'Recursos solicitados',
    badge: 'Próximamente',
    badgeColor: 'orange',
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: FiBarChart,
    description: 'Estadísticas e informes',
    badge: 'Próximamente',
    badgeColor: 'orange',
  },
  {
    name: 'Administración',
    href: '/admin',
    icon: FiSettings,
    adminOnly: true,
    description: 'Gestión de usuarios del sistema',
    badge: 'Próximamente',
    badgeColor: 'orange',
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

function ConnectionStatus() {
  const { data: health, isLoading } = useSystemHealth();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Mostrar estado de conexión solo si hay problemas o durante la carga inicial
    if (isLoading || (health && !health.backend)) {
      setShowStatus(true);
    } else {
      // Ocultar después de 3 segundos si todo está bien
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [health, isLoading]);

  if (!showStatus) return null;

  if (isLoading) {
    return (
      <Tooltip label="Verificando conexión...">
        <Box>
          <Skeleton height="20px" width="20px" borderRadius="full" />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip 
      label={health?.backend ? 'Conectado al servidor' : 'Sin conexión al servidor'}
    >
      <Box
        w={3}
        h={3}
        borderRadius="full"
        bg={health?.backend ? 'green.500' : 'red.500'}
        shadow="sm"
      />
    </Tooltip>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const { isAdmin } = useRole();

  // Responsive values
  const sidebarWidth = useBreakpointValue({ base: 'full', lg: '280px' });
  const showSidebarOnDesktop = useBreakpointValue({ base: false, lg: true });

  // Colores del tema
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filtrar navegación según rol
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin
  );

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Inicio', href: '/dashboard' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const navItem = navigation.find(item => item.href === currentPath);
      if (navItem && navItem.href) {
        breadcrumbs.push({ name: navItem.name, href: navItem.href });
      }
    });

    return breadcrumbs.filter(breadcrumb => breadcrumb.href);
  };

  const breadcrumbs = generateBreadcrumbs();

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <VStack spacing={0} align="stretch" h="full">
      {/* Logo */}
      <Box p={6} borderBottom="1px" borderColor={borderColor}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bg="blue.500"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiBook color="white" size={20} />
          </Box>
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              Biblioteca Escolar
            </Text>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.600">
                Sistema de Biblioteca
              </Text>
              <ConnectionStatus />
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Navegación */}
      <VStack spacing={2} p={4} flex={1}>
        {filteredNavigation.map((item) => {
          if (!item.href || typeof item.href !== 'string' || item.href.trim() === '') {
            console.warn(`Navigation item "${item.name}" has invalid href:`, item.href);
            return null;
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Box key={item.name} w="full">
              <SafeLink href={item.href}>
                <Box
                  display="block"
                  w="full"
                  p={3}
                  borderRadius="lg"
                  cursor="pointer"
                  bg={isActive ? 'blue.50' : 'transparent'}
                  borderLeft="3px solid"
                  borderLeftColor={isActive ? 'blue.500' : 'transparent'}
                  _hover={{
                    bg: isActive ? 'blue.50' : 'gray.50',
                  }}
                  transition="all 0.2s"
                  textDecoration="none"
                  onClick={onItemClick}
                >
                  <HStack spacing={3} justify="space-between">
                    <HStack spacing={3} flex={1}>
                      <Box
                        p={2}
                        borderRadius="md"
                        bg={isActive ? 'blue.500' : 'gray.100'}
                      >
                        <item.icon
                          size={16}
                          color={isActive ? 'white' : '#4A5568'}
                        />
                      </Box>
                      <VStack spacing={0} align="start" flex={1}>
                        <Text
                          fontWeight={isActive ? 'semibold' : 'medium'}
                          color={isActive ? 'blue.700' : 'gray.700'}
                          fontSize="sm"
                        >
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {item.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    {item.badge && (
                      <Badge 
                        size="sm" 
                        colorScheme={item.badgeColor || 'gray'}
                        fontSize="2xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </SafeLink>
            </Box>
          );
        })}
      </VStack>

      {/* Footer del sidebar */}
      <Box p={4} borderTop="1px" borderColor={borderColor}>
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Versión 1.0.0
        </Text>
      </Box>
    </VStack>
  );

  return (
    <AuthenticatedRoute>
      <Flex h="100vh" bg="gray.50">
        {/* Sidebar Desktop */}
        {showSidebarOnDesktop && (
          <Box
            w={sidebarWidth}
            h="full"
            bg={sidebarBg}
            borderRight="1px"
            borderColor={borderColor}
            position="sticky"
            top={0}
            overflowY="auto"
            className="scrollbar-thin"
          >
            <SidebarContent />
          </Box>
        )}

        {/* Sidebar Mobile */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <SidebarContent onItemClick={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Contenido Principal */}
        <Flex direction="column" flex={1} overflow="hidden">
          {/* Header */}
          <Box
            h="16"
            bg={headerBg}
            borderBottom="1px"
            borderColor={borderColor}
            px={6}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            position="sticky"
            top={0}
            zIndex={10}
            shadow="sm"
          >
            <HStack spacing={4} flex={1} minW={0}>
              {/* Botón de menú móvil */}
              <IconButton
                display={{ base: 'flex', lg: 'none' }}
                aria-label="Abrir menú"
                icon={<FiMenu />}
                variant="outline"
                size="sm"
                onClick={onOpen}
              />

              {/* Breadcrumbs */}
              <Breadcrumb
                spacing={2}
                separator={<FiChevronRight color="gray.500" size={14} />}
                fontSize="sm"
                overflow="hidden"
                flex={1}
                minW={0}
              >
                {breadcrumbs.map((breadcrumb, index) => {
                  if (!breadcrumb.href || typeof breadcrumb.href !== 'string' || breadcrumb.href.trim() === '') {
                    return (
                      <BreadcrumbItem key={`invalid-${index}`}>
                        <Text color="gray.600" fontWeight="medium" noOfLines={1}>
                          {breadcrumb.name}
                        </Text>
                      </BreadcrumbItem>
                    );
                  }

                  const isCurrentPage = index === breadcrumbs.length - 1;

                  return (
                    <BreadcrumbItem
                      key={`${breadcrumb.href}-${index}`}
                      isCurrentPage={isCurrentPage}
                    >
                      {isCurrentPage ? (
                        <Text 
                          color="gray.800" 
                          fontWeight="semibold"
                          fontSize="sm"
                          noOfLines={1}
                        >
                          {breadcrumb.name}
                        </Text>
                      ) : (
                        <BreadcrumbLink
                          as={SafeLink}
                          href={breadcrumb.href}
                          color="gray.600"
                          fontWeight="medium"
                          fontSize="sm"
                          noOfLines={1}
                        >
                          {breadcrumb.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </Breadcrumb>
            </HStack>

            {/* Perfil de usuario */}
            <UserProfile />
          </Box>

          {/* Contenido de la página */}
          <Box flex={1} overflow="auto">
            <Container maxW="full" py={6} px={6}>
              {children}
            </Container>
          </Box>
        </Flex>

        {/* Debug info en desarrollo */}
        <DebugInfo />
      </Flex>
    </AuthenticatedRoute>
  );
}