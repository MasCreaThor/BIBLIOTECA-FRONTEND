'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { LoanStatusFilter } from '@/types/reports.types';

interface Loan {
  _id: string;
  resource: { title: string; isbn?: string };
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: string;
  observations?: string;
}

interface UpdateLoanStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[]; // Cambiado de loan a loans (array)
  personName: string;
  onUpdate: (loanId: string, status: LoanStatusFilter, observations?: string) => Promise<void>;
  updating: boolean;
}

export function UpdateLoanStatusModal({
  isOpen,
  onClose,
  loans,
  personName,
  onUpdate,
  updating,
}: UpdateLoanStatusModalProps) {
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [status, setStatus] = useState<LoanStatusFilter>(LoanStatusFilter.RETURNED);
  const [observations, setObservations] = useState('');

  const statusOptions = [
    { value: LoanStatusFilter.ACTIVE, label: 'Activo' },
    { value: LoanStatusFilter.OVERDUE, label: 'Vencido' },
    { value: LoanStatusFilter.RETURNED, label: 'Devuelto' },
    { value: LoanStatusFilter.LOST, label: 'Perdido' },
  ];

  // Seleccionar el primer préstamo por defecto cuando se abre el modal
  useEffect(() => {
    if (isOpen && loans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(loans[0]._id);
    }
  }, [isOpen, loans, selectedLoanId]);

  const selectedLoan = loans.find(loan => loan._id === selectedLoanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) {
      alert('Por favor selecciona un préstamo para actualizar');
      return;
    }
    await onUpdate(selectedLoanId, status, observations.trim() || undefined);
  };

  const handleClose = () => {
    setSelectedLoanId('');
    setStatus(LoanStatusFilter.RETURNED);
    setObservations('');
    onClose();
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('activo')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('vencido')) return 'bg-red-100 text-red-800';
    if (statusLower.includes('devuelto')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('perdido')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Actualizar Estado de Préstamos - {personName}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Panel izquierdo - Lista de préstamos */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Préstamos de {personName} ({loans.length})
              </h4>
              
              <div className="space-y-3">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLoanId === loan._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLoanId(loan._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm mb-1">
                          {loan.resource.title}
                        </h5>
                        {loan.resource.isbn && (
                          <p className="text-xs text-gray-500 mb-1">
                            ISBN: {loan.resource.isbn}
                          </p>
                        )}
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Préstamo: {formatDate(loan.loanDate)}</div>
                          <div>Vencimiento: {formatDate(loan.dueDate)}</div>
                          {loan.returnDate && (
                            <div>Devolución: {formatDate(loan.returnDate)}</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                    
                    {selectedLoanId === loan._id && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center text-xs text-blue-600">
                          <FiCheck className="h-3 w-3 mr-1" />
                          Seleccionado para actualizar
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario de actualización */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedLoan ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información del préstamo seleccionado */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Información del Préstamo</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Recurso:</span>
                      <p className="font-medium text-gray-900">{selectedLoan.resource.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado actual:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(selectedLoan.status)}`}>
                        {selectedLoan.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha de préstamo:</span>
                      <p className="font-medium text-gray-900">{formatDate(selectedLoan.loanDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha de vencimiento:</span>
                      <p className="font-medium text-gray-900">{formatDate(selectedLoan.dueDate)}</p>
                    </div>
                    {selectedLoan.returnDate && (
                      <div>
                        <span className="text-gray-600">Fecha de devolución:</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedLoan.returnDate)}</p>
                      </div>
                    )}
                    {selectedLoan.observations && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Observaciones actuales:</span>
                        <p className="font-medium text-gray-900 text-sm mt-1">{selectedLoan.observations}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nuevo estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LoanStatusFilter)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar observaciones sobre el cambio de estado..."
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4" />
                        Actualizar Estado
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Selecciona un préstamo para actualizar su estado</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 