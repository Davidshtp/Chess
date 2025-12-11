import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { FaHome, FaTrophy, FaUser, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { GiChessKing } from 'react-icons/gi';

function DashboardLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();

  const isOrganizador = () => user?.id_organizador;
  const perfilPath = isOrganizador() ? '/dashboard-organizador/perfil' : '/dashboard-jugador/perfil';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navButtonClass = (path) => {
    const baseClass = "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition nav-item";
    const activeClass = isActive(path) 
      ? "bg-gray-100 text-gray-900 active-nav" 
      : "text-gray-600 hover:bg-gray-100";
    return `${baseClass} ${activeClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fijo */}
      <aside className="w-56 bg-white border-r border-gray-200 shadow-sm fixed h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GiChessKing className="text-2xl text-gray-900" />
            <span className="font-bold text-lg text-gray-900">ChessHub</span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {isOrganizador() ? (
            // Menú para Organizadores
            <>
              <button 
                onClick={() => navigate('/dashboard-organizador')}
                className={navButtonClass('/dashboard-organizador')}>
                <FaHome className="text-lg text-black" />
                <span>Inicio</span>
              </button>

              <button 
                onClick={() => navigate('/dashboard-organizador/inscripciones')}
                className={navButtonClass('/dashboard-organizador/inscripciones')}>
                <FaUsers className="text-lg text-black" />
                <span>Inscripciones</span>
              </button>

              <button 
                onClick={() => navigate(perfilPath)}
                className={navButtonClass(perfilPath)}>
                <FaUser className="text-lg text-black" />
                <span>Mi Perfil</span>
              </button>
            </>
          ) : (
            // Menú para Jugadores
            <>
              <button 
                onClick={() => navigate('/dashboard-jugador')}
                className={navButtonClass('/dashboard-jugador')}>
                <FaHome className="text-lg text-black" />
                <span>Inicio</span>
              </button>

              <button 
                onClick={() => navigate('/dashboard-jugador/torneos')}
                className={navButtonClass('/dashboard-jugador/torneos')}>
                <FaTrophy className="text-lg text-black" />
                <span>Torneos</span>
              </button>

              <button 
                onClick={() => navigate(perfilPath)}
                className={navButtonClass(perfilPath)}>
                <FaUser className="text-lg text-black" />
                <span>Mi Perfil</span>
              </button>
            </>
          )}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="logout-button w-full flex items-center space-x-3 px-4 py-3 text-black rounded-lg transition font-medium"
          >
            <FaSignOutAlt className="text-lg text-black" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 ml-56 flex flex-col">
        {/* Header Fijo */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900 title-animated">{title || 'Panel de Control'}</h1>
          </div>
        </header>

        {/* Contenido Variable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
