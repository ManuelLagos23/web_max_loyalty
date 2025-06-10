'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/app/components/Navbar';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  cliente_id?: number;
  cliente_nombre?: string;
  tipo_tarjeta_id: number;
  tipo_tarjeta_nombre: string;
  canal_id?: number;
  codigo_canal?: string;
  subcanal_id?: number;
  subcanal_nombre?: string;
  created_at: string;
  vehiculo_id?: number;
  vehiculo_nombre?: string;
  active: boolean;
}

export default function TarjetasDesactivadas() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isActivatePopupOpen, setIsActivatePopupOpen] = useState(false);
  const [tarjetaAActivar, setTarjetaAActivar] = useState<Tarjeta | null>(null);
  const itemsPerPage = 10;
  const pathname = usePathname();

  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/tarjetas/desactivadas?page=${encodeURIComponent(currentPage)}&limit=${encodeURIComponent(itemsPerPage)}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setTarjetas(data.tarjetas || []);
        setTotalItems(data.total || 0);
      } else {
        console.error('Error al cargar tarjetas desactivadas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchTarjetas();
  }, [fetchTarjetas]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openActivatePopup = (tarjeta: Tarjeta) => {
    setTarjetaAActivar(tarjeta);
    setIsActivatePopupOpen(true);
  };

  const closeActivatePopup = () => {
    setTarjetaAActivar(null);
    setIsActivatePopupOpen(false);
  };

  const handleActivate = async () => {
    if (!tarjetaAActivar) return;
    try {
      const response = await fetch(`/api/tarjetas/${tarjetaAActivar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      });
      if (response.ok) {
        alert('Tarjeta activada exitosamente');
        closeActivatePopup();
        fetchTarjetas();
      } else {
        const errorData = await response.json();
        console.error('Error al activar tarjeta:', errorData);
        alert(`Error al activar la tarjeta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al activar la tarjeta');
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const cardsRoutes = [
    { name: 'Tarjetas', href: '/tarjetas' },

    { name: 'Tipos de tarjetas', href: '/tipo_de_tarjetas' },
        { name: 'Tarjetas Desactivadas', href: '/tarjetas/desactivadas' },
  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen flex">
      <Head>
        <meta charSet="UTF-8" />
      </Head>
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <h1
              className="text-4xl font-bold text-gray-900 mb-4
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Tarjetas desactivadas
            </h1>

      
            <nav className="flex justify-center space-x-4">
              {cardsRoutes.map((card) => {
                const isActive = pathname === card.href;
                return (
                  <Link key={card.name} href={card.href}>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {card.name}
                    </button>
                  </Link>
                );
              })}
            </nav>    </div>

         <div className="mt-8 mb-4">
            <input
              type="text"
              placeholder="Buscar por número de tarjeta, cliente, vehículo o tipo de tarjeta..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-2 py-4 text-left text-gray-600 font-semibold">
                  #
                </th>
                 <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de Tarjeta</th>
               <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cliente</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Vehículo</th>
               <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha de Creación</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.length > 0 ? (
                tarjetas.map((tarjeta, index) => (
                  <tr key={tarjeta.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-2 ">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2 ">{tarjeta.numero_tarjeta}</td>
                    <td className="px-4 py-2 ">{tarjeta.cliente_nombre || '-'}</td>
                    <td className="px-4 px-2 ">{tarjeta.vehiculo_nombre || '-'}</td>
                    <td className="px-4 py-2 ">{tarjeta.tipo_tarjeta_nombre}</td>
                    <td className="px-4 py-2 ">{formatDate(tarjeta.created_at)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openActivatePopup(tarjeta)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-200 "
                      >
                        Activar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500 ">
                    No hay tarjetas desactivadas disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Anterior
            </button>
            <span className="text-gray-700 text-xs">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Siguiente
            </button>
          </div>

          {isActivatePopupOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeActivatePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2
                  className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                  bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text
                  text-center"
                >
                  Confirmar Activación
                </h2>
                <p className="text-center text-gray-600 mb-4 ">
                  ¿Estás seguro de que deseas activar la tarjeta {tarjetaAActivar?.numero_tarjeta}?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={closeActivatePopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300 "
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleActivate}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 "
                  >
                    Activar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}