import axiosInstance from '@/lib/axios';
import { 
  PersonLoanSummary, 
  PersonLoansQuery, 
  UpdateLoanStatusRequest, 
  UpdateMultipleLoanStatusRequest 
} from '@/types/reports.types';

export const reportsService = {
  async getPersonLoans(query: PersonLoansQuery): Promise<PersonLoanSummary[]> {
    const params = new URLSearchParams();
    
    if (query.search) {
      params.append('search', query.search);
    }
    
    if (query.status && query.status.length > 0) {
      query.status.forEach(status => {
        params.append('status', status);
      });
    }
    
    if (query.year) {
      params.append('year', query.year);
    }

    try {
      const response = await axiosInstance.get(`/reports/person-loans?${params.toString()}`);
      
      // Verificar que la respuesta sea un array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si la respuesta está envuelta en un objeto con propiedad 'data'
        return response.data.data;
      } else {
        console.error('Respuesta inesperada del servidor:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error en getPersonLoans:', error);
      return [];
    }
  },

  async updateLoanStatus(request: UpdateLoanStatusRequest): Promise<void> {
    await axiosInstance.put('/reports/update-loan-status', request);
  },

  async updateMultipleLoanStatus(request: UpdateMultipleLoanStatusRequest): Promise<void> {
    await axiosInstance.put('/reports/update-multiple-loan-status', request);
  },
}; 