import api from './api';

export const obtenerDireccion = async (idDireccion) => {
  const response = await api.get(`/direcciones/${idDireccion}`);
  return response.data;
};

const direccionService = {
  obtenerDireccion,
};

export default direccionService;

