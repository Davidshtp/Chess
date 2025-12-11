import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRouteJugador({ element }) {
  const user = authService.getUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // Verificar que el usuario sea un jugador
  if (user && user.tipo_usuario !== 'jugador') {
    return <Navigate to="/" />;
  }
  
  return element;
}

export default ProtectedRouteJugador;
