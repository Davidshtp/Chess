import { Link } from 'react-router-dom';
function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navegación */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl text-black">♔</span>
            <h1 className="text-2xl font-bold text-black">Chess Tournament</h1>
          </div>
          <div className="space-x-4 flex items-center">
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition"
              >
                Iniciar sesión
              </Link>
            </>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contenido Izquierdo */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  La plataforma de ajedrez más moderna
                </h2>
                <p className="text-xl text-gray-600">
                  Organiza torneos profesionales, compite con jugadores de todo el mundo y sigue tu progreso en tiempo real.
                </p>
              </div>
              <div className="space-y-4 pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register-jugador"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md text-center"
                  >
                    ♟ Registrate como Jugador
                  </Link>
                  <Link
                    to="/register-organizador"
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-md text-center"
                  >
                    ♛ Registrate como Organizador
                  </Link>
                </div>
              </div>
              <div className="pt-8 grid grid-cols-3 gap-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-black">500+</div>
                  <p className="text-gray-600 text-sm">Torneos Activos</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-black">10K+</div>
                  <p className="text-gray-600 text-sm">Jugadores</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-black">50+</div>
                  <p className="text-gray-600 text-sm">Países</p>
                </div>
              </div>
            </div>

            {/* Tarjeta Derecha */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-white border border-gray-700">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-white bg-opacity-10 rounded-lg mb-4">
                    <span className="text-5xl">♔</span>
                  </div>
                  <h3 className="text-2xl font-bold">Comienza Hoy</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: '✓', text: 'Únete gratis a la comunidad' },
                    { icon: '✓', text: 'Acceso a torneos en vivo' },
                    { icon: '✓', text: 'Estadísticas detalladas' },
                    { icon: '✓', text: 'Comunidad global' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <span className="text-green-400 font-bold text-lg">{item.icon}</span>
                      <span className="text-gray-200">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            ¿Por qué elegir Chess Tournament?
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            La plataforma completa para organizar, participar y mejorar en torneos de ajedrez
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-black">
            {[
              {
                icon: '♛',
                title: 'Organiza Torneos',
                desc: 'Crea torneos profesionales con herramientas avanzadas de gestión',
              },
              {
                icon: '♟',
                title: 'Compite Globalmente',
                desc: 'Participa en torneos con jugadores de todo el mundo',
              },
              {
                icon: '♔',
                title: 'Estadísticas Pro',
                desc: 'Analiza tu desempeño con estadísticas detalladas y rankings',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar tu viaje en el ajedrez?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Únete a miles de jugadores que ya están compitiendo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register-jugador"
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg"
            >
              Soy Jugador
            </Link>
            <Link
              to="/register-organizador"
              className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-lg"
            >
              Soy Organizador
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Sobre Nosotros</h4>
              <p className="text-gray-600 text-sm">La plataforma moderna para torneos de ajedrez</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><button className="hover:text-gray-900 transition cursor-pointer bg-none border-none p-0">Características</button></li>
                <li><button className="hover:text-gray-900 transition cursor-pointer bg-none border-none p-0">Precios</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><button className="hover:text-gray-900 transition cursor-pointer bg-none border-none p-0">Privacidad</button></li>
                <li><button className="hover:text-gray-900 transition cursor-pointer bg-none border-none p-0">Términos</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Comunidad</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><button className="hover:text-gray-900 transition cursor-pointer bg-none border-none p-0">Blog</button></li>
                <li><button className="hover:text-gray-900 transition cursor-pointer bg-none border-none p-0">Soporte</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Chess Tournament. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
