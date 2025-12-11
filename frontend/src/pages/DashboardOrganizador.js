import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { FaChessKnight, FaMapMarkerAlt, FaCalendar, FaUser, FaDollarSign, FaEdit, FaTrash } from 'react-icons/fa';
import { MdEmojiEvents } from 'react-icons/md';
import DashboardLayout from '../layouts/DashboardLayout';
import torneoService from '../services/torneoService';
import Toast from '../components/Toast';
import CrearTorneoModal from '../components/CrearTorneoModal';
import EditarTorneoModal from '../components/EditarTorneoModal';
import ConfirmarEliminarModal from '../components/ConfirmarEliminarModal';

function DashboardOrganizador() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [misTorneos, setMisTorneos] = useState(0);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [torneoAEliminar, setTorneoAEliminar] = useState(null);
  const [eliminandoTorneo, setEliminandoTorneo] = useState(false);
  const user = authService.getUser();

  useEffect(() => {
    const fetchTorneosOrganizador = async () => {
      try {
        setLoading(true);
        // Obtener los torneos organizados por este usuario
        const data = await torneoService.getTorneosOrganizador(user?.id_organizador);
        setTorneos(data);
        setMisTorneos(data.length || 0);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id_organizador) {
      fetchTorneosOrganizador();
    }
  }, [user?.id_organizador]);

  const handleAbrirConfirmacion = (torneo) => {
    setTorneoAEliminar(torneo);
    setMostrarConfirmar(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!torneoAEliminar) return;
    
    try {
      setEliminandoTorneo(true);
      await torneoService.eliminarTorneo(torneoAEliminar.id_torneo_organizador);
      setTorneos(torneos.filter(torneo => torneo.id_torneo_organizador !== torneoAEliminar.id_torneo_organizador));
      setMisTorneos(misTorneos - 1);
      setToast({ message: 'Torneo eliminado exitosamente', type: 'success' });
      setMostrarConfirmar(false);
      setTorneoAEliminar(null);
    } catch (err) {
      const mensajeError = err.response?.data?.detail || err.message || 'Error desconocido al eliminar torneo';
      setToast({ message: mensajeError, type: 'error' });
      console.error('Error:', err);
    } finally {
      setEliminandoTorneo(false);
    }
  };

  const handleAbrirEditar = (torneo) => {
    setTorneoSeleccionado(torneo);
    setMostrarModalEditar(true);
  };

  const handleTorneoActualizado = (torneoActualizado) => {
    setTorneos(torneos.map(t => 
      t.id_torneo_organizador === torneoActualizado.id_torneo_organizador 
        ? torneoActualizado 
        : t
    ));
    setToast({ message: 'Torneo actualizado exitosamente', type: 'success' });
  };

  const handleTorneoCreado = (nuevoTorneo) => {
    setTorneos([nuevoTorneo, ...torneos]);
    setMisTorneos(misTorneos + 1);
  };

  return (
    <DashboardLayout title="Panel de Control Organizador">
      {/* Tarjetas de Estadísticas del Organizador */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Estadísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Torneos Creados</p>
                <p className="text-3xl font-bold text-gray-900">{misTorneos}</p>
              </div>
              <MdEmojiEvents className="text-5xl text-black" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Inscripciones Totales</p>
                <p className="text-3xl font-bold text-gray-900">
                  {torneos.reduce((sum, t) => sum + (t.inscripciones_count || 0), 0)}
                </p>
              </div>
              <FaChessKnight className="text-5xl text-black" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Ingresos Totales</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${torneos.reduce((sum, t) => {
                    const costo = typeof t.costo === 'string' ? parseFloat(t.costo) : t.costo;
                    return sum + (costo * (t.inscripciones_count || 0));
                  }, 0).toFixed(2)}
                </p>
              </div>
              <FaDollarSign className="text-5xl text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Mis Torneos */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mis Torneos</h2>
          <button 
            onClick={() => setMostrarModalCrear(true)}
            className="px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg transition font-semibold"
          >
            + Crear Torneo
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando torneos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && torneos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No has organizado ningún torneo aún</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {torneos.map((torneo) => (
            <div key={torneo.id_torneo_organizador} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{torneo.torneo?.nombre_torneo || torneo.nombre_torneo}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <FaUser className="mr-2" />
                    Por: {user?.nombre_organizador}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Activo
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center">
                  <FaCalendar className="mr-2 text-gray-400" />
                  {new Date(torneo.fecha_torneo).toLocaleDateString('es-ES')}
                </p>
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  {torneo.ciudad_nombre}
                </p>
                <p className="flex items-center">
                  <MdEmojiEvents className="mr-2 text-gray-400" />
                  {torneo.inscripciones_count || 0} Jugadores Inscritos
                </p>
                <p className="flex items-center">
                  <FaDollarSign className="mr-2 text-gray-400" />
                  ${typeof torneo.costo === 'string' ? parseFloat(torneo.costo).toFixed(2) : torneo.costo.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleAbrirEditar(torneo)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Editar
                </button>
                <button 
                  onClick={() => handleAbrirConfirmacion(torneo)}
                  className="flex-1 px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  <FaTrash className="text-sm" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <CrearTorneoModal 
        isOpen={mostrarModalCrear} 
        onClose={() => setMostrarModalCrear(false)}
        onTorneoCreado={handleTorneoCreado}
      />

      <EditarTorneoModal
        isOpen={mostrarModalEditar}
        onClose={() => {
          setMostrarModalEditar(false);
          setTorneoSeleccionado(null);
        }}
        onTorneoActualizado={handleTorneoActualizado}
        torneo={torneoSeleccionado}
      />

      <ConfirmarEliminarModal
        isOpen={mostrarConfirmar}
        onClose={() => {
          setMostrarConfirmar(false);
          setTorneoAEliminar(null);
        }}
        onConfirmar={handleConfirmarEliminar}
        titulo="Eliminar Torneo"
        mensaje={torneoAEliminar ? `¿Estás seguro de que deseas eliminar el torneo "${torneoAEliminar.torneo?.nombre_torneo || torneoAEliminar.nombre_torneo || 'sin nombre'}"? Esta acción no se puede deshacer.` : ''}
        loading={eliminandoTorneo}
      />
    </DashboardLayout>
  );
}

export default DashboardOrganizador;
