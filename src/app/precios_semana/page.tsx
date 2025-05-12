'use client';

import { useState, useEffect, useCallback } from 'react';
import NavbarMaxPay from '../components/NavbarMaxPay';
import MenuMain from '../components/MenuMain';

type PrecioVentaCombustible = {
  monedas_id: number;
  fecha_final: string;
  fecha_inicio: string;
  id: number;
  notas: string;
  precio_sucursal_ids: number;
  semana_year: number;
  monedas_nombre: string;
};

type Monedas = {
  id: number;
  moneda: string;
};

export default function PrecioVentaCombustible() {
  const [preciosVenta, setPreciosVenta] = useState<PrecioVentaCombustible[]>([]);
  const [monedasList, setMonedasList] = useState<Monedas[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [precioVentaData, setPrecioVentaData] = useState({
    monedas_id: 0,
    fecha_final: '',
    fecha_inicio: '',
    notas: '',
    precio_sucursal_ids: 0,
    semana_year: 0,
  });
  const [precioVentaToUpdate, setPrecioVentaToUpdate] = useState<PrecioVentaCombustible | null>(null);
  const [precioVentaToDelete, setPrecioVentaToDelete] = useState<PrecioVentaCombustible | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPreciosVenta = useCallback(async () => {
    const response = await fetch(`/api/precio_venta_combustible?page=${currentPage}&limit=${itemsPerPage}`);
    if (response.ok) {
      const data = await response.json();
      setPreciosVenta(data);
    }
  }, [currentPage, itemsPerPage]);

  const fetchMonedasList = useCallback(async () => {
    const response = await fetch('/api/monedas');
    if (response.ok) {
      const data = await response.json();
      setMonedasList(data);
    }
  }, []);

  useEffect(() => {
    fetchPreciosVenta();
    fetchMonedasList();
  }, [fetchPreciosVenta, fetchMonedasList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setPrecioVentaData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (value === 'on') : (name === 'monedas_id' || name === 'precio_sucursal_ids' || name === 'semana_year' ? parseInt(value) || 0 : value),
    }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!precioVentaData.monedas_id || !precioVentaData.fecha_inicio || !precioVentaData.fecha_final || !precioVentaData.notas || !precioVentaData.precio_sucursal_ids || !precioVentaData.semana_year) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formData = new FormData();
    formData.append('monedas_id', precioVentaData.monedas_id.toString());
    formData.append('fecha_final', precioVentaData.fecha_final);
    formData.append('fecha_inicio', precioVentaData.fecha_inicio);
    formData.append('notas', precioVentaData.notas);
    formData.append('precio_sucursal_ids', precioVentaData.precio_sucursal_ids.toString());
    formData.append('semana_year', precioVentaData.semana_year.toString());

    const response = await fetch('/api/precio_venta_combustible', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newPrecioVenta = await response.json();
      alert('Precio de venta agregado exitosamente');
      setPreciosVenta((prev) => [...prev, newPrecioVenta.data]);
      setPrecioVentaData({
        monedas_id: 0,
        fecha_final: '',
        fecha_inicio: '',
        notas: '',
        precio_sucursal_ids: 0,
        semana_year: 0,
      });
      setIsAddModalOpen(false);
      fetchPreciosVenta();
    } else {
      alert('Error al agregar el precio de venta');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (precioVentaToUpdate) {
      if (!precioVentaData.monedas_id || !precioVentaData.fecha_inicio || !precioVentaData.fecha_final || !precioVentaData.notas || !precioVentaData.precio_sucursal_ids || !precioVentaData.semana_year) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }
      const formData = new FormData();
      formData.append('id', String(precioVentaToUpdate.id));
      formData.append('monedas_id', precioVentaData.monedas_id.toString());
      formData.append('fecha_final', precioVentaData.fecha_final);
      formData.append('fecha_inicio', precioVentaData.fecha_inicio);
      formData.append('notas', precioVentaData.notas);
      formData.append('precio_sucursal_ids', precioVentaData.precio_sucursal_ids.toString());
      formData.append('semana_year', precioVentaData.semana_year.toString());

      const response = await fetch('/api/precio_venta_combustible', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedPrecioVenta = await response.json();
        alert('Precio de venta actualizado exitosamente');
        setPreciosVenta((prev) =>
          prev.map((precio) =>
            precio.id === updatedPrecioVenta.data.id ? updatedPrecioVenta.data : precio
          )
        );
        setPrecioVentaData({
          monedas_id: 0,
          fecha_final: '',
          fecha_inicio: '',
          notas: '',
          precio_sucursal_ids: 0,
          semana_year: 0,
        });
        setIsUpdateModalOpen(false);
        fetchPreciosVenta();
      } else {
        alert('Error al actualizar el precio de venta');
      }
    }
  };

  const handleDelete = async () => {
    if (precioVentaToDelete) {
      const response = await fetch(`/api/precio_venta_combustible/${precioVentaToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Precio de venta eliminado exitosamente');
        setPreciosVenta((prev) => prev.filter((precio) => precio.id !== precioVentaToDelete.id));
        setIsDeleteModalOpen(false);
        fetchPreciosVenta();
      } else {
        alert('Error al eliminar el precio de venta');
      }
    }
  };

  const filteredPreciosVenta = preciosVenta.filter((precio) =>
    Object.values(precio)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPreciosVenta = filteredPreciosVenta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPreciosVenta.length / itemsPerPage);

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

  return (
    <div className="min-h-screen flex">
      <NavbarMaxPay />
      <div className="flex-1 flex flex-col">
        <MenuMain />
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2 tracking-tight 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 hover:scale-105 text-center"
            >
              Gestión de Precios de Venta de Combustible
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg 
              transition-all duration-300 hover:shadow-md mx-auto"
            >
              Configura los precios de venta de combustible disponibles.
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Agregar Precio de Venta
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar precios de venta..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="mt-6 w-full table-auto border-collapse bg-gray-100 border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2 text-center">Monedas</th>
                <th className="px-4 py-2 text-center">Fecha Inicio</th>
                <th className="px-4 py-2 text-center">Fecha Final</th>
                <th className="px-4 py-2 text-center">Notas</th>
                <th className="px-4 py-2 text-center">Sucursales</th>
                <th className="px-4 py-2 text-center">Semana Año</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPreciosVenta.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-center">
                    No hay precios de venta disponibles
                  </td>
                </tr>
              ) : (
                currentPreciosVenta.map((precio, index) => (
                  <tr key={precio.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{precio.monedas_nombre}</td>
                    <td className="px-4 py-2 text-center">{precio.fecha_inicio}</td>
                    <td className="px-4 py-2 text-center">{precio.fecha_final}</td>
                    <td className="px-4 py-2 text-center">{precio.notas}</td>
                    <td className="px-4 py-2 text-center">{precio.precio_sucursal_ids}</td>
                    <td className="px-4 py-2 text-center">{precio.semana_year}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setPrecioVentaToUpdate(precio);
                          setPrecioVentaData({
                            monedas_id: precio.monedas_id,
                            fecha_final: precio.fecha_final,
                            fecha_inicio: precio.fecha_inicio,
                            notas: precio.notas,
                            precio_sucursal_ids: precio.precio_sucursal_ids,
                            semana_year: precio.semana_year,
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setPrecioVentaToDelete(precio);
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Siguiente
            </button>
          </div>
          {isAddModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAddModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Agregar Precio de Venta</h2>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="monedas_id">
                      Monedas
                    </label>
                    <select
                      id="monedas_id"
                      name="monedas_id"
                      value={precioVentaData.monedas_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Monedas</option>
                      {monedasList.map((monedas) => (
                        <option key={monedas.id} value={monedas.id}>
                          {monedas.moneda}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="fecha_inicio">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        id="fecha_inicio"
                        name="fecha_inicio"
                        value={precioVentaData.fecha_inicio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="fecha_final">
                        Fecha Final
                      </label>
                      <input
                        type="date"
                        id="fecha_final"
                        name="fecha_final"
                        value={precioVentaData.fecha_final}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="notas">
                      Notas
                    </label>
                    <textarea
                      id="notas"
                      name="notas"
                      placeholder="Ejemplo: Precio especial"
                      value={precioVentaData.notas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="precio_sucursal_ids">
                      Precios
                    </label>
                    <input
                      type="number"
                      id="precio_sucursal_ids"
                      name="precio_sucursal_ids"
                      placeholder="Ejemplo: 1"
                      value={precioVentaData.precio_sucursal_ids}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="semana_year">
                      Semana
                    </label>
                    <input
                      type="number"
                      id="semana_year"
                      name="semana_year"
                      placeholder="Ejemplo: 2025-20"
                      value={precioVentaData.semana_year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isUpdateModalOpen && precioVentaToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Actualizar Precio de Venta</h2>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="monedas_id">
                      Monedas
                    </label>
                    <select
                      id="monedas_id"
                      name="monedas_id"
                      value={precioVentaData.monedas_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Monedas</option>
                      {monedasList.map((monedas) => (
                        <option key={monedas.id} value={monedas.id}>
                          {monedas.moneda}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="fecha_inicio">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        id="fecha_inicio"
                        name="fecha_inicio"
                        value={precioVentaData.fecha_inicio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="fecha_final">
                        Fecha Final
                      </label>
                      <input
                        type="date"
                        id="fecha_final"
                        name="fecha_final"
                        value={precioVentaData.fecha_final}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="notas">
                      Notas
                    </label>
                    <textarea
                      id="notas"
                      name="notas"
                      placeholder="Ejemplo: Precio especial"
                      value={precioVentaData.notas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="precio_sucursal_ids">
                      Precios
                    </label>
                    <input
                      type="number"
                      id="precio_sucursal_ids"
                      name="precio_sucursal_ids"
                      placeholder="Ejemplo: 1"
                      value={precioVentaData.precio_sucursal_ids}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="semana_year">
                      Semana
                    </label>
                    <input
                      type="number"
                      id="semana_year"
                      name="semana_year"
                      placeholder="Ejemplo: 2025-20"
                      value={precioVentaData.semana_year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsUpdateModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && precioVentaToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Precio de Venta</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar el precio de venta con notas {precioVentaToDelete.notas}?
                </p>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
  );
}