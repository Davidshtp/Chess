import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterJugador from './pages/RegisterJugador';
import RegisterOrganizador from './pages/RegisterOrganizador';
import Home from './pages/Home';
import DashboardJugador from './pages/DashboardJugador';
import DashboardTorneos from './pages/DashboardTorneos';
import DashboardPerfil from './pages/DashboardPerfil';
import DashboardOrganizador from './pages/DashboardOrganizador';
import TorneoInscripciones from './pages/TorneoInscripciones';
import ProtectedRouteJugador from './components/ProtectedRouteJugador';
import ProtectedRouteOrganizador from './components/ProtectedRouteOrganizador';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-jugador" element={<RegisterJugador />} />
        <Route path="/register-organizador" element={<RegisterOrganizador />} />
        {/* Rutas Jugador */}
        <Route path="/dashboard-jugador" element={<ProtectedRouteJugador element={<DashboardJugador />} />} />
        <Route path="/dashboard-jugador/torneos" element={<ProtectedRouteJugador element={<DashboardTorneos />} />} />
        <Route path="/dashboard-jugador/perfil" element={<ProtectedRoute element={<DashboardPerfil />} />} />
        {/* Rutas Organizador */}
        <Route path="/dashboard-organizador" element={<ProtectedRouteOrganizador element={<DashboardOrganizador />} />} />
        <Route path="/dashboard-organizador/inscripciones" element={<ProtectedRouteOrganizador element={<TorneoInscripciones />} />} />
        <Route path="/dashboard-organizador/perfil" element={<ProtectedRoute element={<DashboardPerfil />} />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
