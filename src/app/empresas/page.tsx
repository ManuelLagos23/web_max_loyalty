'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Empresa {
  id: number;
  nombre_empresa: string;
  nombre_impreso: string;
  logo: string | null;
  logo_impreso: string | null;
  pais: string;
  moneda: string;
  correo: string;
  telefono: string;
  nfi: string;
  prefijo_tarjetas: string;
}

export default function Empresas() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    nombre_empresa: '',
    nombre_impreso: '',
    logo: null as File | null,
    logo_impreso: null as File | null,
    pais: '',
    moneda: '',
    correo: '',
    telefono: '',
    nfi: '',
    prefijo_tarjetas: '',
  });

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState<Empresa | null>(null);

  const openPopup = (modo: 'agregar' | 'editar') => {
    setIsPopupOpen(true);
    if (modo === 'agregar') {
      setEmpresaSeleccionada(null);
      setFormData({
        id: 0,
        nombre_empresa: '',
        nombre_impreso: '',
        logo: null,
        logo_impreso: null,
        pais: '',
        moneda: '',
        correo: '',
        telefono: '',
        nfi: '',
        prefijo_tarjetas: '',
      });
    }
  };

  const closePopup = () => setIsPopupOpen(false);
  const openDeletePopup = (empresa: Empresa) => {
    setEmpresaAEliminar(empresa);
    setIsDeletePopupOpen(true);
  };
  const closeDeletePopup = () => {
    setEmpresaAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'logo_impreso') => {
    if (e.target.files) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_empresa || !formData.pais || !formData.moneda || !formData.correo || !formData.telefono || !formData.nfi || !formData.prefijo_tarjetas || !formData.logo) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('nombre_empresa', formData.nombre_empresa);
    formDataToSend.append('nombre_impreso', formData.nombre_impreso);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('moneda', formData.moneda);
    formDataToSend.append('correo', formData.correo);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('prefijo_tarjetas', formData.prefijo_tarjetas);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }
    if (formData.logo_impreso) {
      formDataToSend.append('logo_impreso', formData.logo_impreso);
    }

    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Empresa agregada exitosamente');
        closePopup();
        fetchEmpresas();
      } else {
        alert('Error al agregar la empresa');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.nombre_empresa || !formData.pais || !formData.moneda || !formData.correo || !formData.telefono || !formData.nfi || !formData.prefijo_tarjetas) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('nombre_empresa', formData.nombre_empresa);
    formDataToSend.append('nombre_impreso', formData.nombre_impreso);
    formDataToSend.append('pais', formData.pais);
    formDataToSend.append('moneda', formData.moneda);
    formDataToSend.append('correo', formData.correo);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('nfi', formData.nfi);
    formDataToSend.append('prefijo_tarjetas', formData.prefijo_tarjetas);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }
    if (formData.logo_impreso) {
      formDataToSend.append('logo_impreso', formData.logo_impreso);
    }

    try {
      const response = await fetch('/api/empresas', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Empresa actualizada exitosamente');
        closePopup();
        fetchEmpresas();
      } else {
        alert('Error al actualizar la empresa');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleDelete = async () => {
    if (!empresaAEliminar) return;
    try {
      const response = await fetch(`/api/empresas/${empresaAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Empresa eliminada exitosamente');
        closeDeletePopup();
        fetchEmpresas();
      } else {
        alert('Error al eliminar la empresa');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data: Empresa[] = await response.json();
        setEmpresas(data);
      } else {
        console.error('Error al obtener las empresas');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleEditar = (empresa: Empresa) => {
    setEmpresaSeleccionada(empresa);
    setFormData({
      id: empresa.id,
      nombre_empresa: empresa.nombre_empresa,
      nombre_impreso: empresa.nombre_impreso,
      logo: null,
      logo_impreso: null,
      pais: empresa.pais,
      moneda: empresa.moneda,
      correo: empresa.correo,
      telefono: empresa.telefono,
      nfi: empresa.nfi,
      prefijo_tarjetas: empresa.prefijo_tarjetas,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <h1 className="text-4xl font-semibold mb-4">Gestión de empresas</h1>
          <p className="text-lg text-gray-700 mb-4">
            Administra las empresas registradas en la plataforma.
          </p>
          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar empresa
            </button>
          </div>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre de la empresa</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Moneda</th>
                <th className="px-4 py-2 text-left">Correo</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">NFI</th>
                <th className="px-4 py-2 text-left">Prefijo de tarjetas</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.length > 0 ? (
                empresas.map((empresa) => (
                  <tr className="border-b" key={empresa.id}>
                    <td className="px-4 py-2">{empresa.id}</td>
                    <td className="px-4 py-2">{empresa.nombre_empresa}</td>
                    <td className="px-4 py-2">{empresa.pais}</td>
                    <td className="px-4 py-2">{empresa.moneda}</td>
                    <td className="px-4 py-2">{empresa.correo}</td>
                    <td className="px-4 py-2">{empresa.telefono}</td>
                    <td className="px-4 py-2">{empresa.nfi}</td>
                    <td className="px-4 py-2">{empresa.prefijo_tarjetas}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditar(empresa)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(empresa)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-2 text-center">No hay empresas disponibles</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal para agregar o editar empresa */}
          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {empresaSeleccionada ? 'Editar Empresa' : 'Agregar Empresa'}
                </h2>
                <form onSubmit={empresaSeleccionada ? handleSubmitEditar : handleSubmitAgregar}>
                  <label htmlFor="nombre_empresa">Nombre de la empresa</label>
                  <input
                    type="text"
                    name="nombre_empresa"
                    placeholder="Nombre de la empresa"
                    value={formData.nombre_empresa}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="nombre_impreso">Nombre impreso</label>
                  <input
                    type="text"
                    name="nombre_impreso"
                    placeholder="Nombre impreso"
                    value={formData.nombre_impreso}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="pais">País</label>
                  <input
                    type="text"
                    name="pais"
                    placeholder="País"
                    value={formData.pais}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="moneda">Moneda</label>
                  <input
                    type="text"
                    name="moneda"
                    placeholder="Moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="correo">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="nfi">NFI</label>
                  <input
                    type="text"
                    name="nfi"
                    placeholder="NFI"
                    value={formData.nfi}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="prefijo_tarjetas">Prefijo de tarjetas</label>
                  <input
                    type="text"
                    name="prefijo_tarjetas"
                    placeholder="Prefijo de tarjetas"
                    value={formData.prefijo_tarjetas}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="logo">Logo</label>
                  <input
                    type="file"
                    name="logo"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <label htmlFor="logo_impreso">Logo impreso</label>
                  <input
                    type="file"
                    name="logo_impreso"
                    onChange={(e) => handleFileChange(e, 'logo_impreso')}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                  >
                    {empresaSeleccionada ? 'Actualizar Empresa' : 'Agregar Empresa'}
                  </button>
                </form>
                <button
                  onClick={closePopup}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4 w-full"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Modal para eliminar empresa */}
          {isDeletePopupOpen && empresaAEliminar && (
            <div className="fixed inset-0 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">¿Estás seguro de eliminar esta empresa?</h2>
                <p className="mb-4">
                  Empresa: {empresaAEliminar.nombre_empresa}
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
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
