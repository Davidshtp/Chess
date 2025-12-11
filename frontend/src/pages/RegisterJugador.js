import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import fondo from '../assets/images/fondo2.jpg';

function RegisterJugador() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    contraseña: '',
    contraseñaConfirm: '',
    nombre: '',
    apellido: '',
    telefono: '',
    pais: '',
    ciudad: '',
    direccion: '',
  });

  // Cargar países
  useEffect(() => {
    const cargarPaises = async () => {
      try {
        const response = await api.get('/paises');
        setPaises(response.data);
      } catch (err) {
        console.error('Error al cargar países:', err);
      }
    };
    cargarPaises();
  }, []);

  // Cargar ciudades cuando cambia el país
  useEffect(() => {
    if (formData.pais) {
      const cargarCiudades = async () => {
        try {
          const response = await api.get(`/ciudades/pais/${formData.pais}`);
          setCiudades(response.data);
          setFormData((prev) => ({ ...prev, ciudad: '' }));
        } catch (err) {
          console.error('Error al cargar ciudades:', err);
        }
      };
      cargarCiudades();
    }
  }, [formData.pais]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.contraseña !== formData.contraseñaConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // Crear dirección primero
      const direccionResponse = await api.post('/direcciones', {
        direccion: formData.direccion,
        fk_ciudad_id: parseInt(formData.ciudad),
      });

      // Registrar jugador (crea usuario + jugador)
      await api.post('/jugadores/registrar', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email,
        contraseña: formData.contraseña,
        fk_direccion_id: direccionResponse.data.id_direccion,
      });

      // Redirigir al login
      navigate('/login', {
        state: { message: 'Registro exitoso. Por favor inicia sesión.' },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Error al registrar jugador'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Columna Izquierda - Imagen de Ajedrez Real */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-8 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.6) 100%), url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a1a2e'
        }}
      >
        {/* Texto minimalista superpuesto */}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl mb-6 drop-shadow-lg">♟</h1>
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg leading-tight">Únete como Jugador</h2>
          <p className="text-lg max-w-sm opacity-95 leading-relaxed drop-shadow-md">
            Accede a torneos competitivos, mejora tu ELO y compite globalmente
          </p>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header Mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-5xl mb-3">♟</h1>
            <h2 className="text-3xl font-bold text-gray-900">Registro Jugador</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Fila 1: Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="nombre" className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-xs font-semibold text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-xs font-semibold text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                required
              />
            </div>

            {/* Fila 2: País y Ciudad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pais" className="block text-xs font-semibold text-gray-700 mb-1">
                  País
                </label>
                <select
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                  required
                >
                  <option value="">País</option>
                  {paises.map((pais) => (
                    <option key={pais.id_pais} value={pais.id_pais}>
                      {pais.nombre_pais}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ciudad" className="block text-xs font-semibold text-gray-700 mb-1">
                  Ciudad
                </label>
                <select
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                  required
                  disabled={!formData.pais}
                >
                  <option value="">Ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                      {ciudad.nombre_ciudad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-xs font-semibold text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                required
              />
            </div>

            {/* Contraseña y Confirmar */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contraseña" className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="contraseña"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                  minLength="6"
                  required
                />
              </div>
              <div>
                <label htmlFor="contraseñaConfirm" className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirmar
                </label>
                <input
                  type="password"
                  id="contraseñaConfirm"
                  name="contraseñaConfirm"
                  value={formData.contraseñaConfirm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                  minLength="6"
                  required
                />
              </div>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition text-sm mt-2"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center space-y-2">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-800 hover:text-blue-900 font-semibold">
                Inicia sesión
              </Link>
            </p>
            <p className="text-gray-600 text-sm">
              ¿Eres organizador?{' '}
              <Link to="/register-organizador" className="text-green-800 hover:text-green-900 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterJugador;