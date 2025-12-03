import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        contraseña,
      });

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      if (response.data.usuario.tipo_usuario === 'jugador') {
        navigate('/dashboard-jugador');
      } else {
        navigate('/dashboard-organizador');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Lado izquierdo - Imagen del tablero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Tablero de ajedrez */}
          <div className="mb-4">
            <img 
              src="/chessboard.svg" 
              alt="Chessboard" 
              className="w-full drop-shadow-lg"
            />
          </div>

          {/* Texto descriptivo */}
          <div className="text-center">
            <h3 className="text-base font-bold text-black mb-2">MASTERMIND CHESS TOURNAMENT</h3>
            <p className="text-gray-600 text-xs leading-relaxed font-light">
              Únete a la plataforma más moderna para organizar y participar en torneos de ajedrez.
            </p>
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>+1 234 567 8900</p>
              <p>123 Chess Street, City Name, 1234</p>
              <p className="font-semibold">WWW.WEBSITE.COM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-7 hover:scale-105 transition-transform duration-300" onClick={()=>{navigate('/')}}>
            <h1 className="text-5xl font-bold text-black mb-2">♔</h1>
            <h2 className="text-4xl font-bold text-gray-900 mb-1">Chess</h2>
            <p className="text-gray-600 text-sm">Torneos de Ajedrez</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm text-gray-900 bg-white"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="contraseña" className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm text-gray-900 bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition duration-200 text-sm mt-2"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Separador */}
          <div className="my-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">¿No tienes cuenta?</span>
            </div>
          </div>

          {/* Links de registro */}
          <div className="space-y-2.5">
            <Link
              to="/register-jugador"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 text-sm"
            >
              ♟ Registrate como Jugador
            </Link>
            <Link
              to="/register-organizador"
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 text-sm"
            >
              ♛ Registrate como Organizador
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-4">
            Al continuar, aceptas nuestros Términos de Servicio
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
