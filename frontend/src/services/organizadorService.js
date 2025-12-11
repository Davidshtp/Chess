import api from './api';

export const actualizarOrganizador = async (idOrganizador, datosOrganizador) => {
  const response = await api.put(`/organizadores/${idOrganizador}`, datosOrganizador);
  return response.data;
};

const organizadorService = {
  actualizarOrganizador,
};

export default organizadorService;

