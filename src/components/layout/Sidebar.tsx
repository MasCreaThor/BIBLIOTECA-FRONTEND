// src/components/layout/Sidebar.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { NavigationItem } from './NavigationItem';
import { ServerStatus } from '@/components/ui/ServerStatus';
import { getFilteredNavigation } from '@/config/navigation.config';
import { useRole } from '@/hooks/useAuth';
import { useSystemConfig } from '@/contexts/SystemConfigContext';

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const { isAdmin } = useRole();
  const { config, getIconComponent } = useSystemConfig();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const filteredNavigation = getFilteredNavigation(isAdmin);
  
  // Obtener el componente de icono dinámicamente
  const IconComponent = getIconComponent(config.sidebarIcon);

  return (
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
            <IconComponent color="white" size={20} />
          </Box>
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {config.sidebarTitle}
            </Text>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.600">
                {config.sidebarSubtitle}
              </Text>
              <ServerStatus variant="minimal" showText={false} />
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Navegación */}
      <VStack spacing={2} p={4} flex={1}>
        {filteredNavigation.map((item) => (
          <NavigationItem
            key={item.name}
            item={item}
            onItemClick={onItemClick}
          />
        ))}
      </VStack>

      {/* Footer del sidebar */}
      <Box p={4} borderTop="1px" borderColor={borderColor}>
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Versión {config.version}
        </Text>
      </Box>
    </VStack>
  );
}