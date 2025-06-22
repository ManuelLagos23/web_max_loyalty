'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

type Transaccion = {
  id: number;
  cliente_nombre: string;
  establecimiento_nombre: string;
  fecha: string;
  monto: number;
  terminal_nombre: string;
  numero_tarjeta: string | null;
  estado: string | null;
  unidades: number;
  descuento: number;
  canal_nombre: string;
  tipo_combustible_nombre: string;
  turno_id: number | null;
  turno_estado: string | null;
};

export default function Transacciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const response = await fetch(`/api/transacciones?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.ok) {
          const data = await response.json();
          setTransacciones(data);
        } else {
          console.error('Failed to fetch transacciones:', response.statusText);
          setTransacciones([]);
        }
      } catch (error) {
        console.error('Error fetching transacciones:', error);
        setTransacciones([]);
      }
    };

    fetchTransacciones();
  }, [currentPage]);

  const filteredTransacciones = transacciones.filter((transaccion) =>
    Object.values(transaccion)
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
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
              Gestión de Transacciones
            </h1>
            <p className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg transition-all duration-300 hover:shadow-md mx-auto">
              Administra las transacciones de Max Loyalty.
            </p>
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="mt-6 w-full bg-gray-100 table-auto border-collapse border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Establecimiento</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Total LPS.</th>
                <th className="px-4 py-2">Terminal</th>
                <th className="px-4 py-2">Número de Tarjeta</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Litros</th>
                <th className="px-4 py-2">Descuento LPS.</th>
                <th className="px-4 py-2">Canal</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTransacciones.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-2 text-center">
                    No hay transacciones disponibles
                  </td>
                </tr>
              ) : (
                currentTransacciones.map((transaccion) => (
                  <tr className="hover:bg-gray-50" key={transaccion.id}>
                    <td className="px-4 py-2 text-center">{transaccion.id}</td>
                    <td className="px-4 py-2 text-center">{transaccion.cliente_nombre ?? 'Sin cliente'}</td>
                    <td className="px-4 py-2 text-center">{transaccion.establecimiento_nombre}</td>
                    <td className="px-4 py-2">{new Date(transaccion.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-center">
                      {transaccion.monto.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2 text-center">{transaccion.terminal_nombre}</td>
                    <td className="px-4 py-2 text-center">{transaccion.numero_tarjeta ?? 'Sin tarjeta'}</td>
                    <td className="px-4 py-2 text-center">{transaccion.estado ? 'Validada' : 'Cancelada'}</td>
                    <td className="px-4 py-2 text-center">
                      {transaccion.unidades != null ? transaccion.unidades.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {transaccion.descuento != null ? transaccion.descuento.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">{transaccion.canal_nombre}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => router.push(`/transacciones/ver/${transaccion.id}`)}
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
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Siguiente
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}