import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

function ConfirmarEliminarModal({ isOpen, onClose, onConfirmar, titulo, mensaje, loading }) {
  if (!isOpen || !mensaje) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-3xl text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">{mensaje}</p>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarEliminarModal;
