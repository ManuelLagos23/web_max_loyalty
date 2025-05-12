'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function MenuMain() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoutClick = () => {
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

  const generalesRoutes = [
    '/generales',
    '/clientes',
    '/tarjetas',
    '/tipo_de_tarjetas',
    '/canales',
    '/sub_canales',
    '/productos',
    '/precio',
  ];

  const configuracionRoutes = [
    '/configuraciones',
    '/terminales',
    '/usuarios',
    '/miembros',
    '/empresas',
    '/centro_de_costos',
    '/paises',
    '/estados',
    '/monedas',
    '/cuenta',
  ];

  const maxLoyaltyRoutes = [
    '/max_loyalty',
    '/transacciones',
    '/puntos',
    '/redimir',
  ];

  const maxPayRoutes = [
    '/max_pay',
    '/descuentos',
    '/tipo_combustible',
    '/unidad_medida',
    '/precios_semana',
    // Puedes agregar más rutas relacionadas a Max Pay si las tienes
  ];

  const isInicioActive = pathname === '/inicio';
  const isGeneralesActive = generalesRoutes.includes(pathname);
  const isConfiguracionActive = configuracionRoutes.includes(pathname);
  const isMaxLoyaltyActive = maxLoyaltyRoutes.includes(pathname);
  const isMaxPayActive = maxPayRoutes.includes(pathname);

  return (
    <>
      <div className="w-full flex justify-center mt-2 relative z-10">
        <div className="w-3/3 md:w-2/3 lg:w-1/2 bg-gray-800 text-white p-2 mb-2 rounded-lg shadow">
          <div className="flex justify-center space-x-4 items-center flex-wrap">
            <Link href="/inicio">
              <button
                className={`px-4 py-1 rounded ${
                  isInicioActive ? 'bg-blue-600' : 'hover:bg-blue-600'
                }`}
              >
                Inicio
              </button>
            </Link>
            <Link href="/max_loyalty">
              <button
                className={`px-4 py-1 rounded ${
                  isMaxLoyaltyActive ? 'bg-blue-600' : 'hover:bg-blue-600'
                }`}
              >
                Max Loyalty
              </button>
            </Link>
            <Link href="/max_pay">
              <button
                className={`px-4 py-1 rounded ${
                  isMaxPayActive ? 'bg-blue-600' : 'hover:bg-blue-600'
                }`}
              >
                Max Pay
              </button>
            </Link>
            <Link href="/generales">
              <button
                className={`px-4 py-1 rounded ${
                  isGeneralesActive ? 'bg-blue-600' : 'hover:bg-blue-600'
                }`}
              >
                Generales
              </button>
            </Link>
            <Link href="/configuraciones">
              <button
                className={`px-4 py-1 rounded ${
                  isConfiguracionActive ? 'bg-blue-600' : 'hover:bg-blue-600'
                }`}
              >
                Configuración
              </button>
            </Link>
            <button
              onClick={handleLogoutClick}
              className="hover:bg-red-700 px-4 py-1 rounded ml-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
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
    </>
  );
}