'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type Conductor = {
  id: number;
  nombre: string;
  numero_licencia: string;
  telefono: string;
  correo: string;
  vehiculo_id: number;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  vehiculo_placa?: string;
  tipo_licencia: string;
  fecha_emision: string;
  fecha_expiracion: string;
  tipo_sangre: string;
};

export default function Conductores() {
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conductorToDelete, setConductorToDelete] = useState<Conductor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pathname = usePathname();

  const fetchConductores = useCallback(async () => {
    try {
      const response = await fetch(`/api/conductores?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setConductors(data);
    } catch (error) {
      console.error('Error fetching conductores:', error);
      alert('Error al cargar los conductores: ' + (error as Error).message);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchConductores();
  }, [fetchConductores]);

  const handleDelete = async (id: number) => {
    if (conductorToDelete) {
      try {
        const response = await fetch(`/api/conductores/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Delete response:', data);
        alert('Conductor eliminado exitosamente');
        setConductors((prev) => prev.filter((conductor) => conductor.id !== id));
        setIsDeleteModalOpen(false);
        fetchConductores();
      } catch (error) {
        console.error('Error deleting conductor:', error);
        alert('Error al eliminar el conductor: ' + (error as Error).message);
      }
    }
  };

  const filteredConductores = conductors.filter((conductor) =>
    Object.values(conductor)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentConductores = filteredConductores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConductores.length / itemsPerPage);

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

  const regionRoutes = [
    { name: 'Vehículos', href: '/vehiculos' },
    { name: 'Conductores', href: '/conductores' },
  ];

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-white
                transition-all duration-300 text-center"
              >
                Gestión de Conductores
              </h1>

              <nav className="flex justify-center space-x-4">
                {regionRoutes.map((reporte) => {
                  const isActive = pathname === reporte.href;
                  return (
                    <Link key={reporte.name} href={reporte.href}>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {reporte.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex justify-between mb-4">
              <Link href="/conductores/crear">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Agregar Conductor
                </button>
              </Link>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, licencia, teléfono o correo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-2/5 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <table className="min-w-full bg-gray-50 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nº Licencia</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Correo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vehículo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Fecha de Emisión</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Fecha de Expiración</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Tipo de sangre</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentConductores.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-2 text-center text-gray-500">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  currentConductores.map((conductor, index) => (
                    <tr key={conductor.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-2">{conductor.nombre}</td>
                      <td className="px-4 py-2">{conductor.numero_licencia}</td>
                      <td className="px-4 py-2">{conductor.telefono}</td>
                      <td className="px-4 py-2">{conductor.correo}</td>
                      <td className="px-4 py-2">
                        {conductor.vehiculo_marca} {conductor.vehiculo_modelo} - {conductor.vehiculo_placa}
                      </td>
                      <td className="px-4 py-2">{conductor.tipo_licencia}</td>
                      <td className="px-4 py-2">{formatDateTime(conductor.fecha_emision)}</td>
                      <td className="px-4 py-2">{formatDateTime(conductor.fecha_expiracion)}</td>
                      <td className="px-4 py-2">{conductor.tipo_sangre}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <Link href={`/conductores/editar/${conductor.id}`}>
                          <button
                            className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-200"
                          >
                            Editar
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setConductorToDelete(conductor);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-200"
                        >
                          Eliminar
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
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
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
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Siguiente
              </button>
            </div>

            {/* Modal para eliminar conductor */}
            {isDeleteModalOpen && conductorToDelete && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsDeleteModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                  <h2
                    className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-200 text-center"
                  >
                    Confirmar Eliminación
                  </h2>
                  <p className="text-center text-gray-700 mb-4">
                    ¿Estás seguro de que deseas eliminar al conductor {conductorToDelete.nombre}?
                  </p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(conductorToDelete.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}