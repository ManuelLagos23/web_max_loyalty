
'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  cliente_id?: number;
  cliente_nombre?: string;
  tipo_tarjeta_id: number;
  tipo_tarjeta_nombre: string;
  canal_id?: number;
  canal?: string;
  codigo_canal?: string;
  subcanal_id?: number;
  subcanal_nombre?: string;
  created_at: string;
  vehiculo_id?: number;
  vehiculo_nombre?: string;
}

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tarjetaADesactivar, setTarjetaADesactivar] = useState<Tarjeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const handleDeactivate = async () => {
    if (!tarjetaADesactivar) return;
    try {
      const response = await fetch(`/api/tarjetas/${tarjetaADesactivar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      if (response.ok) {
        alert('Tarjeta desactivada exitosamente');
        setTarjetaADesactivar(null);
        await fetchTarjetas();
      } else {
        const errorData = await response.json();
        console.error('Error al desactivar tarjeta:', errorData);
        alert(`Error al desactivar la tarjeta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al desactivar la tarjeta');
    }
  };

  const handlePrintCard = (tarjeta: Tarjeta) => {
    router.push(`/tarjetas/preview/${tarjeta.id}`);
  };

  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/tarjetas?page=${encodeURIComponent(currentPage)}&limit=${encodeURIComponent(
          itemsPerPage
        )}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setTarjetas(data.tarjetas);
        setTotalItems(data.total);
      } else {
        console.error('Error al cargar tarjetas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchTarjetas().catch((error) => console.error('Error al cargar datos iniciales:', error));
  }, [fetchTarjetas]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
    { name: 'Tarjetas desactivadas', href: '/tarjetas/desactivadas' },
  ];

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
              Gestión de Tarjetas
            </h1>

            <nav className="flex justify-center space-x-4">
              {cardsRoutes.map((card) => {
                const isActive = pathname === card.href;
                return (
                  <Link key={card.name} href={card.href}>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {card.name}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex justify-between mb-4">
            <Link href="/tarjetas/crear">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300">
                Agregar Tarjeta
              </button>
            </Link>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por número de tarjeta, cliente, vehículo o tipo de tarjeta..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-gray-800 font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-gray-800 font-semibold">Número</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Cliente</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Vehículo</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Tipo</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Canal</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Subcanal</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Creado</th>
                <th className="px-3 py-3 text-left text-gray-800 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.length > 0 ? (
                tarjetas.map((tarjeta, index) => (
                  <tr key={tarjeta.id} className="hover:bg-gray-50 transition-all duration-200">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-3">{tarjeta.numero_tarjeta}</td>
                    <td className="px-6 py-3">{tarjeta.cliente_nombre || '-'}</td>
                    <td className="px-6 py-3">{tarjeta.vehiculo_nombre || '-'}</td>
                    <td className="px-6 py-3">{tarjeta.tipo_tarjeta_nombre || '-'}</td>
                    <td className="px-3 py-3">{tarjeta.canal || '-'}</td>
                    <td className="px-3 py-3">{tarjeta.subcanal_nombre || '-'}</td>
                    <td className="px-3 py-3">{formatDate(tarjeta.created_at)}</td>
                    <td className="px-3 py-3 space-x-2 flex">
                      <Link href={`/tarjetas/editar/${tarjeta.id}`}>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300">
                          Editar
                        </button>
                      </Link>
                      <button
                        onClick={() => setTarjetaADesactivar(tarjeta)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                      >
                        Desactivar
                      </button>
                      <button
                        onClick={() => handlePrintCard(tarjeta)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
                      >
                        Imprimir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                    No hay tarjetas disponibles.
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
            <span className="text-gray-700">
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

          {tarjetaADesactivar && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setTarjetaADesactivar(null);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2
                  className="text-2xl font-semibold text-center text-blue-800
                  bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                >
                  Confirmar Desactivación
                </h2>
                <p className="text-center text-gray-600 mb-4">
                  ¿Estás seguro de que deseas desactivar la tarjeta {tarjetaADesactivar.numero_tarjeta}?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => setTarjetaADesactivar(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeactivate}
                    className="bg-red-400 hover:bg-red-50 text-white hover:text-red-400 border border-red-400 hover:border-red-400 px-3 py-1 rounded-lg transition-all duration-300"
                  >
                    Desactivar
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
