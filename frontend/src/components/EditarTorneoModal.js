import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import torneoService from '../services/torneoService';
import Toast from './Toast';

function EditarTorneoModal({ isOpen, onClose, onTorneoActualizado, torneo }) {
  const [torneoBase, setTorneoBase] = useState('');
  const [fecha, setFecha] = useState('');
  const [costo, setCosto] = useState('');
  const [pais, setPais] = useState('');
  const [ciudad, setCiudad] = useState('');
  
  const [torneosBases, setTorneosBases] = useState([]);
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen && torneo) {
      setTorneoBase(torneo.fk_torneo_id?.toString() || '');
      setFecha(torneo.fecha_torneo || '');
      setCosto(torneo.costo?.toString() || '');
      setCiudad(torneo.fk_ciudad_id?.toString() || '');
      cargarDatos();
    }
  }, [isOpen, torneo]);

  useEffect(() => {
    if (pais) {
      cargarCiudades(pais);
    } else {
      setCiudades([]);
    }
  }, [pais]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [torneosData, paisesData] = await Promise.all([
        torneoService.getTorneosBase(),
        torneoService.getPaises()
      ]);
      setTorneosBases(torneosData);
      setPaises(paisesData);
      
      // Si hay un torneo seleccionado, encontrar el país de la ciudad actual
      if (torneo && torneo.fk_ciudad_id) {
        for (let p of paisesData) {
          try {
            const ciudadesData = await torneoService.getCiudadesPorPais(p.id_pais);
            const ciudadEncontrada = ciudadesData.find(c => c.id_ciudad === torneo.fk_ciudad_id);
            if (ciudadEncontrada) {
              setPais(p.id_pais.toString());
              setCiudades(ciudadesData);
              break;
            }
          } catch (err) {
            // Continuar con el siguiente país
          }
        }
      }
    } catch (err) {
      setToast({ message: 'Error al cargar datos', type: 'error' });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCiudades = async (paisId) => {
    try {
      const ciudadesData = await torneoService.getCiudadesPorPais(paisId);
      setCiudades(ciudadesData);
    } catch (err) {
      setToast({ message: 'Error al cargar ciudades', type: 'error' });
      console.error('Error:', err);
    }
  };

  const validarFormulario = () => {
    if (!torneoBase) {
      setToast({ message: 'Selecciona un tipo de torneo', type: 'error' });
      return false;
    }
    if (!fecha) {
      setToast({ message: 'Selecciona una fecha', type: 'error' });
      return false;
    }
    if (!costo || parseFloat(costo) <= 0) {
      setToast({ message: 'El costo debe ser mayor a 0', type: 'error' });
      return false;
    }
    if (!ciudad) {
      setToast({ message: 'Selecciona una ciudad', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      const datosActualizar = {
        fk_torneo_id: parseInt(torneoBase),
        fecha_torneo: fecha,
        costo: parseFloat(costo),
        fk_ciudad_id: parseInt(ciudad)
      };

      const torneoActualizado = await torneoService.actualizarTorneo(torneo.id_torneo_organizador, datosActualizar);
      setToast({ message: 'Torneo actualizado exitosamente', type: 'success' });
      
      onTorneoActualizado(torneoActualizado);
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setToast({ message: `Error al actualizar torneo: ${err.message}`, type: 'error' });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !torneo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Editar Torneo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Torneo
            </label>
            <select
              value={torneoBase}
              onChange={(e) => setTorneoBase(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900 disabled:bg-gray-100"
            >
              <option value="">Seleccionar torneo...</option>
              {torneosBases.map((t) => (
                <option key={t.id_torneo} value={t.id_torneo.toString()}>
                  {t.nombre_torneo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha del Torneo
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Costo ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900 disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              País
            </label>
            <select
              value={pais}
              onChange={(e) => {
                setPais(e.target.value);
                cargarCiudades(e.target.value);
              }}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900 disabled:bg-gray-100"
            >
              <option value="">Seleccionar país...</option>
              {paises.map((p) => (
                <option key={p.id_pais} value={p.id_pais.toString()}>
                  {p.nombre_pais}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ciudad
            </label>
            <select
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              disabled={loading || ciudades.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900 disabled:bg-gray-100"
            >
              <option value="">
                {ciudades.length === 0 ? 'Selecciona un país primero' : 'Seleccionar ciudad...'}
              </option>
              {ciudades.map((c) => (
                <option key={c.id_ciudad} value={c.id_ciudad.toString()}>
                  {c.nombre_ciudad}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-gray-900 rounded-lg transition font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default EditarTorneoModal;
