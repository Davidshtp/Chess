import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ element }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return element;
}

export default ProtectedRoute;
