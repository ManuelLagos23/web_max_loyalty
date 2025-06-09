'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
  vin: string;
  cilindraje: number;
  chasis: string;
  tipo_combustible: number;
  tipo_combustible_nombre: string;
  transmision: string;
  capacidad_carga: number;
  color: string;
  caballo_potencia: number;
  potencia_motor: number;
  numero_motor: string;
  numero_asientos: number;
  numero_puertas: number;
};

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'documentacion' | 'fisico'>('documentacion');
  const itemsPerPage = 10;
  const pathname = usePathname();
  const router = useRouter();

  const fetchVehiculos = useCallback(async () => {
    try {
      const response = await fetch(`/api/vehiculos?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
      } else {
        console.error('Error fetching vehicles:', response.status, await response.text());
        setVehiculos([]);
      }
    } catch (error) {
      console.error('Error in fetchVehiculos:', error);
      setVehiculos([]);
      alert('Error al cargar los vehículos');
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const handleDelete = async () => {
    if (vehiculoToDelete) {
      try {
        const response = await fetch(`/api/vehiculos/${vehiculoToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Vehículo eliminado exitosamente');
          setVehiculos((prev) => prev.filter((vehiculo) => vehiculo.id !== vehiculoToDelete.id));
          setIsDeleteModalOpen(false);
          fetchVehiculos();
        } else {
          alert('Error al eliminar el vehículo');
        }
      } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        alert('Error al eliminar el vehículo');
      }
    }
  };

  const documentacionFields = [
    'modelo',
    'placa',
    'marca',
    'vin',
    'cilindraje',
    'chasis',
    'tipo_combustible_nombre',
  ];
  const fisicoFields = [
    'transmision',
    'capacidad_carga',
    'color',
    'caballo_potencia',
    'potencia_motor',
    'numero_motor',
    'numero_asientos',
    'numero_puertas',
  ];

  const filteredVehiculos = vehiculos.filter((vehiculo) =>
    (viewMode === 'documentacion' ? documentacionFields : fisicoFields)
      .map((field) => String(vehiculo[field as keyof Vehiculo]))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehiculos = filteredVehiculos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehiculos.length / itemsPerPage);

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

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                transition-all duration-300 text-center"
              >
                Gestión de Vehículos
              </h1>

              <nav className="flex justify-center space-x-4">
                {regionRoutes.map((reporte) => {
                  const isActive = pathname === reporte.href;
                  return (
                    <Link key={reporte.name} href={reporte.href}>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {reporte.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex justify-between mb-4 items-center">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setViewMode('documentacion')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === 'documentacion'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  Documentación
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('fisico')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === 'fisico'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  Físico
                </button>
              </div>
              <button
                type="button"
                onClick={() => router.push('/vehiculos/crear')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Vehículo
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder={
                  viewMode === 'documentacion'
                    ? 'Buscar por modelo, placa, marca, VIN...'
                    : 'Buscar por transmisión, color, número de motor...'
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <table className="w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  {viewMode === 'documentacion' ? (
                    <>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Modelo</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Placa</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Marca</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">VIN</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cilindraje</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Chasis</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo de Combustible</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Transmisión</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Capacidad de Carga</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Color</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Caballos de Potencia</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Potencia del Motor</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de Motor</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de Asientos</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de Puertas</th>
                    </>
                  )}
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentVehiculos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={viewMode === 'documentacion' ? 9 : 10}
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      No hay vehículos disponibles
                    </td>
                  </tr>
                ) : (
                  currentVehiculos.map((vehiculo, index) => (
                    <tr key={vehiculo.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                      {viewMode === 'documentacion' ? (
                        <>
                          <td className="px-4 py-2">{vehiculo.modelo}</td>
                          <td className="px-4 py-2">{vehiculo.placa}</td>
                          <td className="px-4 py-2">{vehiculo.marca}</td>
                          <td className="px-4 py-2">{vehiculo.vin}</td>
                          <td className="px-4 py-2">{vehiculo.cilindraje}</td>
                          <td className="px-4 py-2">{vehiculo.chasis}</td>
                          <td className="px-4 py-2">{vehiculo.tipo_combustible_nombre || '-'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2">{vehiculo.transmision}</td>
                          <td className="px-4 py-2">{vehiculo.capacidad_carga}</td>
                          <td className="px-4 py-2">{vehiculo.color}</td>
                          <td className="px-4 py-2">{vehiculo.caballo_potencia}</td>
                          <td className="px-4 py-2">{vehiculo.potencia_motor}</td>
                          <td className="px-4 py-2">{vehiculo.numero_motor}</td>
                          <td className="px-4 py-2">{vehiculo.numero_asientos}</td>
                          <td className="px-4 py-2">{vehiculo.numero_puertas}</td>
                        </>
                      )}
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/vehiculos/ver/${vehiculo.id}`)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/vehiculos/editar/${vehiculo.id}`)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVehiculoToDelete(vehiculo);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all duration-300"
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
                type="button"
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
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Siguiente
              </button>
            </div>

            {isDeleteModalOpen && vehiculoToDelete && (
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
                    transition-all duration-300 hover:scale-105 text-center"
                  >
                    Confirmar Eliminación
                  </h2>
                  <p className="text-center text-gray-700 mb-4">
                    ¿Estás seguro de que deseas eliminar el vehículo {vehiculoToDelete.marca} {vehiculoToDelete.modelo} (
                    {vehiculoToDelete.placa})?
                  </p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
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