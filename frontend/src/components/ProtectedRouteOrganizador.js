import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRouteOrganizador({ element }) {
  const user = authService.getUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // Verificar que el usuario sea un organizador
  if (user && user.tipo_usuario !== 'organizador') {
    return <Navigate to="/" />;
  }
  
  return element;
}

export default ProtectedRouteOrganizador;
