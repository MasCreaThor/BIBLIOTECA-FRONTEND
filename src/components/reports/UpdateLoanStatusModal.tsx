'use client';

import { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { LoanStatusFilter } from '@/types/reports.types';

interface UpdateLoanStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: {
    _id: string;
    resource: { title: string; isbn?: string };
    loanDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: string;
    observations?: string;
  };
  personName: string;
  onUpdate: (loanId: string, status: LoanStatusFilter, observations?: string) => Promise<void>;
  updating: boolean;
}

export function UpdateLoanStatusModal({
  isOpen,
  onClose,
  loan,
  personName,
  onUpdate,
  updating,
}: UpdateLoanStatusModalProps) {
  const [status, setStatus] = useState<LoanStatusFilter>(LoanStatusFilter.RETURNED);
  const [observations, setObservations] = useState(loan.observations || '');

  const statusOptions = [
    { value: LoanStatusFilter.ACTIVE, label: 'Activo' },
    { value: LoanStatusFilter.OVERDUE, label: 'Vencido' },
    { value: LoanStatusFilter.RETURNED, label: 'Devuelto' },
    { value: LoanStatusFilter.LOST, label: 'Perdido' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(loan._id, status, observations.trim() || undefined);
  };

  const handleClose = () => {
    setStatus(LoanStatusFilter.RETURNED);
    setObservations(loan.observations || '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Actualizar Estado del Préstamo
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información del préstamo */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Persona:</span>
              <span className="ml-2 text-sm text-gray-900">{personName}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Recurso:</span>
              <span className="ml-2 text-sm text-gray-900">{loan.resource.title}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Estado actual:</span>
              <span className="ml-2 text-sm text-gray-900">{loan.status}</span>
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
                  Actualizar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 