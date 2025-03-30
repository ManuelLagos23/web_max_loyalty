'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Terminal {
  id: number;
  empresa: string;
  estacion_servicio: string;
  codigo_terminal: string;
  nombre_terminal: string;
}

export default function Terminales() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    empresa: '',
    estacion_servicio: '',
    codigo_terminal: '',
    nombre_terminal: '',
  });

  const [terminalSeleccionado, setTerminalSeleccionado] = useState<Terminal | null>(null);
  const [terminalAEliminar, setTerminalAEliminar] = useState<Terminal | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setTerminalSeleccionado(null);
      setFormData({
        id: 0,
        empresa: '',
        estacion_servicio: '',
        codigo_terminal: '',
        nombre_terminal: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (terminal: Terminal) => {
    setTerminalAEliminar(terminal);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setTerminalAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Agregar terminal (POST)
  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresa || !formData.estacion_servicio || !formData.codigo_terminal || !formData.nombre_terminal) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('empresa', formData.empresa);
    formDataToSend.append('estacion_servicio', formData.estacion_servicio);
    formDataToSend.append('codigo_terminal', formData.codigo_terminal);
    formDataToSend.append('nombre_terminal', formData.nombre_terminal);

    try {
      const response = await fetch('/api/terminales', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Terminal agregado exitosamente');
        closePopup();
        fetchTerminales();
      } else {
        alert('Error al agregar el terminal');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Editar terminal (PUT)
  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.empresa || !formData.estacion_servicio || !formData.codigo_terminal || !formData.nombre_terminal) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('empresa', formData.empresa);
    formDataToSend.append('estacion_servicio', formData.estacion_servicio);
    formDataToSend.append('codigo_terminal', formData.codigo_terminal);
    formDataToSend.append('nombre_terminal', formData.nombre_terminal);

    try {
      const response = await fetch('/api/terminales', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Terminal actualizado exitosamente');
        closePopup();
        fetchTerminales();
      } else {
        alert('Error al actualizar el terminal');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Eliminar terminal (DELETE)
  const handleDelete = async () => {
    if (!terminalAEliminar) return;
    try {
      const response = await fetch(`/api/terminales/${terminalAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Terminal eliminado exitosamente');
        closeDeletePopup();
        fetchTerminales();
      } else {
        alert('Error al eliminar el terminal');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchTerminales = async () => {
    try {
      const response = await fetch('/api/terminales');
      if (response.ok) {
        const data: Terminal[] = await response.json();
        setTerminales(data);
      } else {
        console.error('Error al obtener los terminales');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleEditar = (terminal: Terminal) => {
    setTerminalSeleccionado(terminal);
    setFormData({
      id: terminal.id,
      empresa: terminal.empresa,
      estacion_servicio: terminal.estacion_servicio,
      codigo_terminal: terminal.codigo_terminal,
      nombre_terminal: terminal.nombre_terminal,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchTerminales();
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de terminales</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra los terminales registrados en la plataforma.
          </p>
          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar terminal
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Actualizar terminal
            </button>
          </div>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Estación de servicio</th>
                <th className="px-4 py-2 text-left">Código terminal</th>
                <th className="px-4 py-2 text-left">Nombre terminal</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {terminales.length > 0 ? (
                terminales.map((terminal) => (
                  <tr className="border-b" key={terminal.id}>
                    <td className="px-4 py-2">{terminal.id}</td>
                    <td className="px-4 py-2">{terminal.empresa}</td>
                    <td className="px-4 py-2">{terminal.estacion_servicio}</td>
                    <td className="px-4 py-2">{terminal.codigo_terminal}</td>
                    <td className="px-4 py-2">{terminal.nombre_terminal}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(terminal)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(terminal)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                    No hay terminales disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal para agregar o editar terminal */}
          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {terminalSeleccionado ? 'Editar Terminal' : 'Agregar Terminal'}
                </h2>
                {terminalSeleccionado ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <label htmlFor="empresa">Empresa</label>
                    <input
                      type="text"
                      name="empresa"
                      placeholder="Empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="estacion_servicio">Estación de servicio</label>
                    <input
                      type="text"
                      name="estacion_servicio"
                      placeholder="Estación de servicio"
                      value={formData.estacion_servicio}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="codigo_terminal">Código terminal</label>
                    <input
                      type="text"
                      name="codigo_terminal"
                      placeholder="Código terminal"
                      value={formData.codigo_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="nombre_terminal">Nombre terminal</label>
                    <input
                      type="text"
                      name="nombre_terminal"
                      placeholder="Nombre terminal"
                      value={formData.nombre_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={closePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Cancelar
                      </button>
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Actualizar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <label htmlFor="empresa">Empresa</label>
                    <input
                      type="text"
                      name="empresa"
                      placeholder="Empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="estacion_servicio">Estación de servicio</label>
                    <input
                      type="text"
                      name="estacion_servicio"
                      placeholder="Estación de servicio"
                      value={formData.estacion_servicio}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="codigo_terminal">Código terminal</label>
                    <input
                      type="text"
                      name="codigo_terminal"
                      placeholder="Código terminal"
                      value={formData.codigo_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <label htmlFor="nombre_terminal">Nombre terminal</label>
                    <input
                      type="text"
                      name="nombre_terminal"
                      placeholder="Nombre terminal"
                      value={formData.nombre_terminal}
                      onChange={handleInputChange}
                      className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
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

          {/* Modal de confirmación de eliminación */}
          {isDeletePopupOpen && terminalAEliminar && (
            <div className="fixed inset-0 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">¿Estás seguro de eliminar este terminal?</h2>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={closeDeletePopup} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
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
        </main>
      </div>
    </div>
  );
}
