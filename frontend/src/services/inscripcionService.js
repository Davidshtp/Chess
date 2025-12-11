import api from './api';

/**
 * Inscribe un jugador en un torneo
 */
export const inscribirseEnTorneo = async (idJugador, idTorneoOrganizador, medioPago = 'Tarjeta') => {
  try {
    const response = await api.post(`/inscripciones/${idJugador}`, {
      fk_torneo_organizador_id: idTorneoOrganizador,
      medio_pago: medioPago,
    });
    return response.data;
  } catch (error) {
    console.error('Error inscribing in tournament:', error);
    throw error;
  }
};

/**
 * Obtiene las inscripciones de un jugador
 */
export const getInscripcionesJugador = async (idJugador) => {
  try {
    const response = await api.get(`/inscripciones/${idJugador}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inscripciones:', error);
    throw error;
  }
};

/**
 * Cancela la inscripción de un jugador en un torneo
 */
export const cancelarInscripcion = async (idInscripcion) => {
  try {
    const response = await api.delete(`/inscripciones/${idInscripcion}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling inscription:', error);
    throw error;
  }
};

const inscripcionService = {
  inscribirseEnTorneo,
  getInscripcionesJugador,
  cancelarInscripcion,
};

export default inscripcionService;

