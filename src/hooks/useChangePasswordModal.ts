import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useAuth } from './useAuth';

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

export function useChangePasswordModal() {
  const { changePassword } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

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
      onClose();
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

  const openModal = () => {
    reset();
    onOpen();
  };

  return {
    isOpen,
    onOpen: openModal,
    onClose,
    register,
    handleSubmit,
    errors,
    isChangingPassword,
    handleChangePassword,
  };
} 