// src/components/layout/DashboardLayout.tsx
'use client';

import { ReactNode } from 'react';
import {
  Box,
  Flex,
  Container,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { DebugInfo } from '@/components/ui/DebugInfo';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { useSidebar } from '@/hooks/useSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  containerPadding?: number | string;
}

export function DashboardLayout({ 
  children, 
  maxWidth = 'full',
  containerPadding = 6 
}: DashboardLayoutProps) {
  const {
    isOpen,
    onOpen,
    onClose,
    sidebarWidth,
    showSidebarOnDesktop,
  } = useSidebar();

  // Colores del tema
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
            <Sidebar />
          </Box>
        )}

        {/* Sidebar Mobile */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <Sidebar onItemClick={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Contenido Principal */}
        <Flex direction="column" flex={1} overflow="hidden">
          {/* Header */}
          <DashboardHeader onMenuClick={onOpen} />

          {/* Contenido de la página */}
          <Box flex={1} overflow="auto">
            <Container maxW={maxWidth} py={containerPadding} px={containerPadding}>
              {children}
            </Container>
          </Box>
        </Flex>
      </Flex>
      {/* <DebugInfo /> */}
    </AuthenticatedRoute>
  );
}