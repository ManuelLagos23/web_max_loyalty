'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export default function NavbarGeneral() {
  const [userName, setUserName] = useState<string>('');
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

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

  return (
    <div className={`relative flex transition-all duration-500 ease-in-out ${isNavbarVisible ? 'pl-64' : 'pl-0'}`}>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-white overflow-hidden transition-all duration-500 ease-in-out ${
          isNavbarVisible ? 'w-64 p-4' : 'w-0 p-0'
        }`}
      >
        <Link href="/inicio">
          <Image src="/images/logo-max-loyalty-white.png" alt="Logo" width={250} height={250} />
        </Link>
        <ul className="space-y-2 mt-4">
          <li>
            <Link href="#" className="flex items-center p-2 rounded hover:bg-gray-700">
              Bienvenido: {userName || 'Invitado'}
            </Link>
          </li>
          <li><Link href="/clientes" className="flex items-center p-2 rounded hover:bg-gray-700">Cliente</Link></li>
          <li><Link href="/tarjetas" className="block p-2 rounded hover:bg-gray-700">Tarjetas</Link></li>
              <li><Link href="/tipo_de_tarjetas" className="block p-2 rounded hover:bg-gray-700">Tipos de tarjetas</Link></li>
          <li><Link href="/canales" className="block p-2 rounded hover:bg-gray-700">Canales</Link></li>
          <li><Link href="/sub_canales" className="block p-2 rounded hover:bg-gray-700">Subcanales</Link></li>
          <li><Link href="#" className="block p-2 rounded hover:bg-gray-700">Productos</Link></li>
          <li><Link href="#" className="block p-2 rounded hover:bg-gray-700">Precio</Link></li>
        </ul>
      </nav>

      {/* Botón para mostrar/ocultar el navbar */}
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
            <span>Navbar</span>
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
