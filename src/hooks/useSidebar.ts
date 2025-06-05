// src/hooks/useSidebar.ts
import { useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useEffect } from 'react';

export function useSidebar() {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  
  // Configuración responsiva
  const sidebarWidth = useBreakpointValue({ base: 'full', lg: '280px' });
  const showSidebarOnDesktop = useBreakpointValue({ base: false, lg: true });
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Cerrar sidebar automáticamente en móvil cuando se hace más grande la pantalla
  useEffect(() => {
    if (!isMobile && isOpen) {
      onClose();
    }
  }, [isMobile, isOpen, onClose]);

  return {
    // Estado del sidebar
    isOpen,
    onOpen,
    onClose,
    onToggle,
    
    // Configuración responsiva
    sidebarWidth,
    showSidebarOnDesktop,
    isMobile,
  };
}