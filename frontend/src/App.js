import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterJugador from './pages/RegisterJugador';
import RegisterOrganizador from './pages/RegisterOrganizador';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-jugador" element={<RegisterJugador />} />
        <Route path="/register-organizador" element={<RegisterOrganizador />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
