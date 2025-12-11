import api from './api';

/**
 * Obtiene la lista de torneos disponibles (filtra los que el jugador ya está inscrito)
 */
export const getTorneosDisponibles = async (idJugador) => {
  try {
    const response = await api.get(`/torneos-organizadores/?jugador_id=${idJugador}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching torneos:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un torneo específico
 */
export const getTorneoDetalle = async (idTorneoOrganizador) => {
  try {
    const response = await api.get(`/torneos-organizadores/${idTorneoOrganizador}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching torneo detalle:', error);
    throw error;
  }
};

/**
 * Obtiene los jugadores inscritos en un torneo
 */
export const getJugadoresInscritos = async (idTorneoOrganizador) => {
  try {
    const response = await api.get(`/torneos-organizadores/${idTorneoOrganizador}/jugadores-inscritos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching jugadores inscritos:', error);
    throw error;
  }
};

/**
 * Obtiene los torneos organizados por un organizador
 */
export const getTorneosOrganizador = async (idOrganizador) => {
  try {
    const response = await api.get(`/torneos-organizadores/?organizador_id=${idOrganizador}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching torneos organizador:', error);
    throw error;
  }
};

/**
 * Elimina un torneo
 */
export const eliminarTorneo = async (idTorneoOrganizador) => {
  try {
    const response = await api.delete(`/torneos-organizadores/${idTorneoOrganizador}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting torneo:', error);
    throw error;
  }
};

/**
 * Crea un nuevo torneo del organizador
 */
export const crearTorneo = async (torneoData) => {
  try {
    const response = await api.post('/torneos-organizadores/', torneoData);
    return response.data;
  } catch (error) {
    console.error('Error creating torneo:', error);
    throw error;
  }
};

/**
 * Actualiza un torneo existente
 */
export const actualizarTorneo = async (idTorneoOrganizador, torneoData) => {
  try {
    const response = await api.put(`/torneos-organizadores/${idTorneoOrganizador}`, torneoData);
    return response.data;
  } catch (error) {
    console.error('Error updating torneo:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de torneos base disponibles
 */
export const getTorneosBase = async () => {
  try {
    const response = await api.get('/torneos/');
    return response.data;
  } catch (error) {
    console.error('Error fetching torneos base:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de países
 */
export const getPaises = async () => {
  try {
    const response = await api.get('/paises/');
    return response.data;
  } catch (error) {
    console.error('Error fetching paises:', error);
    throw error;
  }
};

/**
 * Obtiene las ciudades de un país específico
 */
export const getCiudadesPorPais = async (idPais) => {
  try {
    const response = await api.get(`/ciudades/pais/${idPais}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ciudades:', error);
    throw error;
  }
};

export default {
  getTorneosDisponibles,
  getTorneoDetalle,
  getJugadoresInscritos,
  getTorneosOrganizador,
  eliminarTorneo,
  crearTorneo,
  actualizarTorneo,
  getTorneosBase,
  getPaises,
  getCiudadesPorPais,
};
