'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [userName, setUserName] = useState<string>('');
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMaxLoyaltyOpen, setIsMaxLoyaltyOpen] = useState(false);
  const [isMaxPayOpen, setIsMaxPayOpen] = useState(false);
  const [isGeneralesOpen, setIsGeneralesOpen] = useState(false);
  const [isConfiguracionesOpen, setIsConfiguracionesOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/session', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  };

  useEffect(() => {
    const updateUserName = async () => {
      const session = await fetchSession();
      if (session && session.nombre) {
        setUserName(session.nombre);
      } else {
        setUserName('');
      }
    };

    updateUserName();
    const interval = setInterval(updateUserName, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine which section should be open based on the current route
  useEffect(() => {
    setIsMaxLoyaltyOpen(
      pathname.startsWith('/transacciones') ||
      pathname.startsWith('/puntos') ||
      pathname.startsWith('/redimir') ||
      pathname.startsWith('/reportes')
    );
    setIsMaxPayOpen(false); // No child routes defined yet
    setIsGeneralesOpen(
      pathname.startsWith('/clientes') ||
      pathname.startsWith('/tarjetas') ||
      pathname.startsWith('/canales') ||
      pathname.startsWith('/empresas') ||
      pathname.startsWith('/centro_de_costos') ||
      pathname.startsWith('/paises') ||
      pathname.startsWith('/estados') ||
      pathname.startsWith('/sub_canales') ||
      pathname.startsWith('/monedas')
    );
    setIsConfiguracionesOpen(
      pathname.startsWith('/terminales') ||
      pathname.startsWith('/usuarios') ||
      pathname.startsWith('/miembros') ||
      pathname.startsWith('/tipo_de_tarjetas') ||
      pathname.startsWith('/descuentos') ||
      pathname.startsWith('/precios_semana') ||
      pathname.startsWith('/tipo_combustible') ||
      pathname.startsWith('/unidad_medida')
      
    );
  }, [pathname]);

  const handleMaxLoyaltyClick = () => {
    setIsMaxLoyaltyOpen(!isMaxLoyaltyOpen);
  };

  const handleMaxPayClick = () => {
    setIsMaxPayOpen(!isMaxPayOpen);
  };

  const handleGeneralesClick = () => {
    setIsGeneralesOpen(!isGeneralesOpen);
  };

  const handleConfiguracionesClick = () => {
    setIsConfiguracionesOpen(!isConfiguracionesOpen);
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        setIsLogoutModalOpen(false);
        router.push('/login');
      } else {
        alert('Error al cerrar sesión. Intenta de nuevo.');
      }
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor.');
    }
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className={`relative flex transition-all duration-500 ease-in-out ${isNavbarVisible ? 'pl-64' : 'pl-0'}`}>
      <nav
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-500 ease-in-out ${
          isNavbarVisible ? 'w-64 p-4' : 'w-0 p-0'
        }`}
      >
        <Link href="/inicio">
          <Image src="/images/logo-max-loyalty-white.png" alt="Logo" width={250} height={250} />
        </Link>
        <div className="mt-4 h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleMaxLoyaltyClick}
                className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
              >
                Max-Loyalty
                <ChevronDown className={`w-5 h-5 transition-transform ${isMaxLoyaltyOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMaxLoyaltyOpen && (
                <ul className="ml-4 space-y-2">
                  <li>
                    <Link
                      href="/transacciones"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/transacciones' ? 'active-subitem' : ''
                      }`}
                    >
                      Transacciones
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/puntos"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/puntos' ? 'active-subitem' : ''
                      }`}
                    >
                      Puntos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/redimir"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/redimir' ? 'active-subitem' : ''
                      }`}
                    >
                      Canjeados
                    </Link>
                  </li>
               
                  <li>
                    <Link
                      href="/reportes"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/reportes' ? 'active-subitem' : ''
                      }`}
                    >
                      Reportes
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <button
                onClick={handleMaxPayClick}
                className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
                hidden
              >
                Max-Pay
                <ChevronDown className={`w-5 h-5 transition-transform ${isMaxPayOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMaxPayOpen && (
                <ul className="ml-4 space-y-2">
                  {/* Agrega rutas de Max-Pay si es necesario */}
                </ul>
              )}
            </li>
            <li>
              <button
                onClick={handleGeneralesClick}
                className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
              >
                Generales
                <ChevronDown className={`w-5 h-5 transition-transform ${isGeneralesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGeneralesOpen && (
                <ul className="ml-4 space-y-2">
                  <li>
                    <Link
                      href="/clientes"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/clientes' ? 'active-subitem' : ''
                      }`}
                    >
                      Clientes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tarjetas"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/tarjetas' ? 'active-subitem' : ''
                      }`}
                    >
                      Tarjetas
                    </Link>
                  </li>
                
                  <li>
                    <Link
                      href="/canales"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/canales' ? 'active-subitem' : ''
                      }`}
                    >
                      Canales
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sub_canales"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/sub_canales' ? 'active-subitem' : ''
                      }`}
                    >
                      Subcanales
                    </Link>
                  </li>


                  <li>
                    <Link
                      href="/empresas"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/empresas' ? 'active-subitem' : ''
                      }`}
                    >
                      Red de empresas
                    </Link>
                  </li>

                  
                  <li>
                    <Link
                      href="/centro_de_costos"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/centro_de_costos' ? 'active-subitem' : ''
                      }`}
                    >
                      Establecimientos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/paises"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/paises' ? 'active-subitem' : ''
                      }`}
                    >
                      Paises
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/estados"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/estados' ? 'active-subitem' : ''
                      }`}
                    >
                      Estados
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/monedas"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/monedas' ? 'active-subitem' : ''
                      }`}
                    >
                      Monedas
                    </Link>
                  </li>

                </ul>
              )}
            </li>
            <li>
              <button
                onClick={handleConfiguracionesClick}
                className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
              >
                Configuraciones
                <ChevronDown className={`w-5 h-5 transition-transform ${isConfiguracionesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isConfiguracionesOpen && (
                <ul className="ml-4 space-y-2">
                  <li>
                    <Link
                      href="/terminales"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/terminales' ? 'active-subitem' : ''
                      }`}
                    >
                      Terminales
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/usuarios"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/usuarios' ? 'active-subitem' : ''
                      }`}
                    >
                      Usuarios
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/miembros"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/miembros' ? 'active-subitem' : ''
                      }`}
                    >
                      Usuarios de terminales
                    </Link>
                  </li>

                    <li>
                    <Link
                      href="/tipo_de_tarjetas"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/tipo_de_tarjetas' ? 'active-subitem' : ''
                      }`}
                    >
                      Tipos de tarjetas
                    </Link>
                  </li>


                   <li>
                    <Link
                      href="/tipo_combustible"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/tipo_combustible' ? 'active-subitem' : ''
                      }`}
                    >
                      Tipo de combustible
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/unidad_medida"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/unidad_medida' ? 'active-subitem' : ''
                      }`}
                    >
                      Unidad medida del producto
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/precios_semana"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/precios_semana' ? 'active-subitem' : ''
                      }`}
                    >
                      Precios de la semana
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/descuentos"
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        pathname === '/descuentos' ? 'active-subitem' : ''
                      }`}
                    >
                      Descuentos
                    </Link>
                  </li>

                </ul>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <button
        onClick={toggleNavbar}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center space-x-2"
      >
        {isNavbarVisible ? (
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </div>
        ) : (
          <>
            <span>Menú</span>
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleUserMenu}
          className="flex items-center space-x-2 text-gray-800 hover:text-gray-600"
        >
          <span>Bienvenido: {userName || 'Invitado'}</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
            <ul className="py-2">
              <li>
                <Link
                  href="/cuenta"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Mi cuenta
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelLogout();
            }
          }}
        >
          <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-11/12 sm:w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-900">
              Confirmar Cierre de Sesión
            </h2>
            <p className="text-center mb-4 text-gray-700">
              ¿Estás seguro de que deseas cerrar sesión?
            </p>
            <div className="flex justify-between space-x-2">
              <button
                onClick={cancelLogout}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 w-full"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }

        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }

        /* Default style for submenu items */
        .block {
          color: white;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        /* Style for active submenu item */
        .active-subitem {
          background-color: #4B5EAA; /* A distinct blue shade */
          color: white;
          font-weight: 500;
        }

        /* Hover effect for active submenu item */
        .active-subitem:hover {
          background-color: #6B7280; /* Slightly lighter gray on hover */
          color: white;
        }

        /* Ensure non-active items keep their hover effect */
        .block:hover {
          background-color: #4B5563; /* Same as hover:bg-gray-700 */
        }
      `}</style>
    </div>
  );
}