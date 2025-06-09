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

type Vehiculo = {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
};

export default function Conductores() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conductorData, setConductorData] = useState({
    nombre: '',
    numero_licencia: '',
    telefono: '',
    correo: '',
    vehiculo_id: 0,
    tipo_licencia: '',
    fecha_emision: '',
    fecha_expiracion: '',
    tipo_sangre: '',
  });
  const [conductorToUpdate, setConductorToUpdate] = useState<Conductor | null>(null);
  const [conductorToDelete, setConductorToDelete] = useState<Conductor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pathname = usePathname();

  // Función para formatear fechas al formato YYYY-MM-DD
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''; // Maneja casos donde la fecha es null o undefined
    // Si la fecha está en formato DD/MM/YYYY, conviértela a YYYY-MM-DD
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString; // Asume que ya está en formato YYYY-MM-DD
  };

  const fetchConductores = useCallback(async () => {
    const response = await fetch(`/api/conductores?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setConductores(data);
    }
  }, [currentPage, itemsPerPage]);

  const fetchVehiculos = useCallback(async () => {
    const response = await fetch('/api/vehiculos');
    if (response.ok) {
      const data = await response.json();
      setVehiculos(data);
    }
  }, []);

  useEffect(() => {
    fetchConductores();
    fetchVehiculos();
  }, [fetchConductores, fetchVehiculos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConductorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', conductorData.nombre);
    formData.append('numero_licencia', conductorData.numero_licencia);
    formData.append('telefono', conductorData.telefono);
    formData.append('correo', conductorData.correo);
    formData.append('vehiculo_id', String(conductorData.vehiculo_id));
    formData.append('tipo_licencia', conductorData.tipo_licencia);
    formData.append('fecha_emision', conductorData.fecha_emision);
    formData.append('fecha_expiracion', conductorData.fecha_expiracion);
    formData.append('tipo_sangre', conductorData.tipo_sangre);

    const response = await fetch('/api/conductores', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newConductor = await response.json();
      alert('Conductor agregado exitosamente');
      setConductores((prev) => [...prev, newConductor.data]);
      setConductorData({
        nombre: '',
        numero_licencia: '',
        telefono: '',
        correo: '',
        vehiculo_id: 0,
        tipo_licencia: '',
        fecha_emision: '',
        fecha_expiracion: '',
        tipo_sangre: '',
      });
      setIsAddModalOpen(false);
      fetchConductores();
    } else {
      alert('Error al agregar el conductor');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conductorToUpdate) {
      const formData = new FormData();
      formData.append('id', String(conductorToUpdate.id));
      formData.append('nombre', conductorData.nombre);
      formData.append('numero_licencia', conductorData.numero_licencia);
      formData.append('telefono', conductorData.telefono);
      formData.append('correo', conductorData.correo);
      formData.append('tipo_licencia', conductorData.tipo_licencia);
      formData.append('fecha_emision', conductorData.fecha_emision);
      formData.append('fecha_expiracion', conductorData.fecha_expiracion);
      formData.append('vehiculo_id', String(conductorData.vehiculo_id));
      formData.append('tipo_sangre', conductorData.tipo_sangre);

      const response = await fetch('/api/conductores', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedConductor = await response.json();
        alert('Conductor actualizado exitosamente');
        setConductores((prev) =>
          prev.map((conductor) =>
            conductor.id === updatedConductor.data.id ? updatedConductor.data : conductor
          )
        );
        setConductorData({
          nombre: '',
          numero_licencia: '',
          telefono: '',
          correo: '',
          vehiculo_id: 0,
          tipo_licencia: '',
          fecha_emision: '',
          fecha_expiracion: '',
          tipo_sangre: '',
        });
        setIsUpdateModalOpen(false);
        fetchConductores();
      } else {
        alert('Error al actualizar el conductor');
      }
    }
  };

  const handleDelete = async () => {
    if (conductorToDelete) {
      const response = await fetch(`/api/conductores/${conductorToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Conductor eliminado exitosamente');
        setConductores((prev) => prev.filter((conductor) => conductor.id !== conductorToDelete.id));
        setIsDeleteModalOpen(false);
        fetchConductores();
      } else {
        alert('Error al eliminar el conductor');
      }
    }
  };

  const filteredConductores = conductores.filter((conductor) =>
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
    return date.toLocaleString('es-ES', {
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
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1
                className="text-4xl font-bold text-gray-900 mb-4
                bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
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
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Agregar Conductor
              </button>
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
                className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nº Licencia</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Teléfono</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Correo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Vehículo</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo licencia</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha de emisión</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha de expiración</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo de sangre</th>
                  <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentConductores.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
                      No hay conductores disponibles
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
                        <button
                          onClick={() => {
                            console.log('Conductor seleccionado:', conductor);
                            setConductorToUpdate(conductor);
                            setConductorData({
                              nombre: conductor.nombre,
                              numero_licencia: conductor.numero_licencia,
                              telefono: conductor.telefono,
                              correo: conductor.correo,
                              tipo_licencia: conductor.tipo_licencia,
                              fecha_emision: formatDateForInput(conductor.fecha_emision),
                              fecha_expiracion: formatDateForInput(conductor.fecha_expiracion),
                              tipo_sangre: conductor.tipo_sangre,
                              vehiculo_id: conductor.vehiculo_id,
                            });
                            setIsUpdateModalOpen(true);
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setConductorToDelete(conductor);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
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

            {/* Modal para agregar conductor */}
            {isAddModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsAddModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-2/5 border">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      Agregar Conductor
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitAdd}>
                    <div className="mb-4">
                      <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="nombre">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Ejemplo: Juan Pérez"
                        value={conductorData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="numero_licencia">
                          Número de Licencia
                        </label>
                        <input
                          type="text"
                          id="numero_licencia"
                          name="numero_licencia"
                          placeholder="Ejemplo: A12345678"
                          value={conductorData.numero_licencia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="tipo_licencia">
                          Tipo de licencia
                        </label>
                        <input
                          type="text"
                          id="tipo_licencia"
                          name="tipo_licencia"
                          placeholder="Ejemplo: Pesada"
                          value={conductorData.tipo_licencia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="fecha_emision">
                          Fecha de emisión
                        </label>
                        <input
                          type="date"
                          id="fecha_emision"
                          name="fecha_emision"
                          value={conductorData.fecha_emision}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="fecha_expiracion">
                          Fecha de expiración
                        </label>
                        <input
                          type="date"
                          id="fecha_expiracion"
                          name="fecha_expiracion"
                          value={conductorData.fecha_expiracion}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="correo">
                          Correo
                        </label>
                        <input
                          type="email"
                          id="correo"
                          name="correo"
                          placeholder="Ejemplo: juan.perez@empresa.com"
                          value={conductorData.correo}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="vehiculo_id">
                          Vehículo
                        </label>
                        <select
                          id="vehiculo_id"
                          name="vehiculo_id"
                          value={conductorData.vehiculo_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        >
                          <option value={0} disabled>
                            Seleccione un vehículo
                          </option>
                          {vehiculos.map((vehiculo) => (
                            <option key={vehiculo.id} value={vehiculo.id}>
                              {vehiculo.modelo} - {vehiculo.placa} - {vehiculo.marca}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="telefono">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          placeholder="Ejemplo: 8888-8888"
                          value={conductorData.telefono}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="tipo_sangre">
                          Tipo de sangre
                        </label>
                        <input
                          type="text"
                          id="tipo_sangre"
                          name="tipo_sangre"
                          placeholder="Ejemplo: O+"
                          value={conductorData.tipo_sangre}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal para actualizar conductor */}
            {isUpdateModalOpen && conductorToUpdate && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsUpdateModalOpen(false);
                  }
                }}
              >
                <div className="bg-white p-6 rounded-lg shadow-xl w-2/5 border">
                  <div className="text-center">
                    <h2
                      className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                      bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                      transition-all duration-300 hover:scale-105"
                    >
                      Actualizar Conductor
                    </h2>
                  </div>
                  <form onSubmit={handleSubmitUpdate}>
                    <div className="mb-4">
                      <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="nombre">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Ejemplo: Juan Pérez"
                        value={conductorData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="numero_licencia">
                          Número de Licencia
                        </label>
                        <input
                          type="text"
                          id="numero_licencia"
                          name="numero_licencia"
                          placeholder="Ejemplo: A12345678"
                          value={conductorData.numero_licencia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="tipo_licencia">
                          Tipo de licencia
                        </label>
                        <input
                          type="text"
                          id="tipo_licencia"
                          name="tipo_licencia"
                          placeholder="Ejemplo: Pesada"
                          value={conductorData.tipo_licencia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="fecha_emision">
                          Fecha de emisión
                        </label>
                        <input
                          type="date"
                          id="fecha_emision"
                          name="fecha_emision"
                          value={conductorData.fecha_emision}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="fecha_expiracion">
                          Fecha de expiración
                        </label>
                        <input
                          type="date"
                          id="fecha_expiracion"
                          name="fecha_expiracion"
                          value={conductorData.fecha_expiracion}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="correo">
                          Correo
                        </label>
                        <input
                          type="email"
                          id="correo"
                          name="correo"
                          placeholder="Ejemplo: juan.perez@empresa.com"
                          value={conductorData.correo}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="vehiculo_id">
                          Vehículo
                        </label>
                        <select
                          id="vehiculo_id"
                          name="vehiculo_id"
                          value={conductorData.vehiculo_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        >
                          <option value={0} disabled>
                            Seleccione un vehículo
                          </option>
                          {vehiculos.map((vehiculo) => (
                            <option key={vehiculo.id} value={vehiculo.id}>
                              {vehiculo.modelo} - {vehiculo.placa} - {vehiculo.marca}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="telefono">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          placeholder="Ejemplo: 8888-8888"
                          value={conductorData.telefono}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-center font-bold text-gray-700 mb-2" htmlFor="tipo_sangre">
                          Tipo de sangre
                        </label>
                        <input
                          type="text"
                          id="tipo_sangre"
                          name="tipo_sangre"
                          placeholder="Ejemplo: O+"
                          value={conductorData.tipo_sangre}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsUpdateModalOpen(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                    transition-all duration-300 hover:scale-105 text-center"
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
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
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