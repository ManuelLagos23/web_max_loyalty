'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavbarConfiguracion from '../components/NavbarConfiguracion';
import MenuMain from '../components/MenuMain';
import Image from 'next/image';

interface UserData {
  nombre: string;
  email: string;
  num_telefono: string;
  img?: string | null;
}

export default function Cuenta() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

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
      console.error('Error al obtener sesión en Cuenta:', error);
      return null;
    }
  };

  useEffect(() => {
    const updateUserData = async () => {
      const session = await fetchSession();
      if (!session) {
 
        router.push('/login');
      } else {
        setUserData(session);
      }
    };

    updateUserData();
  }, [router]);

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
        setUserData(null);
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

  const getImageSrc = (img: string | null | undefined) => {
    if (!img) return null;
    const jpegSrc = `data:image/jpeg;base64,${img}`;
    return jpegSrc;
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <NavbarConfiguracion />
        <div className="flex-1 flex flex-col">
          <MenuMain />
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Mi Cuenta
              </h1>
              <p
                className="text-center text-gray-700 leading-relaxed max-w-2xl
                p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
              >
                Visualiza y gestiona la información de tu cuenta con facilidad y seguridad.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              {!userData ? (
                <div className="h-48 flex items-center justify-center">
                  <span className="text-gray-500">Verificando sesión...</span>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold mb-4">Bienvenido, {userData.nombre}</h2>
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex-shrink-0">
                      {userData.img && getImageSrc(userData.img) ? (
                        <Image
                          src={getImageSrc(userData.img)!}
                          alt="Foto de perfil"
                          width={100}
                          height={100}
                          className="rounded-full object-cover"
                          priority
                          onError={() => console.error('Error al cargar la imagen')}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="font-bold">Nombre:</span> {userData.nombre}
                      </div>
                      <div>
                        <span className="font-bold">Email:</span> {userData.email}
                      </div>
                      <div>
                        <span className="font-bold">Número de Teléfono:</span> {userData.num_telefono}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelLogout();
            }
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border border-gray-200">
            <h2
              className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 hover:scale-105 text-center"
            >
              Confirmar Cierre de Sesión
            </h2>
            <p className="text-center text-gray-700 mb-4">
              ¿Estás seguro de que deseas cerrar sesión?
            </p>
            <div className="flex justify-between space-x-2">
              <button
                onClick={cancelLogout}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300 w-full"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 w-full"
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