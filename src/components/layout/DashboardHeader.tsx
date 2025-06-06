// src/components/layout/DashboardHeader.tsx
'use client';

import {
  Box,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { Breadcrumbs } from './Breadcrumbs';
import { UserProfile } from '@/components/auth/UserProfile';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
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
          onClick={onMenuClick}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs />
      </HStack>

      {/* Perfil de usuario */}
      <UserProfile />
    </Box>
  );
}