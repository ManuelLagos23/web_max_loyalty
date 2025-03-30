'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Cliente {
  id: number;
  nombre: string;
  pais: string;
  ciudad: string;
  estado: string;
  email: string;
  telefono: string;
  nfi: string;
}

export default function Clientes() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [clientes, setCliente] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    pais: '',
    ciudad: '',
    estado: '',
    email: '',
    telefono: '',
    nfi: '',
    logo: null as File | null,
  });

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setClienteSeleccionado(null);
      setFormData({
        id: 0,
        nombre: '',
        pais: '',
        estado: '',
        ciudad: '',
        email: '',
        telefono: '',
        nfi: '',
        logo: null,
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setClienteAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, logo: e.target.files[0] });
    }
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.pais || !formData.estado || !formData.ciudad || !formData.email || !formData.telefono || !formData.nfi || !formData.logo) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('logo', formData.logo);

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Cliente agregado exitosamente');
        closePopup();
        fetchClientes();
      } else {
        alert('Error al agregar el cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.nombre || !formData.pais || !formData.estado || !formData.ciudad || !formData.email || !formData.telefono || !formData.nfi) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    if (formData.logo) {
      formDataToSend.append('foto', formData.logo);
    }
    formDataToSend.append('num_telefono', formData.telefono);

    try {
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Cliente actualizado exitosamente');
        closePopup();
        fetchClientes();
      } else {
        alert('Error al actualizar el cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!clienteAEliminar) return;
    try {
      const response = await fetch(`/api/clientes/${clienteAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Cliente eliminado exitosamente');
        closeDeletePopup();
        fetchClientes();
      } else {
        alert('Error al eliminar el cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) {
        const data: Cliente[] = await response.json();
        setCliente(data);
      } else {
        console.error('Error al obtener los cliente');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      pais: cliente.pais,
      estado: cliente.estado,
      ciudad: cliente.ciudad,
      email: cliente.email,
      telefono: cliente.telefono,
      nfi: cliente.nfi,
      logo: null,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de clientes</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra los Clientes registrados en la plataforma.
          </p>
          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar cliente
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Actualizar cliente
            </button>
          </div>

          {/* Modal para agregar o editar cliente */}
          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 ">
              <div className="bg-white p-6 rounded shadow-lg w-2/5"> {/* Modal menos ancho */}
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {clienteSeleccionado ? 'Editar Cliente' : 'Agregar Cliente'}
                </h2>
                {clienteSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pais">País</label>
                      <input
                        type="text"
                        name="pais"
                        placeholder="País"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="estado">Estado</label>
                        <input
                          type="text"
                          name="estado"
                          placeholder="Estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="ciudad">Ciudad</label>
                        <input
                          type="text"
                          name="ciudad"
                          placeholder="Ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                          type="number"
                          name="telefono"
                          placeholder="Teléfono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="nfi">Número de identificación fiscal</label>
                        <input
                          type="number"
                          name="nfi"
                          placeholder="Número de identificación fiscal"
                          value={formData.nfi}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="logo">Logo</label>
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={closePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        {clienteSeleccionado ? 'Actualizar' : 'Agregar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="mb-4">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pais">País</label>
                      <input
                        type="text"
                        name="pais"
                        placeholder="País"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="estado">Estado</label>
                        <input
                          type="text"
                          name="estado"
                          placeholder="Estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="ciudad">Ciudad</label>
                        <input
                          type="text"
                          name="ciudad"
                          placeholder="Ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                          type="number"
                          name="telefono"
                          placeholder="Teléfono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="nfi">Número de identificación fiscal</label>
                        <input
                          type="number"
                          name="nfi"
                          placeholder="Número de identificación fiscal"
                          value={formData.nfi}
                          onChange={handleInputChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="logo">Logo</label>
                        <input
                          type="file"
                          name="logo"
                          onChange={handleFileChange}
                          className="w-full p-2 mb-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={closePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Agregar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Modal para confirmar eliminación */}
          {isDeletePopupOpen && clienteAEliminar && (
            <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Confirmar eliminación</h2>
                <p>¿Estás seguro de que deseas eliminar este cliente?</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de clientes */}
          <table className="min-w-full bg-white border border-gray-300 rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 text-left ">Nombre</th>
                <th className="py-2 px-4 text-left  ">País</th>
                <th className="py-2 px-4 text-left ">Estado</th>
                <th className="py-2 px-4- text-left  ">Ciudad</th>
                <th className="py-2 px-4  text-left ">Correo</th>
                <th className="py-2 px-4 text-left  ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 ">{cliente.nombre}</td>
                  <td className="py-2 px-4 ">{cliente.pais}</td>
                  <td className="py-2 px-4 ">{cliente.estado}</td>
                  <td className="py-2 px-4 ">{cliente.ciudad}</td>
                  <td className="py-2 px-4 ">{cliente.email}</td>
                  <td className="py-2 px-4  text-center">
                    <button
                      onClick={() => handleEditar(cliente)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => openDeletePopup(cliente)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
