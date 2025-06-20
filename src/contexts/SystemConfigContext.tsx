'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import * as Icons from 'react-icons/fi';

// Tipos para la configuración del sistema
export interface SystemConfig {
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarIcon: string; // Nombre del icono de react-icons/fi
  version: string;
  lastUpdated: string;
}

// Configuración por defecto
const defaultConfig: SystemConfig = {
  sidebarTitle: 'Biblioteca Escolar',
  sidebarSubtitle: 'Sistema de Biblioteca',
  sidebarIcon: 'FiBook',
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

// Contexto
interface SystemConfigContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => Promise<void>;
  isLoading: boolean;
  getIconComponent: (iconName: string) => IconType;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

// Hook personalizado
export function useSystemConfig() {
  const context = useContext(SystemConfigContext);
  if (context === undefined) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
}

// Proveedor del contexto
interface SystemConfigProviderProps {
  children: ReactNode;
}

export function SystemConfigProvider({ children }: SystemConfigProviderProps) {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Función para obtener el componente de icono
  const getIconComponent = (iconName: string): IconType => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.FiBook; // Fallback a FiBook si no se encuentra
  };

  // Cargar configuración desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('systemConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig });
      }
    } catch (error) {
      console.error('Error loading system config:', error);
      // En caso de error, usar la configuración por defecto
      setConfig(defaultConfig);
    }
  }, []);

  // Función para actualizar la configuración
  const updateConfig = async (newConfig: Partial<SystemConfig>) => {
    setIsLoading(true);
    try {
      const updatedConfig = {
        ...config,
        ...newConfig,
        lastUpdated: new Date().toISOString(),
      };

      // Guardar en localStorage
      localStorage.setItem('systemConfig', JSON.stringify(updatedConfig));
      
      // Actualizar estado
      setConfig(updatedConfig);

      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se han guardado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating system config:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: SystemConfigContextType = {
    config,
    updateConfig,
    isLoading,
    getIconComponent,
  };

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
} 