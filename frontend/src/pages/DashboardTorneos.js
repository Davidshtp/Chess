import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaTrophy, FaCalendar, FaMapMarkerAlt, FaUsers, FaTrash } from 'react-icons/fa';
import authService from '../services/authService';
import inscripcionService from '../services/inscripcionService';
import Toast from '../components/Toast';

function DashboardTorneos() {
  const [misTorneos, setMisTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [toast, setToast] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const itemsPorPagina = 5;
  const user = authService.getUser();

  useEffect(() => {
    const fetchMisTorneos = async () => {
      try {
        setLoading(true);
        if (user?.id_jugador) {
          const inscripciones = await inscripcionService.getInscripcionesJugador(user.id_jugador);
          
          // Filtrar solo torneos con fechas futuras
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          
          const torneosFuturos = inscripciones.filter(torneo => {
            const fechaTorneo = new Date(torneo.fecha_torneo);
            return fechaTorneo >= hoy;
          });
          
          // Ordenar por fecha más nueva primero
          const torneosOrdenados = torneosFuturos.sort((a, b) => {
            const fechaA = new Date(a.fecha_torneo);
            const fechaB = new Date(b.fecha_torneo);
            return fechaA - fechaB;
          });
          setMisTorneos(torneosOrdenados);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMisTorneos();
  }, [user?.id_jugador]);

  const handleCancelarInscripcion = async (idInscripcion) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar tu inscripción?')) {
      try {
        setCancelando(true);
        await inscripcionService.cancelarInscripcion(idInscripcion);
        setMisTorneos(misTorneos.filter(torneo => torneo.id_inscripcion !== idInscripcion));
        setToast({ message: 'Inscripción cancelada exitosamente', type: 'success' });
      } catch (err) {
        setToast({ message: `Error al cancelar inscripción: ${err.message}`, type: 'error' });
        console.error('Error:', err);
      } finally {
        setCancelando(false);
      }
    }
  };

  // Calcular paginación
  const totalPaginas = Math.ceil(misTorneos.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const torneosActuales = misTorneos.slice(indiceInicio, indiceFin);

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  return (
    <DashboardLayout title="Mis Torneos">
      {/* Mis Torneos Actuales */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Torneos en los que participo</h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando mis torneos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && misTorneos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay torneos inscritos en este momento</p>
          </div>
        )}

        {!loading && misTorneos.length > 0 && (
          <>
            <div className="space-y-4">
              {torneosActuales.map((inscripcion, index) => (
                <div 
                  key={inscripcion.id_inscripcion} 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition animate-card-enter"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {inscripcion.nombre_torneo}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Organizador:</span>
                        <FaUsers className="mr-2 text-gray-400" />
                        {inscripcion.nombre_organizador}
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Fecha:</span>
                        <FaCalendar className="mr-2 text-gray-400" />
                        {new Date(inscripcion.fecha_torneo).toLocaleDateString('es-ES')}
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Ubicación:</span>
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {inscripcion.ciudad}
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">Precio:</span>
                        <FaTrophy className="mr-2 text-gray-400" />
                        ${typeof inscripcion.costo === 'string' ? parseFloat(inscripcion.costo).toFixed(2) : inscripcion.costo.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-green-900">
                    <span className="px-3 py-1 bg-green-800 text-white rounded-full text-xs font-medium self-center">
                      Inscrito
                    </span>
                    <button
                      onClick={() => handleCancelarInscripcion(inscripcion.id_inscripcion)}
                      disabled={cancelando}
                      className="flex-1 px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaTrash className="text-sm" />
                      Cancelar Inscripción
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaActual === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  Anterior
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                    <button
                      key={numero}
                      onClick={() => setPaginaActual(numero)}
                      className={`px-3 py-2 rounded-lg font-semibold transition ${
                        paginaActual === numero
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {numero}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePaginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default DashboardTorneos;
