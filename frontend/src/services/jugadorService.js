import api from './api';

export const actualizarJugador = async (idJugador, datosJugador) => {
  const response = await api.put(`/jugadores/${idJugador}`, datosJugador);
  return response.data;
};

export default {
  actualizarJugador,
};
