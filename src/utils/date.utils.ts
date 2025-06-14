// utils/date.utils.ts
export class DateUtils {
    /**
     * Formatear fecha en formato legible
     */
    static format(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
      });
    }
  
    /**
     * Formatear fecha y hora
     */
    static formatDateTime(date: Date | string): string {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      return dateObj.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  
    /**
     * Formatear fecha relativa (hace X días)
     */
    static formatRelative(date: Date | string): string {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
      if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
      return `Hace ${Math.floor(days / 365)} años`;
    }
  
    /**
     * Calcular días entre fechas
     */
    static daysBetween(date1: Date | string, date2: Date | string): number {
      const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
      const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
      
      const diff = dateObj2.getTime() - dateObj1.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
  
    /**
     * Verificar si una fecha está vencida
     */
    static isOverdue(dueDate: Date | string): boolean {
      const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
      const now = new Date();
      
      // Comparar solo las fechas, no las horas
      const dueDateOnly = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      return dueDateOnly < nowOnly;
    }
  
    /**
     * Agregar días a una fecha
     */
    static addDays(date: Date | string, days: number): Date {
      const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
      dateObj.setDate(dateObj.getDate() + days);
      return dateObj;
    }
  
    /**
     * Obtener inicio del día
     */
    static startOfDay(date: Date | string): Date {
      const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
      return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    }
  
    /**
     * Obtener fin del día
     */
    static endOfDay(date: Date | string): Date {
      const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
      return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);
    }
  }