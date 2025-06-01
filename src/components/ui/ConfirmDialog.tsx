import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    Icon,
    HStack,
    Text,
    VStack,
  } from '@chakra-ui/react';
  import { useRef } from 'react';
  import { IconType } from 'react-icons';
  import { FiAlertTriangle, FiTrash2, FiCheck, FiX, FiInfo } from 'react-icons/fi';
  
  interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    icon?: IconType;
    isLoading?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }
  
  export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    icon,
    isLoading = false,
    size = 'md',
  }: ConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);
  
    // Configuración por variant
    const variantConfig = {
      danger: {
        icon: FiTrash2,
        iconColor: 'red.500',
        confirmColorScheme: 'red',
        confirmText: confirmText || 'Eliminar',
      },
      warning: {
        icon: FiAlertTriangle,
        iconColor: 'orange.500',
        confirmColorScheme: 'orange',
        confirmText: confirmText || 'Continuar',
      },
      info: {
        icon: FiInfo,
        iconColor: 'blue.500',
        confirmColorScheme: 'blue',
        confirmText: confirmText || 'Aceptar',
      },
      success: {
        icon: FiCheck,
        iconColor: 'green.500',
        confirmColorScheme: 'green',
        confirmText: confirmText || 'Confirmar',
      },
    };
  
    const config = variantConfig[variant];
    const IconComponent = icon || config.icon;
  
    return (
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        size={size}
        motionPreset="slideInBottom"
        closeOnOverlayClick={!isLoading}
        closeOnEsc={!isLoading}
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" pb={4}>
              <HStack spacing={3}>
                <Icon
                  as={IconComponent}
                  color={config.iconColor}
                  boxSize={6}
                />
                <Text>{title}</Text>
              </HStack>
            </AlertDialogHeader>
  
            <AlertDialogBody>
              <Text color="gray.600" lineHeight="tall">
                {message}
              </Text>
            </AlertDialogBody>
  
            <AlertDialogFooter>
              <HStack spacing={3}>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  disabled={isLoading}
                  variant="outline"
                >
                  {cancelText}
                </Button>
                <Button
                  colorScheme={config.confirmColorScheme}
                  onClick={onConfirm}
                  isLoading={isLoading}
                  loadingText="Procesando..."
                >
                  {config.confirmText}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    );
  }
  
  // Hook para usar el dialog de confirmación de manera más sencilla
  import { useDisclosure } from '@chakra-ui/react';
  import { useState, useCallback } from 'react';
  
  interface UseConfirmDialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    icon?: IconType;
  }
  
  export function useConfirmDialog(options: UseConfirmDialogOptions) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setIsLoading] = useState(false);
    const [currentResolver, setCurrentResolver] = useState<{
      resolve: (value: boolean) => void;
    } | null>(null);
  
    const confirm = useCallback((): Promise<boolean> => {
      return new Promise((resolve) => {
        setCurrentResolver({ resolve });
        onOpen();
      });
    }, [onOpen]);
  
    const handleConfirm = useCallback(async () => {
      setIsLoading(true);
      try {
        if (currentResolver) {
          currentResolver.resolve(true);
          setCurrentResolver(null);
        }
        onClose();
      } finally {
        setIsLoading(false);
      }
    }, [currentResolver, onClose]);
  
    const handleCancel = useCallback(() => {
      if (currentResolver) {
        currentResolver.resolve(false);
        setCurrentResolver(null);
      }
      onClose();
    }, [currentResolver, onClose]);
  
    const dialog = (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        {...options}
      />
    );
  
    return {
      confirm,
      dialog,
      isOpen,
      isLoading,
    };
  }
  
  // Componentes especializados para casos comunes
  export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType = 'elemento',
    isLoading = false,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    itemType?: string;
    isLoading?: boolean;
  }) {
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={`Eliminar ${itemType}`}
        message={
          itemName
            ? `¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar este ${itemType}? Esta acción no se puede deshacer.`
        }
        variant="danger"
        confirmText="Eliminar"
        isLoading={isLoading}
      />
    );
  }
  
  export function DeactivateConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType = 'elemento',
    isLoading = false,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    itemType?: string;
    isLoading?: boolean;
  }) {
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={`Desactivar ${itemType}`}
        message={
          itemName
            ? `¿Estás seguro de que quieres desactivar "${itemName}"? Podrás reactivarlo más tarde.`
            : `¿Estás seguro de que quieres desactivar este ${itemType}? Podrás reactivarlo más tarde.`
        }
        variant="warning"
        confirmText="Desactivar"
        isLoading={isLoading}
      />
    );
  }
  
  export function LogoutConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
  }) {
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder al sistema."
        variant="info"
        confirmText="Cerrar sesión"
        cancelText="Permanecer"
        isLoading={isLoading}
        icon={FiX}
      />
    );
  }