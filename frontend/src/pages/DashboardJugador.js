import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { FaTrophy, FaChessKnight, FaMapMarkerAlt, FaCalendar, FaUser, FaDollarSign } from 'react-icons/fa';
import { MdEmojiEvents } from 'react-icons/md';
import DashboardLayout from '../layouts/DashboardLayout';
import torneoService from '../services/torneoService';
import inscripcionService from '../services/inscripcionService';
import PaymentModal from '../components/PaymentModal';
import Toast from '../components/Toast';

function DashboardJugador() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ idTorneo: null, costo: 0 });
  const [toast, setToast] = useState(null);
  const [misinscripciones, setMisInscripciones] = useState(0);
  const user = authService.getUser();

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        setLoading(true);
        const data = await torneoService.getTorneosDisponibles(user?.id_jugador);
        
        // Filtrar solo torneos con fechas futuras
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const torneosFuturos = data.filter(torneo => {
          const fechaTorneo = new Date(torneo.fecha_torneo);
          return fechaTorneo >= hoy;
        });
        
        // Ordenar por fecha más próxima primero
        const torneosOrdenados = torneosFuturos.sort((a, b) => {
          const fechaA = new Date(a.fecha_torneo);
          const fechaB = new Date(b.fecha_torneo);
          return fechaA - fechaB;
        });
        
        setTorneos(torneosOrdenados);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchInscripciones = async () => {
      try {
        if (user?.id_jugador) {
          const inscripciones = await inscripcionService.getInscripcionesJugador(user.id_jugador);
          setMisInscripciones(inscripciones.length || 0);
        }
      } catch (err) {
        console.error('Error al obtener inscripciones:', err);
      }
    };

    if (user?.id_jugador) {
      fetchTorneos();
      fetchInscripciones();
    }
  }, [user?.id_jugador]);

  const handleAbrirModal = (idTorneoOrganizador, costo) => {
    setModalData({ idTorneo: idTorneoOrganizador, costo });
    setModalOpen(true);
  };

  const handleConfirmarPago = async (metodoPago) => {
    try {
      setInscribiendo(modalData.idTorneo);
      
      if (!user || !user.id_jugador) {
        throw new Error('No se encontró información del jugador');
      }

      await inscripcionService.inscribirseEnTorneo(
        user.id_jugador,
        modalData.idTorneo,
        metodoPago
      );
      
      // Remover el torneo de la lista local
      setTorneos(torneos.filter(torneo => torneo.id_torneo_organizador !== modalData.idTorneo));
      
      // Incrementar contador de inscripciones
      setMisInscripciones(misinscripciones + 1);
      
      setModalOpen(false);
      setToast({ message: '¡Inscripción exitosa! Ya estás registrado en el torneo', type: 'success' });
    } catch (err) {
      // Manejo específico de errores
      if (err.response?.status === 409) {
        setToast({ message: 'Ya estás inscrito en este torneo', type: 'warning' });
      } else if (err.response?.status === 400) {
        setToast({ message: 'No puedes inscribirse en este torneo', type: 'error' });
      } else {
        setToast({ message: `Error al inscribirse: ${err.message}`, type: 'error' });
      }
      console.error('Error:', err);
    } finally {
      setInscribiendo(null);
    }
  };

  const handleCancelarModal = () => {
    setModalOpen(false);
    setInscribiendo(null);
  };

  return (
    <DashboardLayout title="Panel de Control">
      {/* Tarjetas de Estadísticas del Jugador */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Estadísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Mis Inscripciones</p>
                <p className="text-3xl font-bold text-gray-900">{misinscripciones}</p>
              </div>
              <FaChessKnight className="text-5xl text-black" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Partidas Jugadas</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <MdEmojiEvents className="text-5xl text-black" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Victorias</p>
                <p className="text-3xl font-bold text-gray-900">15</p>
              </div>
              <FaTrophy className="text-5xl text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Torneos Disponibles */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Torneos Disponibles</h2>
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
            <p className="text-gray-600">No hay torneos disponibles en este momento</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {torneos.map((torneo) => (
            <div key={torneo.id_torneo_organizador} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{torneo.torneo.nombre_torneo}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <FaUser className="mr-2" />
                    {torneo.organizador.nombre_organizador}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Disponible
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
                  {torneo.inscripciones_count} Jugadores Inscritos
                </p>
                <p className="flex items-center">
                  <FaDollarSign className="mr-2 text-gray-400" />
                  ${typeof torneo.costo === 'string' ? parseFloat(torneo.costo).toFixed(2) : torneo.costo.toFixed(2)}
                </p>
              </div>

              <button 
                onClick={() => handleAbrirModal(torneo.id_torneo_organizador, torneo.costo)}
                disabled={inscribiendo === torneo.id_torneo_organizador}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-semibold"
              >
                {inscribiendo === torneo.id_torneo_organizador ? 'Inscribiendo...' : 'Inscribirse'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de pago */}
      <PaymentModal 
        isOpen={modalOpen}
        costo={modalData.costo}
        onConfirm={handleConfirmarPago}
        onCancel={handleCancelarModal}
        loading={inscribiendo !== null}
      />
      
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

export default DashboardJugador;
