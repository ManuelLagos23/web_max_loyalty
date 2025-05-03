'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>(''); 
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/session', {
        credentials: 'include', // Incluir cookies en la solicitud
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Sesión obtenida:', data); // Depuración
        return data;
      } else {
        console.log('No hay sesión activa o error:', response.status); // Depuración
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
        console.log('Actualizando nombre a:', session.nombre); // Depuración
        setUserName(session.nombre);
      } else {
        console.log('No hay sesión, seteando a vacío'); // Depuración
        setUserName('');
      }
    };

    updateUserName(); // Ejecutar al montar
    const interval = setInterval(updateUserName, 1000); // Verifica cada segundo (opcional)

    return () => clearInterval(interval); // Limpiar al desmontar
  }, []);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
        console.log('Sesión cerrada exitosamente');
        setIsLogoutModalOpen(false);
        setUserName(''); 
        router.push('/login');
      } else {
        console.error('Error al cerrar sesión:', await response.json());
        alert('Error al cerrar sesión. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Logout Button at Top-Right */}
      <button
        onClick={handleLogoutClick}
        className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 z-50"
      >
        Cerrar sesión
      </button>

      {/* Sidebar Navigation */}
      <nav className="w-full sm:w-72 md:w-64 bg-gray-800 text-white h-screen p-4 space-y-2">
        <Link href="/inicio">
          <Image src="/images/logo-max-loyalty-white.png" alt="Logo" width={250} height={250} />
        </Link>
        <ul className="space-y-2">
          <li>
            <Link href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
              Bienvenido: {userName || 'Invitado'} 
            </Link>
          </li>
          <li>
            <Link href="/miembros" className="flex items-center p-2 rounded hover:bg-gray-700">
              Miembros APK
            </Link>
          </li>
        
          <li>
            <Link href="/clientes" className="block p-2 rounded hover:bg-gray-700">
              Clientes
            </Link>
          </li>
          <li>
            <Link href="/empresas" className="block p-2 rounded hover:bg-gray-700">
              Empresas
            </Link>
          </li>
          <li>
            <Link href="/centro_de_costos" className="block p-2 rounded hover:bg-gray-700">
              Centros de costos
            </Link>
          </li>
          <li>
            <details>
              <summary className="block p-2 rounded hover:bg-gray-700 cursor-pointer flex items-center justify-between">
                Movimientos
                <span className="transition-transform duration-200 details-open:rotate-180">▼</span>
              </summary>
              <ul className="ml-4 space-y-2 mt-2">
                <li>
                  <Link href="/transacciones" className="block p-2 rounded hover:bg-gray-700">
                    * Transacciones
                  </Link>
                </li>
                <li>
                  <Link href="/puntos" className="block p-2 rounded hover:bg-gray-700">
                    * Puntos
                  </Link>
                </li>
                <li>
                  <Link href="/redimir" className="block p-2 rounded hover:bg-gray-700">
                    * Redimir puntos
                  </Link>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <Link href="/configuraciones" className="block p-2 rounded hover:bg-gray-700">
              Configuración
            </Link>
          </li>
          <li>
            <Link href="/cuenta" className="block p-2 rounded hover:bg-gray-700">
              Mi cuenta
            </Link>
          </li>
          <li>
            <Link href="/usuarios" className="flex items-center p-2 rounded hover:bg-gray-700">
              Usuarios
            </Link>
          </li>
          <li>
            <Link href="/tarjetas" className="flex items-center p-2 rounded hover:bg-gray-700">
              Tarjetas
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
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
    </div>
  );
}