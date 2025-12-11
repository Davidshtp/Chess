import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUsers, FaDollarSign, FaChess } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import torneoService from '../services/torneoService';
import authService from '../services/authService';
import Toast from '../components/Toast';

const TorneoInscripciones = () => {
  const [torneos, setTorneos] = useState([]);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [jugadoresInscritos, setJugadoresInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const user = authService.getUser();

  useEffect(() => {
  }, [user]);

  // Cargar torneos del organizador
  useEffect(() => {
    const obtenerTorneos = async () => {
      try {
        setLoading(true);
        const data = await torneoService.getTorneosOrganizador(user?.id_organizador);
        setTorneos(data || []);
      } catch (error) {
        console.error('Error al cargar torneos:', error);
        setToast({
          message: 'Error al cargar los torneos',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id_organizador) {
      obtenerTorneos();
    }
  }, [user?.id_organizador]);

  // Cargar jugadores inscritos cuando se selecciona un torneo
  useEffect(() => {
    if (selectedTorneo) {
      const obtenerJugadores = async () => {
        try {
          const data = await torneoService.getJugadoresInscritos(selectedTorneo.id_torneo_organizador);
          setJugadoresInscritos(data || []);
        } catch (error) {
          setToast({
            message: 'Error al cargar los jugadores inscritos',
            type: 'error'
          });
          setJugadoresInscritos([]);
        }
      };

      obtenerJugadores();
    }
  }, [selectedTorneo]);

  // Calcular ingresos totales del torneo seleccionado
  const calcularIngresosTorneo = () => {
    if (!selectedTorneo) return 0;
    return selectedTorneo.costo * (jugadoresInscritos.length || 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Cargando torneos...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {!selectedTorneo ? (
          // Vista de lista de torneos
          <>
            <h1 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
              <FaChess /> Mis Torneos - Inscripciones
            </h1>

            {torneos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FaChess className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No tienes torneos registrados aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {torneos.map((torneo) => {
                  const ingresos = torneo.costo * (torneo.inscripciones_count || 0);
                  return (
                    <div
                      key={torneo.id_torneo_organizador}
                      onClick={() => setSelectedTorneo(torneo)}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow p-6 border-l-4 border-green-800"
                    >
                      <h2 className="text-xl font-bold text-black mb-2">{torneo.torneo?.nombre_torneo || 'Sin nombre'}</h2>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <p><strong>Fecha:</strong> {new Date(torneo.fecha_torneo).toLocaleDateString()}</p>
                        <p><strong>Ciudad:</strong> {torneo.ciudad_nombre || 'No especificada'}</p>
                        <p><strong>Costo:</strong> ${torneo.costo}</p>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 font-semibold">
                          <FaUsers />
                          <span>{torneo.inscripciones_count || 0} inscritos</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-900 font-semibold">
                          <FaDollarSign />
                          <span>${ingresos}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // Vista de detalle del torneo
          <>
            <button
              onClick={() => {
                setSelectedTorneo(null);
                setJugadoresInscritos([]);
              }}
              className="flex items-center gap-2 text-green-900 hover:text-green-900 mb-6 font-semibold"
            >
              <FaArrowLeft /> Volver a Torneos
            </button>

            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h1 className="text-3xl font-bold text-black mb-2">
                {selectedTorneo.torneo?.nombre_torneo || 'Sin nombre'}
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">FECHA</p>
                  <p className="font-semibold text-black">
                    {new Date(selectedTorneo.fecha_torneo).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">CIUDAD</p>
                  <p className="font-semibold text-black">{selectedTorneo.ciudad_nombre || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">COSTO POR INSCRIPCIÓN</p>
                  <p className="font-semibold text-black">${selectedTorneo.costo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">TOTAL RECAUDADO</p>
                  <p className="font-semibold text-green-900 text-lg">${calcularIngresosTorneo()}</p>
                </div>
              </div>

              <div className="flex gap-4 text-lg">
                <div className="flex items-center gap-2 text-green-900 font-bold">
                  <FaUsers className="text-2xl" />
                  <span>{jugadoresInscritos.length} Jugadores Inscritos</span>
                </div>
              </div>
            </div>

            {jugadoresInscritos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No hay jugadores inscritos en este torneo</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-black">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-black">Correo</th>
                      <th className="px-4 py-3 text-center font-semibold text-black">Teléfono</th>
                      <th className="px-4 py-3 text-center font-semibold text-black">Fecha Inscripción</th>
                      <th className="px-4 py-3 text-center font-semibold text-black">Medio de Pago</th>
                      <th className="px-4 py-3 text-center font-semibold text-black">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold text-black">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadoresInscritos.map((jugador, index) => {
                      const fechaInscripcion = jugador.fecha_inscripcion 
                        ? new Date(jugador.fecha_inscripcion).toLocaleDateString()
                        : 'N/A';
                      
                      const estatusBadgeClass = jugador.estado_pago === 'Pagado'
                        ? 'bg-green-100 text-green-800'
                        : jugador.estado_pago === 'Pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800';
                      
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-black font-semibold">
                            {jugador.nombre_usuario || 'Sin nombre'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {jugador.correo_usuario || 'Sin correo'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            {jugador.telefono_usuario || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            {fechaInscripcion}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              {jugador.medio_pago}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${estatusBadgeClass}`}>
                              {jugador.estado_pago}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-green-900">
                              ${jugador.monto}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TorneoInscripciones;
