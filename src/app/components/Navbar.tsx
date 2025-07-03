'use client';
 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
 
interface Permiso {
  id: number;
  usuario_id: number;
  ruta: string;
  permitido: boolean;
}
 
interface Session {
  id: number;
  nombre: string;
  email: string;
  num_telefono: string;
  img: string;
  admin: boolean;
}
 
 
const rutasDisponibles = [
  { path: '/canales', nombre: 'Canales' },
  { path: '/centro_costos', nombre: 'Centros de Costos' },
  { path: '/clientes', nombre: 'Clientes' },
  { path: '/components', nombre: 'Componentes' },
  { path: '/conductores', nombre: 'Conductores' },
  { path: '/cuenta', nombre: 'Cuenta' },
  { path: '/descuentos', nombre: 'Descuentos' },
  { path: '/empresas', nombre: 'Empresas' },
  { path: '/estados', nombre: 'Estados' },
  { path: '/generales', nombre: 'Generales' },
  { path: '/inicio', nombre: 'Inicio' },
  { path: '/max_loyalty', nombre: 'Max Loyalty' },
  { path: '/max_pay', nombre: 'Max Pay' },
  { path: '/miembros', nombre: 'Miembros' },
  { path: '/monedas', nombre: 'Monedas' },
  { path: '/monedero_flota', nombre: 'Monedero Flota' },
  { path: '/paises', nombre: 'Países' },
  { path: '/permisos', nombre: 'Permisos' },
  { path: '/precios_semana', nombre: 'Precios por Semana' },
  { path: '/puntos', nombre: 'Puntos' , hidden: true},
  { path: '/redimir', nombre: 'Redimir' },
  { path: '/reportes_flota/reporte_canal_subcanal', nombre: 'Reportes de flota por canal y subcanal' },
  { path: '/reportes_flota/reporte_estacion', nombre: 'Reportes de flota por estación' },
  { path: '/reportes_flota/reporte_rendimiento', nombre: 'Reportes de flota por rendimiento de vehículo' },
  { path: '/reportes_transacciones/reportes', nombre: 'Reportes de loyalty por estación' },
  { path: '/reportes_transacciones/reporte_canal', nombre: 'Reportes de loyalty por canal' },
  { path: '/sub_canales', nombre: 'Subcanales' },
  { path: '/tarjetas', nombre: 'Tarjetas' },
  { path: '/terminales', nombre: 'Terminales' },
  { path: '/tipo_combustible', nombre: 'Tipos de Combustible' },
  { path: '/tipo_de_tarjetas', nombre: 'Tipos de Tarjetas' },
  { path: '/transacciones', nombre: 'Transacciones' },
  { path: '/transacciones_flota', nombre: 'Transacciones de Flota' },
  { path: '/turnos', nombre: 'Turnos' },
  { path: '/unidad_medida', nombre: 'Unidades de Medida' },
  { path: '/usuarios', nombre: 'Usuarios' },
  { path: '/vehiculos', nombre: 'Vehículos' },
];
 
// Mapeo de rutas para subrutas en los enlaces del Navbar
const routeDisplayMap: { [key: string]: string } = {
  '/reportes_transacciones/reportes': '/reportes_transacciones/reportes',
  '/reportes_transacciones/reporte_canal': '/reportes_transacciones/reporte_canal',
  '/reportes_flota/reporte_canal_subcanal': '/reportes_flota/reporte_canal_subcanal',
  '/reportes_flota/reporte_estacion': '/reportes_flota/reporte_estacion',
  '/reportes_flota/reporte_rendimiento': '/reportes_flota/reporte_rendimiento',
};
 
// Mapeo de subrutas a rutas base para permisos, consistente con Permisos.tsx
const routeToBaseMap: { [key: string]: string } = {
  '/reportes_transacciones/reportes': '/reportes_transacciones/reportes',
  '/reportes_transacciones/reporte_canal': '/reportes_transacciones/reporte_canal',
  '/reportes_flota/reporte_canal_subcanal': '/reportes_flota/reporte_canal_subcanal',
  '/reportes_flota/reporte_estacion': '/reportes_flota/reporte_estacion',
  '/reportes_flota/reporte_rendimiento': '/reportes_flota/reporte_rendimiento',
};
 
// Mapeo de rutas a secciones para no administradores
const rutasPorSeccion: { [key: string]: string[] } = {
  maxLoyalty: [
    '/transacciones',
    '/puntos',
    '/redimir',
    '/reportes_transacciones/reportes',
    '/reportes_transacciones/reporte_canal',
    '/max_loyalty',
  ],
  maxFlotas: [
    '/vehiculos',
    '/monedero_flota',
    '/transacciones_flota',
    '/reportes_flota/reporte_canal_subcanal',
    '/reportes_flota/reporte_estacion',
    '/reportes_flota/reporte_rendimiento',
    '/conductores',
    '/max_pay',
  ],
  generales: [
    '/clientes',
    '/tarjetas',
    '/canales',
    '/empresas',
    '/sub_canales',
    '/centro_costos',
  ],
  configuraciones: [
    '/terminales',
    '/usuarios',
    '/permisos',
    '/paises',
    '/turnos',
    '/tipo_combustible',
    '/precios_semana',
    '/miembros',
    '/monedas',
    '/descuentos',
    '/estados',
    '/tipo_de_tarjetas',
    '/unidad_medida',
    '/components',
  ],
};
 
// Definir las rutas por sección para administradores
const secciones = {
  maxLoyalty: [
    { path: '/transacciones', nombre: 'Transacciones' },
    { path: '/puntos', nombre: 'Puntos', hidden: true },
    { path: '/redimir', nombre: 'Redimir',  hidden: true },
    { path: '/reportes_transacciones/reportes', nombre: 'Reportes' },
  
  ],
  maxFlotas: [
    { path: '/vehiculos', nombre: 'Vehículos' },
    { path: '/monedero_flota', nombre: 'Monedero Flota' },
    { path: '/transacciones_flota', nombre: 'Transacciones de Flota' },
    { path: '/reportes_flota/reporte_canal_subcanal', nombre: 'Reportes' },
  
  ],
  generales: [
    { path: '/clientes', nombre: 'Clientes' },
    { path: '/tarjetas', nombre: 'Tarjetas' },
    { path: '/canales', nombre: 'Canales y subcanales' },
    { path: '/empresas', nombre: 'Red de empresas' },
  ],
  configuraciones: [
    { path: '/terminales', nombre: 'Terminales y usuarios' },
    { path: '/usuarios', nombre: 'Usuarios' },
    { path: '/permisos', nombre: 'Permisos' },
    { path: '/paises', nombre: 'Configuración regional' },
    { path: '/turnos', nombre: 'Turnos' },
    { path: '/tipo_combustible', nombre: 'Tipo de combustible' },
    { path: '/precios_semana', nombre: 'Precios y descuentos' },
  ],
};
 
export default function Navbar() {
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMaxLoyaltyOpen, setIsMaxLoyaltyOpen] = useState(false);
  const [isMaxPayOpen, setIsMaxPayOpen] = useState(false);
  const [isGeneralesOpen, setIsGeneralesOpen] = useState(false);
  const [isConfiguracionesOpen, setIsConfiguracionesOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
 
  const router = useRouter();
  const pathname = usePathname();
 
  const fetchSession = async () => {
    try {
      const response = await fetch('/api/session', { credentials: 'include' });
      if (response.ok) {
        const data: Session = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  };
 
  const fetchPermisos = async (usuarioId: number) => {
    try {
      const response = await fetch(`/api/permisos?usuarioId=${usuarioId}`);
      if (response.ok) {
        const data: Permiso[] = await response.json();
        setPermisos(data);
      } else {
        console.error('Error al obtener permisos');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };
 
  useEffect(() => {
    const updateSession = async () => {
      const session = await fetchSession();
      if (session && session.nombre) {
        setUserName(session.nombre);
        setIsAdmin(session.admin || false);
        if (!session.admin) {
          await fetchPermisos(session.id);
        } else {
          setPermisos([]); // No necesitamos permisos para admin
        }
      } else {
        setUserName('');
        setIsAdmin(false);
        setPermisos([]);
      }
    };
 
    updateSession();
    const interval = setInterval(updateSession, 60000); // Actualizar cada 60 segundos
    return () => clearInterval(interval);
  }, []);
 
  // Determinar qué secciones deben estar abiertas según la ruta actual
  useEffect(() => {
    setIsMaxLoyaltyOpen(
      pathname.startsWith('/transacciones') ||
      pathname.startsWith('/puntos') ||
      pathname.startsWith('/redimir') ||
      pathname.startsWith('/reportes_transacciones') ||
      pathname === '/max_loyalty'
    );
    setIsMaxPayOpen(
      pathname.startsWith('/vehiculos') ||
      pathname.startsWith('/monedero_flota') ||
      pathname.startsWith('/transacciones_flota') ||
      pathname.startsWith('/reportes_flota') ||
      pathname === '/conductores' ||
      pathname === '/max_pay'
    );
    setIsGeneralesOpen(
      pathname.startsWith('/clientes') ||
      pathname.startsWith('/tarjetas') ||
      pathname.startsWith('/canales') ||
      pathname.startsWith('/empresas') ||
      pathname === '/sub_canales' ||
      pathname === '/centro_costos'
    );
    setIsConfiguracionesOpen(
      pathname.startsWith('/terminales') ||
      pathname.startsWith('/usuarios') ||
      pathname.startsWith('/permisos') ||
      pathname.startsWith('/paises') ||
      pathname.startsWith('/turnos') ||
      pathname.startsWith('/tipo_combustible') ||
      pathname.startsWith('/precios_semana') ||
      pathname === '/miembros' ||
      pathname === '/monedas' ||
      pathname === '/descuentos' ||
      pathname === '/estados' ||
      pathname === '/tipo_de_tarjetas' ||
      pathname === '/unidad_medida' ||
      pathname === '/components'
    );
  }, [pathname]);
 
  const hasPermission = (ruta: string) => {
    if (isAdmin) return true; // Admins tienen acceso a todo
    const baseRoute = routeToBaseMap[ruta] || ruta;
    return permisos.some((permiso) => permiso.ruta === baseRoute && permiso.permitido);
  };
 
  // Determinar si una sección debe mostrar subitems (para no admins)
  const hasMaxLoyaltyRoutes = () =>
    isAdmin ||
    rutasPorSeccion.maxLoyalty.some((ruta) => hasPermission(ruta));
 
  const hasMaxPayRoutes = () =>
    isAdmin ||
    rutasPorSeccion.maxFlotas.some((ruta) => hasPermission(ruta));
 
  const hasGeneralesRoutes = () =>
    isAdmin ||
    rutasPorSeccion.generales.some((ruta) => hasPermission(ruta));
 
  const hasConfiguracionesRoutes = () =>
    isAdmin ||
    rutasPorSeccion.configuraciones.some((ruta) => hasPermission(ruta));
 
  // Obtener rutas permitidas para una sección (para no admins)
  const getRutasPermitidas = (seccionRutas: string[]) => {
    return rutasDisponibles
      .filter((ruta) => seccionRutas.includes(ruta.path) && hasPermission(ruta.path))
      .sort((a, b) => a.nombre.localeCompare(b.nombre)); // Ordenar alfabéticamente
  };
 
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
    <div className={`relative flex transition-all duration-500 ease-in-out ${isNavbarVisible ? 'w-64' : 'w-0'}`}>
      <nav
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-500 ease-in-out ${
          isNavbarVisible ? 'w-64 p-4' : 'w-0 p-0'
        }`}
      >
        <Link href="/inicio">
          <Image src="/images/logo-max-loyalty-white.png" alt="Logo" width={250} height={250} />
        </Link>
        <div className="mt-4 h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
          {userName && (
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleMaxLoyaltyClick}
                  className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
                  disabled={!hasMaxLoyaltyRoutes()}
                >
                  Max-Loyalty
                  <ChevronDown className={`w-5 h-5 transition-transform ${isMaxLoyaltyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMaxLoyaltyOpen && hasMaxLoyaltyRoutes() && (
                  <ul className="ml-4 space-y-2">
                    {(isAdmin ? secciones.maxLoyalty : getRutasPermitidas(rutasPorSeccion.maxLoyalty))
                      .map((ruta) => (
                        <li key={ruta.path}>
                          <Link
                            href={routeDisplayMap[ruta.path] || ruta.path}
                            className={`block p-2 rounded hover:bg-gray-700 ${
                              pathname === (routeDisplayMap[ruta.path] || ruta.path) ||
                              (ruta.path.startsWith('/reportes_transacciones') && pathname.startsWith('/reportes_transacciones'))
                                ? 'active-subitem'
                                : ''
                            }`}
                          >
                            {ruta.nombre}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={handleMaxPayClick}
                  className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
                  disabled={!hasMaxPayRoutes()}
                >
                  Max-Flotas
                  <ChevronDown className={`w-5 h-5 transition-transform ${isMaxPayOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMaxPayOpen && hasMaxPayRoutes() && (
                  <ul className="ml-4 space-y-2">
                    {(isAdmin ? secciones.maxFlotas : getRutasPermitidas(rutasPorSeccion.maxFlotas))
                      .map((ruta) => (
                        <li key={ruta.path}>
                          <Link
                            href={routeDisplayMap[ruta.path] || ruta.path}
                            className={`block p-2 rounded hover:bg-gray-700 ${
                              pathname === (routeDisplayMap[ruta.path] || ruta.path) ||
                              (ruta.path.startsWith('/reportes_flota') && pathname.startsWith('/reportes_flota'))
                                ? 'active-subitem'
                                : ''
                            }`}
                          >
                            {ruta.nombre}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={handleGeneralesClick}
                  className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
                  disabled={!hasGeneralesRoutes()}
                >
                  Generales
                  <ChevronDown className={`w-5 h-5 transition-transform ${isGeneralesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isGeneralesOpen && hasGeneralesRoutes() && (
                  <ul className="ml-4 space-y-2">
                    {(isAdmin ? secciones.generales : getRutasPermitidas(rutasPorSeccion.generales))
                      .map((ruta) => (
                        <li key={ruta.path}>
                          <Link
                            href={routeDisplayMap[ruta.path] || ruta.path}
                            className={`block p-2 rounded hover:bg-gray-700 ${
                              pathname === (routeDisplayMap[ruta.path] || ruta.path) ? 'active-subitem' : ''
                            }`}
                          >
                            {ruta.nombre}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={handleConfiguracionesClick}
                  className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center justify-between"
                  disabled={!hasConfiguracionesRoutes()}
                >
                  Configuraciones
                  <ChevronDown className={`w-5 h-5 transition-transform ${isConfiguracionesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isConfiguracionesOpen && hasConfiguracionesRoutes() && (
                  <ul className="ml-4 space-y-2">
                    {(isAdmin ? secciones.configuraciones : getRutasPermitidas(rutasPorSeccion.configuraciones))
                      .map((ruta) => (
                        <li key={ruta.path}>
                          <Link
                            href={routeDisplayMap[ruta.path] || ruta.path}
                            className={`block p-2 rounded hover:bg-gray-700 ${
                              pathname === (routeDisplayMap[ruta.path] || ruta.path) ? 'active-subitem' : ''
                            }`}
                          >
                            {ruta.nombre}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            </ul>
          )}
        </div>
      </nav>
 
      <button
        onClick={() => setIsNavbarVisible(!isNavbarVisible)}
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
              {hasPermission('/cuenta') && (
                <li>
                  <Link
                    href="/cuenta"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Cuenta
                  </Link>
                </li>
              )}
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
          <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-11/12 sm:w-1/3 border-1">
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
        .custom-scrollbar {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #4B5EAA transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4B5EAA;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6B7280;
        }
        .block {
          color: white;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .active-subitem {
          background-color: #4B5EAA;
          color: white;
          font-weight: 500;
        }
        .active-subitem:hover {
          background-color: #6B7280;
          color: white;
        }
        .block:hover {
          background-color: #4B5563;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
 