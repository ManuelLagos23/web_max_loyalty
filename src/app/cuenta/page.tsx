// src/app/cuenta/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

interface UserData {
  nombre: string;
  email: string;
  num_telefono: string;
}

export default function Cuenta() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Estado para el modal
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/session', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Sesión obtenida en Cuenta:', data);
        return data;
      } else {
        console.log('No hay sesión activa o error en Cuenta:', response.status);
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
        console.log('No hay sesión, redirigiendo a /login');
        router.push('/login');
      } else {
        setUserData(session);
        setLoading(false);
      }
    };

    updateUserData();
  }, [router]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true); // Mostrar el modal al hacer clic en "Cerrar Sesión"
  };

  const confirmLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        console.log('Sesión cerrada exitosamente en Cuenta');
        setIsLogoutModalOpen(false); // Cerrar el modal
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
    setIsLogoutModalOpen(false); // Cerrar el modal sin cerrar sesión
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="font-sans bg-gray-100 text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Mi Cuenta</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Bienvenido, {userData.nombre}</h2>
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
            <button
              onClick={handleLogoutClick} // Cambiamos a handleLogoutClick
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </main>
      </div>

      {/* Modal de confirmación */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
        onClick={(e) => {
            // Verifica si el clic fue directamente en el contenedor (fuera del modal)
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