// src/components/layout/Sidebar.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBook } from 'react-icons/fi';
import { NavigationItem } from './NavigationItem';
import { ServerStatus } from '@/components/ui/ServerStatus';
import { getFilteredNavigation } from '@/config/navigation.config';
import { useRole } from '@/hooks/useAuth';

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const { isAdmin } = useRole();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const filteredNavigation = getFilteredNavigation(isAdmin);

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
          Versión 1.0.0
        </Text>
      </Box>
    </VStack>
  );
}