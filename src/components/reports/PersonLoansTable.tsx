'use client';

import { useState } from 'react';
import { FiEye, FiEdit, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { PersonLoanSummary, LoanStatusFilter } from '@/types/reports.types';
import { reportsService } from '@/services/reports.service';
import { UpdateLoanStatusModal } from './UpdateLoanStatusModal';
import { formatDate } from '@/utils/date.utils';

interface PersonLoansTableProps {
  data: PersonLoanSummary[];
  loading: boolean;
  onDataUpdate: (data: PersonLoanSummary[]) => void;
}

export function PersonLoansTable({ data, loading, onDataUpdate }: PersonLoansTableProps) {
  const [selectedLoan, setSelectedLoan] = useState<{
    personId: string;
    personName: string;
    loans: PersonLoanSummary['loans'];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (loanId: string, status: LoanStatusFilter, observations?: string) => {
    setUpdating(true);
    try {
      await reportsService.updateLoanStatus({
        loanId,
        status,
        observations,
      });

      // Actualizar los datos localmente
      const updatedData = data.map(person => ({
        ...person,
        loans: person.loans.map(loan => 
          loan._id === loanId 
            ? { ...loan, status: getStatusLabel(status) }
            : loan
        ),
        summary: person.loans.some(loan => loan._id === loanId) 
          ? calculateSummary(person.loans.map(loan => 
              loan._id === loanId 
                ? { ...loan, status: getStatusLabel(status) }
                : loan
            ))
          : person.summary
      }));

      onDataUpdate(updatedData);
      setIsModalOpen(false);
      setSelectedLoan(null);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    const map: Record<string, string> = {
      active: 'Activo',
      overdue: 'Vencido',
      returned: 'Devuelto',
      lost: 'Perdido',
      activo: 'Activo',
      vencido: 'Vencido',
      devuelto: 'Devuelto',
      perdido: 'Perdido',
    };
    return map[status?.toLowerCase() || ''] || status || '';
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('activo')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('vencido')) return 'bg-red-100 text-red-800';
    if (statusLower.includes('devuelto')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('perdido')) return 'bg-gray-300 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPersonStatusBadge = (personStatus: 'up_to_date' | 'not_up_to_date') => {
    if (personStatus === 'up_to_date') {
      return {
        label: 'Al día',
        className: 'bg-green-100 text-green-800 border border-green-200'
      };
    } else {
      return {
        label: 'No está al día',
        className: 'bg-red-100 text-red-800 border border-red-200'
      };
    }
  };

  const calculateSummary = (loans: PersonLoanSummary['loans']) => {
    const summary = {
      totalLoans: loans.length,
      activeLoans: 0,
      overdueLoans: 0,
      returnedLoans: 0,
      lostLoans: 0,
    };

    loans.forEach(loan => {
      const statusLower = loan.status.toLowerCase();
      if (statusLower.includes('activo')) summary.activeLoans++;
      else if (statusLower.includes('vencido')) summary.overdueLoans++;
      else if (statusLower.includes('devuelto')) summary.returnedLoans++;
      else if (statusLower.includes('perdido')) summary.lostLoans++;
    });

    return summary;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Validar que data sea un array
  if (!Array.isArray(data)) {
    console.error('Data no es un array:', data);
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar datos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hubo un problema al cargar los datos. Intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron resultados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda o el año seleccionado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado de la Persona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resumen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Préstamos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((personData) => (
                <tr key={personData.person._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {personData.person.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {personData.person.documentNumber}
                      </div>
                      <div className="text-xs text-gray-400">
                        {personData.person.personType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const badge = getPersonStatusBadge(personData.personStatus);
                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Total:</span> {personData.summary.totalLoans}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Activos: {personData.summary.activeLoans}
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                          Vencidos: {personData.summary.overdueLoans}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Devueltos: {personData.summary.returnedLoans}
                        </span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Perdidos: {personData.summary.lostLoans}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {personData.loans.map((loan) => (
                        <div key={loan._id} className="border-l-4 border-gray-200 pl-3">
                          <div className="text-sm font-medium text-gray-900">
                            {loan.resource?.title || 'Sin título'}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Préstamo: {formatDate(loan.loanDate)}</div>
                            <div>Vencimiento: {formatDate(loan.dueDate)}</div>
                            {loan.returnDate && (
                              <div>Devolución: {formatDate(loan.returnDate)}</div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(loan.status)}`}>
                                {getStatusLabel(loan.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedLoan({
                            personId: personData.person._id,
                            personName: personData.person.name,
                            loans: personData.loans,
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        title="Actualizar estado"
                      >
                        <FiEdit className="h-4 w-4" />
                        Actualizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLoan && (
        <UpdateLoanStatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLoan(null);
          }}
          loans={selectedLoan.loans}
          personName={selectedLoan.personName}
          onUpdate={handleUpdateStatus}
          updating={updating}
        />
      )}
    </>
  );
} 