'use client';

import { useState, useEffect, useCallback } from 'react';
import NavbarMaxPay from '../components/NavbarMaxPay';
import MenuMain from '../components/MenuMain';

type Descuento = {
  active: boolean;
  create_date: string;
  create_uid: number;
  descuento: number;
  display_name: string;
  es_descuento_pista: boolean;
  estacion_id: number;
  id: number;
  partner_id: number; // Cambiado de cliente_id a partner_id para consistencia con el backend
  tipo_combustible_id: number;
  write_date: string;
  write_uid: number;
  estacion_nombre: string;
  cliente_nombre: string;
  tipo_combustible_nombre: string;
  create_uid_name: string; // Nuevo campo para el nombre del creador
  write_uid_name: string; // Nuevo campo para el nombre del modificador
};

type Costo = {
  id: number;
  nombre_centro_costos: string;
};

type Cliente = {
  id: number;
  nombre: string;
};

type TipoCombustible = {
  id: number;
  name: string;
};

export default function Descuentos() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [costos, setCostos] = useState<Costo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tipoCombustibles, setTipoCombustibles] = useState<TipoCombustible[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [descuentoData, setDescuentoData] = useState({
    active: true,
    create_date: '',
    create_uid: 0,
    descuento: 0,
    display_name: '',
    es_descuento_pista: false,
    estacion_id: 0,
    partner_id: 0, // Cambiado de cliente_id a partner_id
    tipo_combustible_id: 0,
    write_date: '',
    write_uid: 0,
  });
  const [descuentoToUpdate, setDescuentoToUpdate] = useState<Descuento | null>(null);
  const [descuentoToDelete, setDescuentoToDelete] = useState<Descuento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDescuentos = useCallback(async () => {
    try {
      const response = await fetch(`/api/descuentos?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Descuentos API response:', result);
        if (result && Array.isArray(result.data)) {
          setDescuentos(result.data);
          console.log('Descuentos data set:', result.data);
        } else {
          console.error('Descuentos data is not an array:', result);
          setDescuentos([]);
        }
      } else {
        console.error('Error fetching Descuentos:', response.status, await response.text());
        setDescuentos([]);
      }
    } catch (error) {
      console.error('Error in fetchDescuentos:', error);
      setDescuentos([]);
    }
  }, [currentPage, itemsPerPage]);

  const fetchCostos = useCallback(async () => {
    try {
      const response = await fetch('/api/costos');
      if (response.ok) {
        const result = await response.json();
        console.log('Costos API response:', result);
        if (Array.isArray(result)) {
          setCostos(result);
          console.log('Costos data set:', result);
        } else {
          console.error('Costos data is not an array:', result);
          setCostos([]);
        }
      } else {
        console.error('Error fetching Costos:', response.status, await response.text());
        setCostos([]);
      }
    } catch (error) {
      console.error('Error in fetchCostos:', error);
      setCostos([]);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) {
        const result = await response.json();
        console.log('Clientes API response:', result);
        if (Array.isArray(result)) {
          setClientes(result);
          console.log('Clientes data set:', result);
        } else if (result && Array.isArray(result.data)) {
          setClientes(result.data);
          console.log('Clientes data set:', result.data);
        } else {
          console.error('Clientes data is not an array:', result);
          setClientes([]);
        }
      } else {
        console.error('Error fetching Clientes:', response.status, await response.text());
        setClientes([]);
      }
    } catch (error) {
      console.error('Error in fetchClientes:', error);
      setClientes([]);
    }
  }, []);

  const fetchTipoCombustibles = useCallback(async () => {
    try {
      const response = await fetch('/api/tipos_combustible');
      if (response.ok) {
        const result = await response.json();
        console.log('TipoCombustibles API response:', result);
        if (result && Array.isArray(result.data)) {
          setTipoCombustibles(result.data);
          console.log('TipoCombustibles data set:', result.data);
        } else {
          console.error('TipoCombustibles data is not an array:', result);
          setTipoCombustibles([]);
        }
      } else {
        console.error('Error fetching TipoCombustibles:', response.status, await response.text());
        setTipoCombustibles([]);
      }
    } catch (error) {
      console.error('Error in fetchTipoCombustibles:', error);
      setTipoCombustibles([]);
    }
  }, []);

  useEffect(() => {
    fetchDescuentos();
    fetchCostos();
    fetchClientes();
    fetchTipoCombustibles();
  }, [fetchDescuentos, fetchCostos, fetchClientes, fetchTipoCombustibles]);

  useEffect(() => {
    console.log('Current costos state:', costos);
    console.log('Current clientes state:', clientes);
    console.log('Current tipoCombustibles state:', tipoCombustibles);
  }, [costos, clientes, tipoCombustibles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setDescuentoData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'create_uid' ||
            name === 'descuento' ||
            name === 'estacion_id' ||
            name === 'partner_id' || // Cambiado de cliente_id a partner_id
            name === 'tipo_combustible_id' ||
            name === 'write_uid'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descuentoData.display_name || !descuentoData.estacion_id || !descuentoData.partner_id || !descuentoData.tipo_combustible_id || !descuentoData.descuento) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formData = new FormData();
    formData.append('active', descuentoData.active.toString());
    formData.append('descuento', descuentoData.descuento.toString());
    formData.append('display_name', descuentoData.display_name);
    formData.append('es_descuento_pista', descuentoData.es_descuento_pista.toString());
    formData.append('estacion_id', descuentoData.estacion_id.toString());
    formData.append('partner_id', descuentoData.partner_id.toString()); // Cambiado de cliente_id a partner_id
    formData.append('tipo_combustible_id', descuentoData.tipo_combustible_id.toString());

    const response = await fetch('/api/descuentos', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newDescuento = await response.json();
      alert('Descuento agregado exitosamente');
      setDescuentos((prev) => [...prev, newDescuento.data]);
      setDescuentoData({
        active: true,
        create_date: '',
        create_uid: 0,
        descuento: 0,
        display_name: '',
        es_descuento_pista: false,
        estacion_id: 0,
        partner_id: 0, // Cambiado de cliente_id a partner_id
        tipo_combustible_id: 0,
        write_date: '',
        write_uid: 0,
      });
      setIsAddModalOpen(false);
      fetchDescuentos();
    } else {
      alert('Error al agregar el descuento');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (descuentoToUpdate) {
      if (!descuentoData.display_name || !descuentoData.estacion_id || !descuentoData.partner_id || !descuentoData.tipo_combustible_id || !descuentoData.descuento) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }
      const formData = new FormData();
      formData.append('id', String(descuentoToUpdate.id));
      formData.append('active', descuentoData.active.toString());
      formData.append('descuento', descuentoData.descuento.toString());
      formData.append('display_name', descuentoData.display_name);
      formData.append('es_descuento_pista', descuentoData.es_descuento_pista.toString());
      formData.append('estacion_id', descuentoData.estacion_id.toString());
      formData.append('partner_id', descuentoData.partner_id.toString()); // Cambiado de cliente_id a partner_id
      formData.append('tipo_combustible_id', descuentoData.tipo_combustible_id.toString());

      const response = await fetch('/api/descuentos', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedDescuento = await response.json();
        alert('Descuento actualizado exitosamente');
        setDescuentos((prev) =>
          prev.map((descuento) =>
            descuento.id === updatedDescuento.data.id ? updatedDescuento.data : descuento
          )
        );
        setDescuentoData({
          active: true,
          create_date: '',
          create_uid: 0,
          descuento: 0,
          display_name: '',
          es_descuento_pista: false,
          estacion_id: 0,
          partner_id: 0, // Cambiado de cliente_id a partner_id
          tipo_combustible_id: 0,
          write_date: '',
          write_uid: 0,
        });
        setIsUpdateModalOpen(false);
        fetchDescuentos();
      } else {
        alert('Error al actualizar el descuento');
      }
    }
  };

  const handleDelete = async () => {
    if (descuentoToDelete) {
      const response = await fetch(`/api/descuentos?id=${descuentoToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Descuento eliminado exitosamente');
        setDescuentos((prev) => prev.filter((descuento) => descuento.id !== descuentoToDelete.id));
        setIsDeleteModalOpen(false);
        fetchDescuentos();
      } else {
        alert('Error al eliminar el descuento');
      }
    }
  };

  const filteredDescuentos = descuentos.filter((descuento) =>
    Object.values(descuento)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDescuentos = filteredDescuentos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDescuentos.length / itemsPerPage);

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
              Gestión de Descuentos
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg 
              transition-all duration-300 hover:shadow-md mx-auto"
            >
              Configura los descuentos disponibles para los clientes.
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Agregar Descuento
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar descuentos..."
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
                <th className="px-4 py-2 text-center">Activo</th>
                <th className="px-4 py-2 text-center">Descuento</th>
                <th className="px-4 py-2 text-center">Nombre para Mostrar</th>
                <th className="px-4 py-2 text-center">Descuento en Pista</th>
                <th className="px-4 py-2 text-center">Estación</th>
                <th className="px-4 py-2 text-center">Cliente</th>
                <th className="px-4 py-2 text-center">Tipo de Combustible</th>
                <th className="px-4 py-2 text-center">Fecha Creación</th>
                <th className="px-4 py-2 text-center">Creado Por</th>
                <th className="px-4 py-2 text-center">Fecha Modificación</th>
                <th className="px-4 py-2 text-center">Modificado Por</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentDescuentos.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-2 text-center">
                    No hay descuentos disponibles
                  </td>
                </tr>
              ) : (
                currentDescuentos.map((descuento, index) => (
                  <tr key={descuento.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{descuento.active ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2 text-center">{descuento.descuento}</td>
                    <td className="px-4 py-2 text-center">{descuento.display_name}</td>
                    <td className="px-4 py-2 text-center">{descuento.es_descuento_pista ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2 text-center">{descuento.estacion_nombre}</td>
                    <td className="px-4 py-2 text-center">{descuento.cliente_nombre}</td>
                    <td className="px-4 py-2 text-center">{descuento.tipo_combustible_nombre}</td>
                    <td className="px-4 py-2 text-center">{descuento.create_date}</td>
                    <td className="px-4 py-2 text-center">{descuento.create_uid_name || descuento.create_uid}</td>
                    <td className="px-4 py-2 text-center">{descuento.write_date}</td>
                    <td className="px-4 py-2 text-center">{descuento.write_uid_name || descuento.write_uid}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setDescuentoToUpdate(descuento);
                          setDescuentoData({
                            active: descuento.active,
                            create_date: descuento.create_date,
                            create_uid: descuento.create_uid,
                            descuento: descuento.descuento,
                            display_name: descuento.display_name,
                            es_descuento_pista: descuento.es_descuento_pista,
                            estacion_id: descuento.estacion_id,
                            partner_id: descuento.partner_id, // Cambiado de cliente_id a partner_id
                            tipo_combustible_id: descuento.tipo_combustible_id,
                            write_date: descuento.write_date,
                            write_uid: descuento.write_uid,
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDescuentoToDelete(descuento);
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
                <h2 className="text-xl font-semibold mb-4 text-center">Agregar Descuento</h2>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="descuento">
                      Descuento
                    </label>
                    <input
                      type="number"
                      id="descuento"
                      name="descuento"
                      placeholder="Ejemplo: 10"
                      value={descuentoData.descuento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="display_name">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      name="display_name"
                      placeholder="Ejemplo: Descuento 10%"
                      value={descuentoData.display_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="active">
                        Descuento Activo
                      </label>
                      <input
                        type="checkbox"
                        id="active"
                        name="active"
                        checked={descuentoData.active}
                        onChange={handleInputChange}
                        className="w-6 h-6 mx-auto block"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="es_descuento_pista">
                        Es descuento de pista
                      </label>
                      <input
                        type="checkbox"
                        id="es_descuento_pista"
                        name="es_descuento_pista"
                        checked={descuentoData.es_descuento_pista}
                        onChange={handleInputChange}
                        className="w-6 h-6 mx-auto block"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="estacion_id">
                      Estación
                    </label>
                    <select
                      id="estacion_id"
                      name="estacion_id"
                      value={descuentoData.estacion_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Estación</option>
                      {costos.map((costo) => (
                        <option key={costo.id} value={costo.id}>
                          {costo.nombre_centro_costos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="partner_id">
                      Cliente
                    </label>
                    <select
                      id="partner_id"
                      name="partner_id"
                      value={descuentoData.partner_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="tipo_combustible_id">
                      Tipo de Combustible
                    </label>
                    <select
                      id="tipo_combustible_id"
                      name="tipo_combustible_id"
                      value={descuentoData.tipo_combustible_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Tipo de Combustible</option>
                      {tipoCombustibles.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.name}
                        </option>
                      ))}
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
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isUpdateModalOpen && descuentoToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Actualizar Descuento</h2>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="descuento">
                      Descuento
                    </label>
                    <input
                      type="number"
                      id="descuento"
                      name="descuento"
                      placeholder="Ejemplo: 10"
                      value={descuentoData.descuento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="display_name">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      name="display_name"
                      placeholder="Ejemplo: Descuento 10%"
                      value={descuentoData.display_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="active">
                        Descuento Activo
                      </label>
                      <input
                        type="checkbox"
                        id="active"
                        name="active"
                        checked={descuentoData.active}
                        onChange={handleInputChange}
                        className="w-6 h-6 mx-auto block"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="es_descuento_pista">
                        Es descuento de pista
                      </label>
                      <input
                        type="checkbox"
                        id="es_descuento_pista"
                        name="es_descuento_pista"
                        checked={descuentoData.es_descuento_pista}
                        onChange={handleInputChange}
                        className="w-6 h-6 mx-auto block"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="estacion_id">
                      Estación
                    </label>
                    <select
                      id="estacion_id"
                      name="estacion_id"
                      value={descuentoData.estacion_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Estación</option>
                      {costos.map((costo) => (
                        <option key={costo.id} value={costo.id}>
                          {costo.nombre_centro_costos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="partner_id">
                      Cliente
                    </label>
                    <select
                      id="partner_id"
                      name="partner_id"
                      value={descuentoData.partner_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="tipo_combustible_id">
                      Tipo de Combustible
                    </label>
                    <select
                      id="tipo_combustible_id"
                      name="tipo_combustible_id"
                      value={descuentoData.tipo_combustible_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Tipo de Combustible</option>
                      {tipoCombustibles.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.name}
                        </option>
                      ))}
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
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && descuentoToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Descuento</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar el descuento {descuentoToDelete.display_name}?
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