'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import * as Icons from 'react-icons/fi';
import { systemConfigService } from '@/services/system-config.service';
import { useAuth } from '@/hooks/useAuth';

// Tipos para la configuración del sistema
export interface SystemConfig {
  id?: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarIcon: string; // Nombre del icono de react-icons/fi
  sidebarIconUrl?: string; // URL de imagen personalizada
  sidebarIconImage?: string; // Imagen en base64
  version: string;
  lastUpdated: string;
  active?: boolean;
  description?: string;
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
  config: SystemConfig | null; // Cambiado a null para indicar que no se ha cargado
  updateConfig: (newConfig: Partial<SystemConfig>) => Promise<void>;
  isLoading: boolean;
  getIconComponent: (iconName: string) => IconType;
  loadConfig: () => Promise<void>;
  isInitialized: boolean;
  refreshConfig: () => Promise<void>; // Nueva función para recarga manual
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
  const [config, setConfig] = useState<SystemConfig | null>(null); // Inicializado como null
  const [isLoading, setIsLoading] = useState(false); // Cambiado a false inicialmente
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();

  // Función para obtener el componente de icono
  const getIconComponent = (iconName: string): IconType => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.FiBook; // Fallback a FiBook si no se encuentra
  };

  // Cargar configuración desde el backend
  const loadConfig = async () => {
    // Solo cargar si el usuario está autenticado
    if (!isAuthenticated) {
      console.log('⏳ Usuario no autenticado, esperando...');
      return;
    }

    console.log('🔄 Iniciando carga de configuración del sistema...');
    setIsLoading(true);
    try {
      const backendConfig = await systemConfigService.getActiveConfig();
      console.log('✅ Configuración cargada desde backend:', backendConfig);
      setConfig(backendConfig);
      setIsInitialized(true);
      
      // Guardar en localStorage como backup
      localStorage.setItem('systemConfig', JSON.stringify(backendConfig));
      console.log('💾 Configuración guardada en localStorage como backup');
    } catch (error) {
      console.error('❌ Error loading system config from backend:', error);
      
      // En caso de error, cargar desde localStorage como fallback
      try {
        const savedConfig = localStorage.getItem('systemConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          console.log('📦 Cargando configuración desde localStorage:', parsedConfig);
          setConfig({ ...defaultConfig, ...parsedConfig });
        } else {
          console.log('⚠️ No hay configuración guardada en localStorage, usando configuración por defecto');
          setConfig(defaultConfig);
        }
      } catch (localError) {
        console.error('❌ Error loading system config from localStorage:', localError);
        setConfig(defaultConfig);
      }
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar configuración cuando cambie el estado de autenticación
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('🔐 Usuario autenticado, cargando configuración...');
      loadConfig();
    } else if (!isAuthenticated && !authLoading) {
      console.log('🚪 Usuario no autenticado, limpiando configuración...');
      setConfig(null);
      setIsInitialized(false);
    }
  }, [isAuthenticated, authLoading]);

  // Función para actualizar la configuración
  const updateConfig = async (newConfig: Partial<SystemConfig>) => {
    if (!config) {
      console.error('❌ No se puede actualizar la configuración: config es null');
      return;
    }

    console.log('🔄 Actualizando configuración:', newConfig);
    setIsLoading(true);
    try {
      const updatedConfig = {
        ...config,
        ...newConfig,
        lastUpdated: new Date().toISOString(),
      };

      // Actualizar en el backend
      const backendResponse = await systemConfigService.updateConfig(newConfig);
      console.log('✅ Configuración actualizada en backend:', backendResponse);
      
      // Actualizar estado local
      setConfig(backendResponse);

      // Guardar en localStorage como backup
      localStorage.setItem('systemConfig', JSON.stringify(backendResponse));
      console.log('💾 Configuración actualizada en localStorage');

      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se han guardado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error updating system config:', error);
      
      // Fallback: guardar solo en localStorage
      try {
        const fallbackConfig = {
          ...config,
          ...newConfig,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('systemConfig', JSON.stringify(fallbackConfig));
        setConfig(fallbackConfig);
        console.log('💾 Configuración guardada localmente como fallback');
        
        toast({
          title: 'Configuración guardada localmente',
          description: 'Los cambios se guardaron localmente debido a un error de conexión',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } catch (localError) {
        console.error('❌ Error saving to localStorage:', localError);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar la configuración',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: SystemConfigContextType = {
    config,
    updateConfig,
    isLoading: isLoading || authLoading, // Incluir el estado de carga de autenticación
    getIconComponent,
    loadConfig,
    isInitialized,
    refreshConfig: loadConfig,
  };

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
} 