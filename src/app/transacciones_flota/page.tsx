'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

type TransaccionFlota = {
  id: number;
  monto: number;
  unidades: number;
  odometro: number | null;
  tarjeta_id: number | null;
  monedero_id: number | null;
  canal_id: number;
  subcanal_id: number;
  created_at: string;
  canal_nombre?: string;
  subcanal_nombre?: string;
  vehiculo_id: number | null;
  numero_tarjeta: string | null;
  tipo_combustible_id: number | null;
  turno_id: number | null;
  establecimiento_id: number | null;
  precio: number | null;
  turno_estado: string | null;
  estado: boolean;
};

type Canal = {
  id: number;
  canal: string;
};

type Subcanal = {
  id: number;
  subcanal: string;
};

export default function TransaccionesFlota() {
  const [transacciones, setTransacciones] = useState<TransaccionFlota[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const response = await fetch(`/api/transacciones_flota?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.ok) {
          const data = await response.json();
          setTransacciones(data);
        } else {
          console.error('Failed to fetch transacciones flota:', response.statusText);
          setTransacciones([]);
        }
      } catch (error) {
        console.error('Error fetching transacciones flota:', error);
        setTransacciones([]);
      }
    };

    const fetchCanales = async () => {
      try {
        const response = await fetch('/api/canales');
        if (response.ok) {
          const data = await response.json();
          setCanales(data);
        } else {
          console.error('Failed to fetch canales:', response.statusText);
          setCanales([]);
        }
      } catch (error) {
        console.error('Error fetching canales:', error);
        setCanales([]);
      }
    };

    const fetchSubcanales = async () => {
      try {
        const response = await fetch('/api/subcanales');
        if (response.ok) {
          const data = await response.json();
          setSubcanales(data);
        } else {
          console.error('Failed to fetch subcanales:', response.statusText);
          setSubcanales([]);
        }
      } catch (error) {
        console.error('Error fetching subcanales:', error);
        setSubcanales([]);
      }
    };

    fetchTransacciones();
    fetchCanales();
    fetchSubcanales();
  }, [currentPage]);

  const filteredTransacciones = transacciones.filter((transaccion) =>
    Object.values({
      ...transaccion,
      canal_nombre: canales.find((c) => c.id === transaccion.canal_id)?.canal ?? '',
      subcanal_nombre: subcanales.find((s) => s.id === transaccion.subcanal_id)?.subcanal ?? '',
    })
      .map((value) => String(value ?? ''))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransacciones.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransacciones = filteredTransacciones.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen flex">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 bg-white">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
              Gestión de Transacciones de Flota
            </h1>
            <p className="text-center text-black leading-relaxed max-w-xl p-1 rounded-lg transition-all duration-300 hover:shadow-md mx-auto">
              Administra las transacciones de flota de Max Loyalty.
            </p>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar transacciones de flota..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="mt-4 w-full bg-gray-100 table-auto border-collapse border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Unidades</th>
                <th className="px-2 py-1">Número Tarjeta</th>
                <th className="px-2 py-1">Canal</th>
                <th className="px-2 py-1">Monto</th>
                <th className="px-2 py-1">Odómetro</th>
                <th className="px-2 py-1">Estado</th>
                <th className="px-2 py-1">Fecha Creación</th>
                <th className="px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTransacciones.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-1 text-center">
                    No hay transacciones de flota disponibles
                  </td>
                </tr>
              ) : (
                currentTransacciones.map((transaccion) => (
                  <tr className="hover:bg-gray-50" key={transaccion.id}>
                    <td className="px-2 py-1 text-center">{transaccion.id}</td>
                    <td className="px-2 py-1 text-center">
                      {transaccion.unidades != null ? transaccion.unidades.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-2 py-1 text-center">{transaccion.numero_tarjeta ?? 'N/A'}</td>
                    <td className="px-2 py-1 text-center">
                      {canales.find((c) => c.id === transaccion.canal_id)?.canal ?? 'N/A'}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {transaccion.monto.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-2 py-1 text-center">{transaccion.odometro ?? 'N/A'}</td>
                    <td className="px-2 py-1 text-center">{transaccion.estado ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-2 py-1 text-center">
                      {new Date(transaccion.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => router.push(`/transacciones_flota/ver/${transaccion.id}`)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all duration-300"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Siguiente
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}