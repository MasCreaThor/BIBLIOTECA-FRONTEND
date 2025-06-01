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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiShield,
  FiKey,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DateUtils } from '@/utils';

// Schema para cambio de contraseña
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

interface UserProfileProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function UserProfile({ size = 'md', showText = true }: UserProfileProps) {
  const { user, logout, changePassword } = useAuth();
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const toast = useToast();
  
  const { confirm: confirmLogout, dialog: logoutDialog } = useConfirmDialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión nuevamente.',
    confirmText: 'Cerrar Sesión',
    variant: 'info',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
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

  const handleChangePassword = async (data: ChangePasswordData) => {
    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente',
        status: 'success',
        duration: 3000,
      });
      
      reset();
      onPasswordModalClose();
    } catch (error: any) {
      toast({
        title: 'Error al cambiar contraseña',
        description: error?.message || 'Ocurrió un error inesperado',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  // Obtener iniciales del email
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
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
              name={user.email}
              bg="blue.500"
              color="white"
              src="" // Sin imagen, usar iniciales
            >
              {getInitials(user.email)}
            </Avatar>
            
            {showText && (
              <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                <Text fontSize={config.text} fontWeight="medium" color="gray.700">
                  {user.email.split('@')[0]}
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
          <MenuItem icon={<FiUser />} fontSize="sm">
            Mi Perfil
          </MenuItem>
          
          <MenuItem icon={<FiKey />} fontSize="sm" onClick={onPasswordModalOpen}>
            Cambiar Contraseña
          </MenuItem>
          
          <MenuItem icon={<FiSettings />} fontSize="sm">
            Configuración
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

      {/* Modal para cambiar contraseña */}
      <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cambiar Contraseña</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit(handleChangePassword)}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.currentPassword}>
                  <FormLabel>Contraseña Actual</FormLabel>
                  <Input
                    {...register('currentPassword')}
                    type="password"
                    placeholder="Tu contraseña actual"
                  />
                  {errors.currentPassword && (
                    <Text color="red.500" fontSize="sm">
                      {errors.currentPassword.message}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.newPassword}>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <Input
                    {...register('newPassword')}
                    type="password"
                    placeholder="Tu nueva contraseña"
                  />
                  {errors.newPassword && (
                    <Text color="red.500" fontSize="sm">
                      {errors.newPassword.message}
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número
                  </Text>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  {errors.confirmPassword && (
                    <Text color="red.500" fontSize="sm">
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </FormControl>

                <HStack spacing={3} w="full" pt={2}>
                  <Button variant="outline" onClick={onPasswordModalClose} flex={1}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isChangingPassword}
                    loadingText="Cambiando..."
                    flex={1}
                  >
                    Cambiar Contraseña
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Dialog de confirmación de logout */}
      {logoutDialog}
    </>
  );
}