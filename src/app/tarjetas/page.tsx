'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';

interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  cliente_id: number;
  cliente_nombre: string;
  created_at: string; // DATE from PostgreSQL is serialized as string
}

interface Cliente {
  id: number;
  nombre: string;
}

export default function Tarjetas() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    numero_tarjeta: '',
    cliente_id: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<Tarjeta | null>(null);
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState<Tarjeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0); // Nuevo estado para el total de registros

  const generateCardNumber = async () => {
    try {
      console.log('Iniciando generación de número de tarjeta');
      const response = await fetch('/api/tarjetas?tipo=generar', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Número de tarjeta generado:', data.numero_tarjeta);
        return data.numero_tarjeta;
      } else {
        console.error('Error al generar número de tarjeta:', response.status, response.statusText);
        throw new Error('Error al generar número de tarjeta');
      }
    } catch (error) {
      console.error('Error al generar número de tarjeta:', error);
      // Número de respaldo en caso de error
      const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
      return `${randomPart}0001`; // Usamos 0001 como fallback
    }
  };

  const openPopup = async (modo: 'agregar' | 'editar') => {
    try {
      console.log('Abriendo popup en modo:', modo);
      setIsPopupOpen(true);
      if (modo === 'agregar') {
        setTarjetaSeleccionada(null);
        const newCardNumber = await generateCardNumber();
        console.log('Número de tarjeta asignado al formData:', newCardNumber);
        setFormData({
          id: 0,
          numero_tarjeta: newCardNumber,
          cliente_id: 0,
        });
      }
    } catch (error) {
      console.error('Error al abrir popup:', error);
      alert('Error al generar el número de tarjeta. Intente de nuevo.');
      setIsPopupOpen(false);
    }
  };

  const closePopup = () => {
    console.log('Cerrando popup');
    setIsPopupOpen(false);
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
    setFormData({ ...formData, [name]: name === 'cliente_id' ? parseInt(value) : value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmitAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero_tarjeta || !formData.cliente_id) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('numero_tarjeta', formData.numero_tarjeta);
    formDataToSend.append('cliente_id', formData.cliente_id.toString());

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
    if (!formData.id || !formData.numero_tarjeta || !formData.cliente_id) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('numero_tarjeta', formData.numero_tarjeta);
    formDataToSend.append('cliente_id', formData.cliente_id.toString());

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
    const width = mmToPt(102.72); // Nuevo ancho: 102.72 mm (20% más ancho)
    const height = mmToPt(64.776); // Nuevo alto: 64.776 mm (proporcional)
  
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [width, height],
    });
  
    // --- Cara frontal ---
    const frontImage = new Image();
    frontImage.src = '/images/logo-max-card.png'; // Imagen de la cara frontal
  
    frontImage.onload = () => {
      console.log('Imagen frontal cargada correctamente, renderizando cara frontal...');
  
      // Usar la imagen como fondo para la cara frontal
      doc.addImage(frontImage, 'PNG', 0, 0, width, height);
  
      // Configurar el texto en la parte inferior izquierda
      const marginLeft = 10; // Margen izquierdo en puntos
      const bottomMargin = 10; // Margen inferior en puntos
      const numberY = height - bottomMargin - 16; // Posición Y del número (arriba del nombre)
      const nameY = height - bottomMargin; // Posición Y del nombre
  
      // Configurar la fuente y el color del texto
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor('#000000'); // Texto en negro
  
      // Añadir el número de tarjeta
      console.log(`Añadiendo número de tarjeta: ${tarjeta.numero_tarjeta} en (${marginLeft}, ${numberY})`);
      doc.text(tarjeta.numero_tarjeta, marginLeft, numberY);
  
      // Configurar la fuente en negrita para el nombre
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      console.log(`Añadiendo nombre: ${tarjeta.cliente_nombre} en (${marginLeft}, ${nameY})`);
      doc.text(tarjeta.cliente_nombre, marginLeft, nameY);
  
      // --- Cara trasera ---
      // Agregar una nueva página para la cara trasera
      doc.addPage([width, height], 'landscape');
  
      const backImage = new Image();
      backImage.src = '/images/logo-max-back.png'; // Imagen de la cara trasera
  
      backImage.onload = () => {
        console.log('Imagen trasera cargada correctamente, renderizando cara trasera...');
  
        // Usar la imagen como fondo para la cara trasera
        doc.addImage(backImage, 'PNG', 0, 0, width, height);
  
        // Guardar el PDF
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
      const response = await fetch(`/api/tarjetas?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Datos obtenidos:', data);
        setTarjetas(data.tarjetas);
        setTotalItems(data.total); // Actualizar el total de registros
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
        console.log('Clientes obtenidos:', data);
        setClientes(data);
      } else {
        console.error('Error al obtener los clientes:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }, []);

  const handleEditar = async (tarjeta: Tarjeta) => {
    console.log('Editando tarjeta:', tarjeta);
    setTarjetaSeleccionada(tarjeta);
    setFormData({
      id: tarjeta.id,
      numero_tarjeta: tarjeta.numero_tarjeta,
      cliente_id: tarjeta.cliente_id,
    });
    openPopup('editar');
  };

  useEffect(() => {
    fetchTarjetas();
    fetchClientes();
  }, [fetchTarjetas, fetchClientes]);

  // Calcular totalPages basado en totalItems
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
    <div className="font-sans bg-gray-100 text-gray-900">
      <div className="flex">
        <Navbar />
        <main className="w-4/5 p-8">
          <div className="space-y-6">
            <h1
              className="text-4xl font-bold text-gray-900 mb-4 tracking-tight 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 hover:scale-105 text-center"
            >
              Gestión de Tarjetas
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl
              p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto"
            >
              Administra las tarjetas registradas en la plataforma.
            </p>
          </div>

          <div className="flex justify-between mb-4">
            <button onClick={() => openPopup('agregar')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Agregar tarjeta
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por número de tarjeta o cliente..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Número de Tarjeta</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Fecha de Creación</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.length > 0 ? (
                tarjetas.map((tarjeta, index) => (
                  <tr key={tarjeta.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2">{tarjeta.numero_tarjeta}</td>
                    <td className="px-4 py-2">{tarjeta.cliente_nombre}</td>
                    <td className="px-4 py-2">{formatDate(tarjeta.created_at)}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEditar(tarjeta)}
                        className="

bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeletePopup(tarjeta)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => handlePrintCard(tarjeta)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Imprimir Tarjeta
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
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
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Siguiente
            </button>
          </div>

          {isPopupOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-2/5 border-1">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight inline-block relative after:block after:h-1 after:w-12 after:mx-auto after:mt-2">
                    {tarjetaSeleccionada ? 'Editar Tarjeta' : 'Agregar Tarjeta'}
                  </h2>
                </div>
                {tarjetaSeleccionada ? (
                  <form onSubmit={handleSubmitEditar}>
                    <input type="hidden" name="id" value={formData.id} />
                    <div className="mb-4">
                      <label htmlFor="numero_tarjeta" className="block text-center">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        name="numero_tarjeta"
                        value={formData.numero_tarjeta}
                        readOnly
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center bg-gray-100"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="cliente_id" className="block text-center">
                        Cliente
                      </label>
                      <select
                        name="cliente_id"
                        value={formData.cliente_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      >
                        <option value="0">Seleccionar cliente</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitAgregar}>
                    <div className="mb-4">
                      <label htmlFor="numero_tarjeta" className="block text-center">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        name="numero_tarjeta"
                        value={formData.numero_tarjeta}
                        readOnly
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center bg-gray-100"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="cliente_id" className="block text-center">
                        Cliente
                      </label>
                      <select
                        name="cliente_id"
                        value={formData.cliente_id}
                        onChange={handleInputChange}
                        className="w-full p-2 mb-2 border border-gray-300 rounded block text-center"
                      >
                        <option value="0">Seleccionar cliente</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {isDeletePopupOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeletePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg w-1/3 border-1">
                <h2 className="text-xl font-semibold mb-4 text-center">Confirmar Eliminación</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar la tarjeta {tarjetaAEliminar?.numero_tarjeta}?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={closeDeletePopup}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
        </main>
      </div>
    </div>
  );
}