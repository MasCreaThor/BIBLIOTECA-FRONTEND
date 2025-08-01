// src/components/layout/Sidebar.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Image,
  Spinner,
} from '@chakra-ui/react';
import { NavigationItem } from './NavigationItem';
import { ServerStatus } from '@/components/ui/ServerStatus';
import { getFilteredNavigation } from '@/config/navigation.config';
import { useRole } from '@/hooks/useAuth';
import { useSystemConfig } from '@/contexts/SystemConfigContext';
import { useAuth } from '@/hooks/useAuth';
import { FiImage } from 'react-icons/fi';

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const { isAdmin } = useRole();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { config, getIconComponent, isLoading, isInitialized } = useSystemConfig();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const filteredNavigation = getFilteredNavigation(isAdmin);
  
  // Mostrar spinner mientras carga autenticación o configuración
  if (authLoading || isLoading || !config) {
    return (
      <VStack spacing={0} align="stretch" h="full">
        <Box p={6} borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Spinner size="sm" color="blue.500" />
            <Text fontSize="sm" color="gray.500">
              {authLoading ? 'Verificando autenticación...' : 
               isLoading ? 'Cargando configuración...' : 
               'Inicializando...'}
            </Text>
          </HStack>
        </Box>
        
        {/* Mostrar navegación básica mientras carga */}
        <VStack spacing={0} align="stretch" flex={1}>
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
            Cargando...
          </Text>
        </Box>
      </VStack>
    );
  }
  
  // Obtener el componente de icono dinámicamente
  const IconComponent = getIconComponent(config.sidebarIcon);

  // Función para obtener la imagen a mostrar (prioridad: imagen subida > URL > icono)
  const getLogoImage = () => {
    console.log('🔍 Analizando configuración de icono:', {
      sidebarIconImage: config.sidebarIconImage ? 'Presente' : 'No presente',
      sidebarIconUrl: config.sidebarIconUrl ? 'Presente' : 'No presente',
      sidebarIcon: config.sidebarIcon
    });

    if (config.sidebarIconImage && config.sidebarIconImage.trim()) {
      console.log('🖼️ Usando imagen subida:', config.sidebarIconImage.substring(0, 50) + '...');
      return config.sidebarIconImage;
    }
    if (config.sidebarIconUrl && config.sidebarIconUrl.trim()) {
      console.log('🔗 Usando URL de imagen:', config.sidebarIconUrl);
      return config.sidebarIconUrl;
    }
    console.log('🎨 Usando icono por defecto:', config.sidebarIcon);
    return null;
  };

  const logoImage = getLogoImage();

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
            overflow="hidden"
          >
            {logoImage ? (
              <Image
                src={logoImage}
                alt="Logo del sistema"
                w="full"
                h="full"
                objectFit="cover"
                fallback={
                  <IconComponent color="white" size={20} />
                }
                onError={(e) => {
                  console.error('❌ Error cargando imagen:', e);
                }}
                onLoad={() => {
                  console.log('✅ Imagen cargada correctamente');
                }}
              />
            ) : (
              <IconComponent color="white" size={20} />
            )}
          </Box>
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" fontSize="lg" color="red.800">
              {config.sidebarTitle}
            </Text>
            <HStack spacing={2}>
              <Text fontSize="sm" color="red.500">
                {config.sidebarSubtitle}
              </Text>
              <ServerStatus variant="minimal" showText={false} />
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Navegación */}
      <VStack spacing={0} align="stretch" flex={1}>
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
        {process.env.NODE_ENV === 'development' && (
          <Text fontSize="xs" color="gray.400" textAlign="center">
            {isInitialized ? '' : '⏳ Inicializando...'}
          </Text>
        )}
      </Box>
    </VStack>
  );
}