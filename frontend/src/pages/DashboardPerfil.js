import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaCamera, FaTrash } from 'react-icons/fa';
import authService from '../services/authService';
import fotoService from '../services/fotoService';
import jugadorService from '../services/jugadorService';
import organizadorService from '../services/organizadorService';
import direccionService from '../services/direccionService';
import Toast from '../components/Toast';

function DashboardPerfil() {
  const initialUser = authService.getUser();
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(initialUser?.foto_perfil || null);
  const [toast, setToast] = useState(null);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  
  // Detectar si es organizador o jugador
  const isOrganizador = initialUser?.id_organizador;

  const [perfil, setPerfil] = useState({
    nombre: isOrganizador ? (initialUser?.nombre_organizador || 'Organizador') : (initialUser?.nombre || 'Usuario'),
    apellido: isOrganizador ? '' : (initialUser?.apellido || ''),
    email: initialUser?.email || 'user@example.com',
    telefono: initialUser?.telefono || '+34 912 345 678',
    direccion: initialUser?.direccion || '',
    ciudad: initialUser?.ciudad || 'Madrid',
    pais: initialUser?.pais || 'España',
  });

  useEffect(() => {
    // Actualizar user cuando cambie en localStorage
    const usuarioActualizado = authService.getUser();
    setUser(usuarioActualizado);
    setFotoPerfil(usuarioActualizado?.foto_perfil || null);
    // Actualizar también el perfil con los datos nuevos
    if (usuarioActualizado) {
      const esOrganizador = usuarioActualizado?.id_organizador;
      setPerfil({
        nombre: esOrganizador ? (usuarioActualizado.nombre_organizador || 'Organizador') : (usuarioActualizado.nombre || 'Usuario'),
        apellido: esOrganizador ? '' : (usuarioActualizado.apellido || ''),
        email: usuarioActualizado.email || 'user@example.com',
        telefono: usuarioActualizado.telefono || '+34 912 345 678',
        direccion: usuarioActualizado.direccion || '',
        ciudad: usuarioActualizado.ciudad || 'Madrid',
        pais: usuarioActualizado.pais || 'España',
      });
    }
  }, []);

  useEffect(() => {
    // Actualizar los datos del perfil cuando el user se actualiza
    if (user) {
      const esOrganizador = user?.id_organizador;
      setPerfil({
        nombre: esOrganizador ? (user.nombre_organizador || 'Organizador') : (user.nombre || 'Usuario'),
        apellido: esOrganizador ? '' : (user.apellido || ''),
        email: user.email || 'user@example.com',
        telefono: user.telefono || '+34 912 345 678',
        direccion: user.direccion || '',
        ciudad: user.ciudad || 'Madrid',
        pais: user.pais || 'España',
      });
    }
  }, [user]);

  // Cargar información completa de la dirección desde el endpoint
  useEffect(() => {
    if (user?.fk_direccion_id) {
      const cargarDireccion = async () => {
        try {
          const dataDireccion = await direccionService.obtenerDireccion(user.fk_direccion_id);
          setPerfil(prev => ({
            ...prev,
            direccion: dataDireccion.direccion || '',
            ciudad: dataDireccion.ciudad?.nombre_ciudad || 'Madrid',
            pais: dataDireccion.ciudad?.pais?.nombre_pais || 'España',
          }));
        } catch (err) {
          console.error('Error cargando dirección:', err);
        }
      };
      cargarDireccion();
    }
  }, [user?.fk_direccion_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPerfil({ ...perfil, [name]: value });
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setCargandoFoto(true);
        const response = await fotoService.uploadProfilePicture(file);
        
        // Actualizar la foto localmente
        setFotoPerfil(response.foto_url);
        
        // Actualizar el user en authService
        const userActualizado = { ...user, foto_perfil: response.foto_url };
        authService.setUser(userActualizado);
        setUser(userActualizado);
        
        setToast({ message: 'Foto de perfil actualizada exitosamente', type: 'success' });
      } catch (err) {
        setToast({ message: `Error al subir la foto: ${err.message}`, type: 'error' });
        console.error('Error:', err);
      } finally {
        setCargandoFoto(false);
      }
    }
  };

  const handleEliminarFoto = async () => {
    try {
      setCargandoFoto(true);
      await fotoService.deleteProfilePicture();
      
      // Limpiar foto localmente
      setFotoPerfil(null);
      
      // Actualizar el user en authService
      const userActualizado = { ...user, foto_perfil: null };
      authService.setUser(userActualizado);
      setUser(userActualizado);
      
      setToast({ message: 'Foto de perfil eliminada', type: 'success' });
    } catch (err) {
      setToast({ message: `Error al eliminar la foto: ${err.message}`, type: 'error' });
      console.error('Error:', err);
    } finally {
      setCargandoFoto(false);
    }
  };

  const getInitials = () => {
    const nombre = perfil.nombre || 'U';
    const apellido = perfil.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getProfileImage = () => {
    if (fotoPerfil) {
      return fotoPerfil;
    }
    // Si no hay foto, retornamos el avatar con iniciales
    return `https://ui-avatars.com/api/?name=${getInitials()}&background=0D8ABC&color=fff&size=80`;
  };

  const handleSave = async () => {
    try {
      // Datos a enviar al backend
      let datosActualizar = {
        telefono: perfil.telefono,
        direccion: perfil.direccion,
      };
      
      // Agregar nombre/apellido solo si es jugador, o nombre_organizador si es organizador
      if (!isOrganizador) {
        datosActualizar.nombre = perfil.nombre;
        datosActualizar.apellido = perfil.apellido;
        // Actualizar en el backend
        await jugadorService.actualizarJugador(user.id_jugador, datosActualizar);
      } else {
        datosActualizar.nombre_organizador = perfil.nombre;
        // Actualizar en el backend para organizadores
        await organizadorService.actualizarOrganizador(user.id_organizador, datosActualizar);
      }
      
      // Actualizar el usuario con los datos del perfil
      const userActualizado = {
        ...user,
        ...(isOrganizador ? { nombre_organizador: perfil.nombre } : { nombre: perfil.nombre, apellido: perfil.apellido }),
        email: perfil.email,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
        ciudad: perfil.ciudad,
        pais: perfil.pais,
      };
      
      // Guardar en localStorage
      authService.setUser(userActualizado);
      
      // Actualizar el estado local
      setUser(userActualizado);
      
      // Salir del modo edición
      setIsEditing(false);
      
      // Mostrar mensaje de éxito
      setToast({ message: 'Cambios guardados exitosamente', type: 'success' });
    } catch (err) {
      setToast({ message: `Error al guardar cambios: ${err.message}`, type: 'error' });
      console.error('Error:', err);
    }
  };

  return (
    <DashboardLayout title="Mi Perfil">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-2xl w-full animate-fade-in-up">
        {/* Encabezado del Perfil */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Imagen de Perfil con opción de cambiar */}
              <div className="relative">
                <img 
                  src={getProfileImage()} 
                  alt="Perfil" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                {isEditing && (
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    {/* Botón para cambiar foto */}
                    <label className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition disabled:opacity-50" disabled={cargandoFoto}>
                      {cargandoFoto ? '...' : <FaCamera className="text-sm" />}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFotoChange}
                        disabled={cargandoFoto}
                        className="hidden"
                      />
                    </label>
                    
                    {/* Botón para eliminar foto (solo si tiene foto) */}
                    {fotoPerfil && (
                      <button 
                        onClick={handleEliminarFoto}
                        disabled={cargandoFoto}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition disabled:opacity-50"
                        title="Eliminar foto"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{perfil.nombre} {perfil.apellido}</h1>
                <p className="text-gray-600 mt-1">{perfil.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg transition font-semibold"
            >
              <FaEdit className="text-lg" />
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>

          {/* Información Personal */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  {isOrganizador ? 'Nombre de Organizador' : 'Nombre'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre"
                    value={perfil.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.nombre}</p>
                )}
              </div>

              {/* Apellido (solo para jugadores) */}
              {!isOrganizador && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="apellido"
                      value={perfil.apellido}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900">{perfil.apellido}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Correo Electrónico
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={perfil.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={perfil.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.telefono}</p>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Dirección
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="direccion"
                    value={perfil.direccion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.direccion || 'No especificada'}</p>
                )}
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Ciudad
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ciudad"
                    value={perfil.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.ciudad}</p>
                )}
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  País
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pais"
                    value={perfil.pais}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.pais}</p>
                )}
              </div>
            </div>

            {/* Botón Guardar */}
            {isEditing && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg transition font-semibold"
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Miembro desde */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Miembro desde</h3>
          <p className="text-gray-700">{new Date(user?.fecha_creacion).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default DashboardPerfil;
