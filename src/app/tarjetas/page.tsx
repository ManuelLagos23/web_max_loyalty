'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import Head from 'next/head';


interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  cliente_id: number;
  cliente_nombre: string;
  tipo_tarjeta_id: number;
  tipo_tarjeta_nombre: string;
  canal_id: number;
  codigo_canal: string;
  created_at: string;
}

interface Cliente {
  id: number;
  nombre: string;
}

interface TipoTarjeta {
  id: number;
  tipo_tarjeta: string;
}

export default function Tarjetas() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposTarjeta, setTiposTarjeta] = useState<TipoTarjeta[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    numero_tarjeta: '',
    cliente_id: 0,
    tipo_tarjeta_id: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermCliente, setSearchTermCliente] = useState('');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<Tarjeta | null>(null);
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState<Tarjeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const generateCardNumber = async () => {
    try {
      const response = await fetch('/api/tarjetas?tipo=generar', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        return data.numero_tarjeta;
      } else {
        console.error('Error al generar número de tarjeta:', response.status, response.statusText);
        throw new Error('Error al generar número de tarjeta');
      }
    } catch (error) {
      console.error('Error al generar número de tarjeta:', error);
      const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
      return `${randomPart}0001`;
    }
  };

  const openPopup = async (modo: 'agregar' | 'editar') => {
    try {
      setIsPopupOpen(true);
      setIsDropdownOpen(true); // Mostrar el dropdown por defecto
      if (modo === 'agregar') {
        setTarjetaSeleccionada(null);
        const newCardNumber = await generateCardNumber();
        setFormData({
          id: 0,
          numero_tarjeta: newCardNumber,
          cliente_id: 0,
          tipo_tarjeta_id: 0,
        });
        setSearchTermCliente('');
        setFilteredClientes(clientes); // Mostrar todos los clientes al abrir
      } else if (modo === 'editar' && tarjetaSeleccionada) {
        setFormData({
          id: tarjetaSeleccionada.id,
          numero_tarjeta: tarjetaSeleccionada.numero_tarjeta,
          cliente_id: tarjetaSeleccionada.cliente_id,
          tipo_tarjeta_id: tarjetaSeleccionada.tipo_tarjeta_id,
        });
        const selectedCliente = clientes.find(c => c.id === tarjetaSeleccionada.cliente_id);
        setSearchTermCliente(selectedCliente ? selectedCliente.nombre : '');
        setFilteredClientes(clientes); // Mostrar todos los clientes al abrir
      }
    } catch (error) {
      console.error('Error al abrir popup:', error);
      alert('Error al generar el número de tarjeta. Intente de nuevo.');
      setIsPopupOpen(false);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSearchTermCliente('');
    setIsDropdownOpen(false);
  };

  const openDeletePopup = (tarjeta: Tarjeta) => {
    setTarjetaAEliminar(tarjeta);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setTarjetaAEliminar(null);
    setIsDeletePopupOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'cliente_id' || name === 'tipo_tarjeta_id' ? parseInt(value) : value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTermCliente(term);
    setIsDropdownOpen(true); // Mantener el dropdown abierto mientras se escribe

    if (clientes) {
      const filtered = term.length > 0
        ? clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(term))
        : clientes; // Mostrar todos si no hay término
      setFilteredClientes(filtered);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setFormData((prev) => ({ ...prev, cliente_id: cliente.id }));
    setSearchTermCliente(cliente.nombre);
    setIsDropdownOpen(false);
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero_tarjeta || !formData.cliente_id || !formData.tipo_tarjeta_id) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('numero_tarjeta', formData.numero_tarjeta);
    formDataToSend.append('cliente_id', formData.cliente_id.toString());
    formDataToSend.append('tipo_tarjeta_id', formData.tipo_tarjeta_id.toString());

    try {
      const response = await fetch('/api/tarjetas', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Tarjeta agregada exitosamente');
        closePopup();
        fetchTarjetas();
      } else {
        const errorData = await response.json();
        console.error('Error al agregar tarjeta:', errorData);
        alert(`Error al agregar la tarjeta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al agregar la tarjeta');
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.numero_tarjeta || !formData.cliente_id || !formData.tipo_tarjeta_id) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('numero_tarjeta', formData.numero_tarjeta);
    formDataToSend.append('cliente_id', formData.cliente_id.toString());
    formDataToSend.append('tipo_tarjeta_id', formData.tipo_tarjeta_id.toString());

    try {
      const response = await fetch('/api/tarjetas', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Tarjeta actualizada exitosamente');
        closePopup();
        fetchTarjetas();
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar tarjeta:', errorData);
        alert(`Error al actualizar la tarjeta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al actualizar la tarjeta');
    }
  };

  const handleDelete = async () => {
    if (!tarjetaAEliminar) return;
    try {
      const response = await fetch(`/api/tarjetas/${tarjetaAEliminar.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Tarjeta eliminada exitosamente');
        closeDeletePopup();
        fetchTarjetas();
      } else {
        const errorData = await response.json();
        console.error('Error al eliminar tarjeta:', errorData);
        alert(`Error al eliminar la tarjeta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al eliminar la tarjeta');
    }
  };



  const handlePrintCard = async (tarjeta: Tarjeta) => {
  const mmToPt = (mm: number) => mm * 2.83465;
  const width = mmToPt(102.72);
  const height = mmToPt(64.776);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [width, height],
  });

  const frontImage = new Image();
  frontImage.src = '/images/logo-max-card.png';

  frontImage.onload = () => {
    doc.addImage(frontImage, 'PNG', 0, 0, width, height);

    const marginLeft = 10;
      const marginLeftcanal = 30;
    const marginRight = 170;
    const bottomMargin = 10;
    const numberY = height - bottomMargin - 16;
    const nameY = height - bottomMargin;
    const canalY = 30; // Esquina superior izquierda para código del canal

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor('#000000');

    doc.text(tarjeta.codigo_canal, marginLeftcanal, canalY); // Código canal en frontal
    doc.text(tarjeta.numero_tarjeta, marginLeft, numberY);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(tarjeta.cliente_nombre, marginLeft, nameY);

    doc.addPage([width, height], 'landscape');

    const backImage = new Image();
    backImage.src = '/images/logo-max-back.png';

    backImage.onload = () => {
      doc.addImage(backImage, 'PNG', 0, 0, width, height);

      const issuanceY = 150;
      const issuanceText = `Emitida: ${formatDate(tarjeta.created_at)}`;
      const textWidth = doc.getTextWidth(issuanceText);
      const issuanceX = width - marginRight - textWidth;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(issuanceText, issuanceX, issuanceY); // Solo fecha en trasera

      doc.save(`tarjeta_${tarjeta.numero_tarjeta}.pdf`);
    };

    backImage.onerror = () => {
      console.error('Error al cargar la imagen trasera. Verifica la ruta: /images/logo-max-back.png');
    };
  };

  frontImage.onerror = () => {
    console.error('Error al cargar la imagen frontal. Verifica la ruta: /images/logo-max-card.png');
  };
};

  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/tarjetas?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setTarjetas(data.tarjetas);
        setTotalItems(data.total);
      } else {
        console.error('Error al obtener las tarjetas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) {
        const data: Cliente[] = await response.json();
        setClientes(data);
      } else {
        console.error('Error al obtener los clientes:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const fetchTiposTarjeta = useCallback(async () => {
    try {
      const response = await fetch('/api/tipos_tarjetas');
      if (response.ok) {
        const data: TipoTarjeta[] = await response.json();
        setTiposTarjeta(data);
      } else {
        console.error('Error al obtener los tipos de tarjeta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const handleEditar = async (tarjeta: Tarjeta) => {
    setTarjetaSeleccionada(tarjeta);
    setFormData({
      id: tarjeta.id,
      numero_tarjeta: tarjeta.numero_tarjeta,
      cliente_id: tarjeta.cliente_id,
      tipo_tarjeta_id: tarjeta.tipo_tarjeta_id,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchTarjetas();
    fetchClientes();
    fetchTiposTarjeta();
  }, [fetchTarjetas, fetchClientes, fetchTiposTarjeta]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen flex">
         <Head>
        <meta charSet="UTF-8" />
     
      </Head>
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <h1
              className="text-4xl font-bold text-gray-900 mb-4
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Tarjetas
            </h1>
            <p
              className="text-center text-gray-700 leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra las tarjetas registradas en la plataforma con facilidad y seguridad.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Agregar Tarjeta
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por número de tarjeta, cliente o tipo de tarjeta..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md ">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de Tarjeta</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cliente</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo de Tarjeta</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha de Creación</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.length > 0 ? (
                tarjetas.map((tarjeta, index) => (
                  <tr key={tarjeta.id} className="hover:bg-gray-50 transition-all duration-200">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2">{tarjeta.numero_tarjeta}</td>
                    <td className="px-4 py-2">{tarjeta.cliente_nombre}</td>
                    <td className="px-4 py-2">{tarjeta.tipo_tarjeta_nombre}</td>
                    <td className="px-4 py-2">{formatDate(tarjeta.created_at)}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEditar(tarjeta)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(tarjeta)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => handlePrintCard(tarjeta)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
                      >
                        Imprimir Tarjeta
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                    No hay tarjetas disponibles.
                  </td>
                </tr>
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

          {isPopupOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border">
                <div className="text-center">
                  <h2
                    className="text-3xl font-bold text-gray-800 mb-6 tracking-tight 
                    bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                    transition-all duration-300 hover:scale-105"
                  >
                    {tarjetaSeleccionada ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}
                  </h2>
                </div>
                {tarjetaSeleccionada ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="numero_tarjeta" className="block text-center font-medium text-gray-700 mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        name="numero_tarjeta"
                        value={formData.numero_tarjeta}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100 text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="tipo_tarjeta_id" className="block text-center font-medium text-gray-700 mb-2">
                        Tipo de Tarjeta
                      </label>
                      <select
                        name="tipo_tarjeta_id"
                        value={formData.tipo_tarjeta_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      >
                        <option value="0">Seleccionar tipo de tarjeta</option>
                        {tiposTarjeta.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.tipo_tarjeta}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4 relative" ref={dropdownRef}>
                      <label htmlFor="cliente_id" className="block text-center font-medium text-gray-700 mb-2">
                        Cliente
                      </label>
                      <input
                        type="text"
                        id="cliente_id"
                        name="cliente_id"
                        value={searchTermCliente}
                        onChange={handleSearchClienteChange}
                        onFocus={() => {
                          setSearchTermCliente('');
                          setFormData((prev) => ({ ...prev, cliente_id: 0 }));
                          setFilteredClientes(clientes); // Mostrar todos al enfocar
                          setIsDropdownOpen(true);
                        }}
                        placeholder="Busca o selecciona un cliente..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredClientes.length > 0 ? (
                            filteredClientes.map((cliente) => (
                              <div
                                key={cliente.id}
                                onClick={() => handleSelectCliente(cliente)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-center"
                              >
                                {cliente.nombre}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-center">No se encontraron clientes.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
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
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="mb-4">
                      <label htmlFor="numero_tarjeta" className="block text-center font-medium text-gray-700 mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        name="numero_tarjeta"
                        value={formData.numero_tarjeta}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100 text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="tipo_tarjeta_id" className="block text-center font-medium text-gray-700 mb-2">
                        Tipo de Tarjeta
                      </label>
                      <select
                        name="tipo_tarjeta_id"
                        value={formData.tipo_tarjeta_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      >
                        <option value="0">Seleccionar tipo de tarjeta</option>
                        {tiposTarjeta.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.tipo_tarjeta}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4 relative" ref={dropdownRef}>
                      <label htmlFor="cliente_id" className="block text-center font-medium text-gray-700 mb-2">
                        Cliente
                      </label>
                      <input
                        type="text"
                        id="cliente_id"
                        name="cliente_id"
                        value={searchTermCliente}
                        onChange={handleSearchClienteChange}
                        onFocus={() => {
                          setSearchTermCliente('');
                          setFormData((prev) => ({ ...prev, cliente_id: 0 }));
                          setFilteredClientes(clientes); // Mostrar todos al enfocar
                          setIsDropdownOpen(true);
                        }}
                        placeholder="Busca o selecciona un cliente..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredClientes.length > 0 ? (
                            filteredClientes.map((cliente) => (
                              <div
                                key={cliente.id}
                                onClick={() => handleSelectCliente(cliente)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-center"
                              >
                                {cliente.nombre}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-center">No se encontraron clientes.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
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
                )}
              </div>
            </div>
          )}

          {isDeletePopupOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md border"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 border ">
                <h2
                  className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                  bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
                  transition-all duration-300 hover:scale-105 text-center"
                >
                  Confirmar Eliminación
                </h2>
                <p className="text-center text-gray-700 mb-4">
                  ¿Estás seguro de que deseas eliminar la tarjeta {tarjetaAEliminar?.numero_tarjeta}?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={closeDeletePopup}
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
  );
}