'use client';

import { useState, useEffect } from 'react';
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
};

type Canal = {
  id: number;
  canal: string;
};

type TipoCombustible = {
  id: number;
  name: string;
};

export default function Transacciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [tiposCombustible, setTiposCombustible] = useState<TipoCombustible[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transaccionData, setTransaccionData] = useState({
    cliente_id: 0,
    establecimiento_id: 0,
    fecha: '',
    monto: 0,
    terminal_id: 0,
    unidades: 0,
    descuento: 0,
    canal_id: 0,
    tipo_combustible_id: 0,
  });
  const [transaccionToUpdate, setTransaccionToUpdate] = useState<Transaccion | null>(null);
  const [transaccionToDelete, setTransaccionToDelete] = useState<Transaccion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

    const fetchTiposCombustible = async () => {
      try {
        const response = await fetch('/api/tipos_combustible');
        if (response.ok) {
          const data = await response.json();
          console.log('TiposCombustible data:', data);
          const tiposArray = data.data || data; // Adjust based on API response structure
          if (Array.isArray(tiposArray)) {
            setTiposCombustible(tiposArray);
          } else {
            console.error('Expected an array for tiposCombustible, received:', tiposArray);
            setTiposCombustible([]);
          }
        } else {
          console.error('Failed to fetch tiposCombustible:', response.statusText);
          setTiposCombustible([]);
        }
      } catch (error) {
        console.error('Error fetching tiposCombustible:', error);
        setTiposCombustible([]);
      }
    };

    fetchTransacciones();
    fetchCanales();
    fetchTiposCombustible();
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransaccionData((prevData) => ({
      ...prevData,
      [name]:
        name === 'cliente_id' ||
        name === 'establecimiento_id' ||
        name === 'monto' ||
        name === 'terminal_id' ||
        name === 'unidades' ||
        name === 'descuento' ||
        name === 'canal_id' ||
        name === 'tipo_combustible_id'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('cliente_id', String(transaccionData.cliente_id));
    formData.append('establecimiento_id', String(transaccionData.establecimiento_id));
    formData.append('fecha', transaccionData.fecha);
    formData.append('monto', String(transaccionData.monto));
    formData.append('terminal_id', String(transaccionData.terminal_id));
    formData.append('unidades', String(transaccionData.unidades));
    formData.append('descuento', String(transaccionData.descuento));
    formData.append('canal_id', String(transaccionData.canal_id));
    formData.append('tipo_combustible_id', String(transaccionData.tipo_combustible_id));

    try {
      const response = await fetch('/api/transacciones', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newTransaccion = await response.json();
        alert('Transacción agregada exitosamente');
        setTransacciones((prev) => [...prev, newTransaccion.data]);
        setTransaccionData({
          cliente_id: 0,
          establecimiento_id: 0,
          fecha: '',
          monto: 0,
          terminal_id: 0,
          unidades: 0,
          descuento: 0,
          canal_id: 0,
          tipo_combustible_id: 0,
        });
        setIsAddModalOpen(false);
      } else {
        alert('Error al agregar la transacción');
      }
    } catch (error) {
      console.error('Error submitting add transaccion:', error);
      alert('Error al agregar la transacción');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transaccionToUpdate) {
      const formData = new FormData();
      formData.append('id', String(transaccionToUpdate.id));
      formData.append('cliente_id', String(transaccionData.cliente_id));
      formData.append('establecimiento_id', String(transaccionData.establecimiento_id));
      formData.append('fecha', transaccionData.fecha);
      formData.append('monto', String(transaccionData.monto));
      formData.append('terminal_id', String(transaccionData.terminal_id));
      formData.append('unidades', String(transaccionData.unidades));
      formData.append('descuento', String(transaccionData.descuento));
      formData.append('canal_id', String(transaccionData.canal_id));
      formData.append('tipo_combustible_id', String(transaccionData.tipo_combustible_id));

      try {
        const response = await fetch('/api/transacciones', {
          method: 'PUT',
          body: formData,
        });

        if (response.ok) {
          const updatedTransaccion = await response.json();
          alert('Transacción actualizada exitosamente');
          setTransacciones((prev) =>
            prev.map((transaccion) =>
              transaccion.id === updatedTransaccion.data.id ? updatedTransaccion.data : transaccion
            )
          );
          setTransaccionData({
            cliente_id: 0,
            establecimiento_id: 0,
            fecha: '',
            monto: 0,
            terminal_id: 0,
            unidades: 0,
            descuento: 0,
            canal_id: 0,
            tipo_combustible_id: 0,
          });
          setIsUpdateModalOpen(false);
        } else {
          alert('Error al actualizar la transacción');
        }
      } catch (error) {
        console.error('Error submitting update transaccion:', error);
        alert('Error al actualizar la transacción');
      }
    }
  };

  const handleDelete = async () => {
    if (transaccionToDelete) {
      try {
        const response = await fetch(`/api/transacciones/${transaccionToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Transacción eliminada exitosamente');
          setTransacciones((prev) => prev.filter((transaccion) => transaccion.id !== transaccionToDelete.id));
          setIsDeleteModalOpen(false);
        } else {
          alert('Error al eliminar la transacción');
        }
      } catch (error) {
        console.error('Error deleting transaccion:', error);
        alert('Error al eliminar la transacción');
      }
    }
  };

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
    <div className="min-h-screen flex">
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
          <div className="flex justify-between mb-2" hidden>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Agregar Transacción
            </button>
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
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Establecimiento</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Terminal</th>
                <th className="px-4 py-2">Número de Tarjeta</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Unidades</th>
                <th className="px-4 py-2">Descuento</th>
                <th className="px-4 py-2">Canal</th>
                <th className="px-4 py-2">Tipo Combustible</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTransacciones.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-2 text-center">
                    No hay transacciones disponibles
                  </td>
                </tr>
              ) : (
                currentTransacciones.map((transaccion, index) => (
                  <tr className="hover:bg-gray-50" key={transaccion.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{transaccion.cliente_nombre ?? 'Sin cliente'}</td>
                    <td className="px-4 py-2 text-center">{transaccion.establecimiento_nombre}</td>
                    <td className="px-4 py-2">{new Date(transaccion.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-center">{transaccion.monto.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{transaccion.terminal_nombre}</td>
                    <td className="px-4 py-2 text-center">{transaccion.numero_tarjeta ?? 'Sin tarjeta'}</td>
                 
                       <td className="px-4 py-2 text-center">{transaccion.estado  ? 'Validada' : 'Cancelada'}</td>
                    <td className="px-4 py-2 text-center">
                      {transaccion.unidades != null ? transaccion.unidades.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {transaccion.descuento != null ? transaccion.descuento.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">{transaccion.canal_nombre}</td>
                    <td className="px-4 py-2 text-center">{transaccion.tipo_combustible_nombre}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setTransaccionToUpdate(transaccion);
                          setTransaccionData({
                            cliente_id: 0,
                            establecimiento_id: 0,
                            fecha: transaccion.fecha.split('T')[0],
                            monto: transaccion.monto,
                            terminal_id: 0,
                            unidades: transaccion.unidades,
                            descuento: transaccion.descuento,
                            canal_id: 0,
                            tipo_combustible_id: 0,
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setTransaccionToDelete(transaccion);
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg"
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
          {isAddModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAddModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h3 className="text-xl font-semibold mb-4">Agregar Transacción</h3>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="cliente_id">
                      Cliente ID
                    </label>
                    <input
                      type="number"
                      id="cliente_id"
                      name="cliente_id"
                      value={transaccionData.cliente_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="establecimiento_id">
                      Establecimiento ID
                    </label>
                    <input
                      type="number"
                      id="establecimiento_id"
                      name="establecimiento_id"
                      value={transaccionData.establecimiento_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="fecha">
                      Fecha
                    </label>
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      value={transaccionData.fecha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="monto">
                      Monto
                    </label>
                    <input
                      type="number"
                      id="monto"
                      name="monto"
                      value={transaccionData.monto}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="terminal_id">
                      Terminal ID
                    </label>
                    <input
                      type="number"
                      id="terminal_id"
                      name="terminal_id"
                      value={transaccionData.terminal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="unidades">
                      Unidades
                    </label>
                    <input
                      type="number"
                      id="unidades"
                      name="unidades"
                      value={transaccionData.unidades}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="descuento">
                      Descuento
                    </label>
                    <input
                      type="number"
                      id="descuento"
                      name="descuento"
                      value={transaccionData.descuento}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="canal_id">
                      Canal
                    </label>
                    <select
                      id="canal_id"
                      name="canal_id"
                      value={transaccionData.canal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="0">Seleccione un canal</option>
                      {Array.isArray(canales) && canales.length > 0 ? (
                        canales.map((canal) => (
                          <option key={canal.id} value={canal.id}>
                            {canal.canal}
                          </option>
                        ))
                      ) : (
                        <option disabled>No hay canales disponibles</option>
                      )}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="tipo_combustible_id">
                      Tipo Combustible
                    </label>
                    <select
                      id="tipo_combustible_id"
                      name="tipo_combustible_id"
                      value={transaccionData.tipo_combustible_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="0">Seleccione un tipo de combustible</option>
                      {Array.isArray(tiposCombustible) && tiposCombustible.length > 0 ? (
                        tiposCombustible.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No hay tipos de combustible disponibles</option>
                      )}
                    </select>
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
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isUpdateModalOpen && transaccionToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg w-1/3">
                <h3 className="text-xl font-semibold mb-4">Actualizar Transacción</h3>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="cliente_id">
                      Cliente ID
                    </label>
                    <input
                      type="number"
                      id="cliente_id"
                      name="cliente_id"
                      value={transaccionData.cliente_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="establecimiento_id">
                      Establecimiento ID
                    </label>
                    <input
                      type="number"
                      id="establecimiento_id"
                      name="establecimiento_id"
                      value={transaccionData.establecimiento_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="fecha">
                      Fecha
                    </label>
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      value={transaccionData.fecha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="monto">
                      Monto
                    </label>
                    <input
                      type="number"
                      id="monto"
                      name="monto"
                      value={transaccionData.monto}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="terminal_id">
                      Terminal ID
                    </label>
                    <input
                      type="number"
                      id="terminal_id"
                      name="terminal_id"
                      value={transaccionData.terminal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="unidades">
                      Unidades
                    </label>
                    <input
                      type="number"
                      id="unidades"
                      name="unidades"
                      value={transaccionData.unidades}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="descuento">
                      Descuento
                    </label>
                    <input
                      type="number"
                      id="descuento"
                      name="descuento"
                      value={transaccionData.descuento}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="canal_id">
                      Canal
                    </label>
                    <select
                      id="canal_id"
                      name="canal_id"
                      value={transaccionData.canal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="0">Seleccione un canal</option>
                      {Array.isArray(canales) && canales.length > 0 ? (
                        canales.map((canal) => (
                          <option key={canal.id} value={canal.id}>
                            {canal.canal}
                          </option>
                        ))
                      ) : (
                        <option disabled>No hay canales disponibles</option>
                      )}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="tipo_combustible_id">
                      Tipo Combustible
                    </label>
                    <select
                      id="tipo_combustible_id"
                      name="tipo_combustible_id"
                      value={transaccionData.tipo_combustible_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="0">Seleccione un tipo de combustible</option>
                      {Array.isArray(tiposCombustible) && tiposCombustible.length > 0 ? (
                        tiposCombustible.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No hay tipos de combustible disponibles</option>
                      )}
                    </select>
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
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && transaccionToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Eliminar Transacción</h3>
                <p>¿Estás seguro de que deseas eliminar esta transacción?</p>
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