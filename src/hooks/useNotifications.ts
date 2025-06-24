'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLoans } from './useLoans';
import { addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

export interface NotificationItem {
  id: string;
  type: 'overdue' | 'expiring';
  title: string;
  message: string;
  days: number;
  loanId: string;
  personName: string;
  resourceTitle: string;
  dueDate: Date;
}

export interface NotificationStats {
  total: number;
  overdue: number;
  expiring: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    overdue: 0,
    expiring: 0,
  });

  // Usar el hook de todos los préstamos para obtener datos completos
  const { loans, loading, refetch } = useLoans({});

  const calculateNotifications = useCallback(() => {
    console.log('🔔 useNotifications: Calculando notificaciones...');
    console.log('🔔 useNotifications: Total de préstamos recibidos:', loans.length);
    
    const today = new Date();
    const expiringThreshold = addDays(today, 3); // 3 días antes de vencer
    
    console.log('🔔 useNotifications: Fecha actual:', today.toISOString());
    console.log('🔔 useNotifications: Umbral de vencimiento:', expiringThreshold.toISOString());
    
    const newNotifications: NotificationItem[] = [];

    // Procesar todos los préstamos activos y vencidos
    loans.forEach((loan, index) => {
      console.log(`🔔 useNotifications: Procesando préstamo ${index + 1}:`, {
        id: loan._id,
        dueDate: loan.dueDate,
        status: loan.status?.name,
        personName: loan.person?.fullName,
        resourceTitle: loan.resource?.title
      });
      
      if (loan.dueDate && (loan.status?.name === 'active' || loan.status?.name === 'overdue')) {
        const dueDate = new Date(loan.dueDate);
        const daysDifference = differenceInDays(dueDate, today);
        
        console.log(`🔔 useNotifications: Préstamo ${loan._id} - Días de diferencia:`, daysDifference);
        
        // Préstamo vencido
        if (daysDifference < 0) {
          const daysOverdue = Math.abs(daysDifference);
          console.log(`🔔 useNotifications: Préstamo VENCIDO - ${daysOverdue} días de retraso`);
          newNotifications.push({
            id: `overdue-${loan._id}`,
            type: 'overdue',
            title: 'Préstamo Vencido',
            message: `Vencido hace ${daysOverdue} día${daysOverdue !== 1 ? 's' : ''}`,
            days: daysOverdue,
            loanId: loan._id,
            personName: loan.person?.fullName || 'Persona no especificada',
            resourceTitle: loan.resource?.title || 'Recurso no especificado',
            dueDate: dueDate,
          });
        }
        // Préstamo próximo a vencer (dentro de 3 días)
        else if (daysDifference >= 0 && daysDifference <= 3) {
          console.log(`🔔 useNotifications: Préstamo por VENCER - ${daysDifference} días restantes`);
          newNotifications.push({
            id: `expiring-${loan._id}`,
            type: 'expiring',
            title: 'Préstamo por Vencer',
            message: `Vence en ${daysDifference} día${daysDifference !== 1 ? 's' : ''}`,
            days: daysDifference,
            loanId: loan._id,
            personName: loan.person?.fullName || 'Persona no especificada',
            resourceTitle: loan.resource?.title || 'Recurso no especificado',
            dueDate: dueDate,
          });
        }
      } else {
        console.log(`🔔 useNotifications: Préstamo ${loan._id} no cumple condiciones:`, {
          hasDueDate: !!loan.dueDate,
          status: loan.status?.name
        });
      }
    });

    console.log('🔔 useNotifications: Notificaciones generadas:', newNotifications.length);
    console.log('🔔 useNotifications: Detalle de notificaciones:', newNotifications);

    // Ordenar por prioridad: vencidos primero, luego por días
    newNotifications.sort((a, b) => {
      if (a.type === 'overdue' && b.type === 'expiring') return -1;
      if (a.type === 'expiring' && b.type === 'overdue') return 1;
      return a.days - b.days;
    });

    setNotifications(newNotifications);
    
    // Calcular estadísticas
    const overdueCount = newNotifications.filter(n => n.type === 'overdue').length;
    const expiringCount = newNotifications.filter(n => n.type === 'expiring').length;
    
    const newStats = {
      total: newNotifications.length,
      overdue: overdueCount,
      expiring: expiringCount,
    };
    
    console.log('🔔 useNotifications: Estadísticas calculadas:', newStats);
    setStats(newStats);
  }, [loans]);

  useEffect(() => {
    if (!loading) {
      calculateNotifications();
    }
  }, [calculateNotifications, loading]);

  const refreshNotifications = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    notifications,
    stats,
    loading,
    refreshNotifications,
  };
}; 