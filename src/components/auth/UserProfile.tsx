'use client';

import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  HStack,
  VStack,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SafeLink } from '@/components/ui/SafeLink';
import { DateUtils } from '@/utils';

interface UserProfileProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function UserProfile({ size = 'md', showText = true }: UserProfileProps) {
  const { user, logout } = useAuth();
  
  const { confirm: confirmLogout, dialog: logoutDialog } = useConfirmDialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión nuevamente.',
    confirmText: 'Cerrar Sesión',
    variant: 'info',
  });

  // Configuración de tamaño
  const sizeConfig = {
    sm: { avatar: 'sm', text: 'sm' },
    md: { avatar: 'md', text: 'md' },
    lg: { avatar: 'lg', text: 'lg' },
  };

  const config = sizeConfig[size];

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      await logout();
    }
  };

  if (!user) {
    return null;
  }

  // Obtener iniciales del nombre completo
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    // Si solo hay firstName
    if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    // Si solo hay lastName
    if (user.lastName) {
      return user.lastName.substring(0, 2).toUpperCase();
    }
    // Fallback al email si no hay nombre
    const emailName = user.email.split('@')[0];
    const parts = emailName.split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return emailName.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.email.split('@')[0];
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', colorScheme: 'red' },
      librarian: { label: 'Bibliotecario', colorScheme: 'blue' },
    };
    
    return roleConfig[role as keyof typeof roleConfig] || { label: role, colorScheme: 'gray' };
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <>
      <Menu>
        <MenuButton
          as={Box}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <HStack spacing={3}>
            <Avatar
              size={config.avatar}
              name={getDisplayName()}
              bg="blue.500"
              color="white"
            />
            
            {showText && (
              <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                <Text fontSize={config.text} fontWeight="medium" color="gray.700">
                  {getDisplayName()}
                </Text>
                <Badge size="sm" colorScheme={roleBadge.colorScheme}>
                  {roleBadge.label}
                </Badge>
              </VStack>
            )}
            
            <IconButton
              aria-label="Menu de usuario"
              icon={<FiChevronDown />}
              size="sm"
              variant="ghost"
              color="gray.500"
            />
          </HStack>
        </MenuButton>

        <MenuList shadow="lg" border="1px" borderColor="gray.200">
          {/* Información del usuario */}
          <Box px={4} py={3}>
            <VStack spacing={1} align="start">
              <Text fontWeight="medium" fontSize="sm">
                {getDisplayName()}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {user.email}
              </Text>
              <HStack spacing={2}>
                <FiShield size={12} />
                <Text fontSize="xs" color="gray.600">
                  {roleBadge.label}
                </Text>
              </HStack>
              {user.lastLogin && (
                <Text fontSize="xs" color="gray.500">
                  Último acceso: {DateUtils.formatRelative(user.lastLogin)}
                </Text>
              )}
            </VStack>
          </Box>

          <MenuDivider />

          {/* Opciones del menú */}
          <MenuItem 
            icon={<FiUser />} 
            fontSize="sm"
            as={SafeLink}
            href="/profile"
          >
            Mi Perfil
          </MenuItem>

          <MenuDivider />

          <MenuItem
            icon={<FiLogOut />}
            fontSize="sm"
            color="red.600"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Dialog de confirmación de logout */}
      {logoutDialog}
    </>
  );
}