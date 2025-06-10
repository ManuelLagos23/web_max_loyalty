'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  cliente_id?: number;
  cliente_nombre?: string;
  tipo_tarjeta_id: number;
  tipo_tarjeta_nombre: string;
  canal_id?: number;
  canal?: string;
  subcanal_id?: number;
  subcanal_nombre?: string;
  created_at: string;
  vehiculo_id?: number;
  vehiculo_nombre?: string;
}

interface Cliente {
  id: number;
  nombre: string;
}

interface TipoTarjeta {
  id: number;
  tipo_tarjeta: string;
  flota: boolean;
}

interface Vehiculo {
  id: number;
  modelo: string;
  placa: string;
  marca: string;
}

interface Canal {
  id: number;
  canal: string;
}

interface Subcanal {
  id: number;
  subcanal: string;
  canal_id: number;
}

export default function Tarjetas() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeactivatePopupOpen, setIsDeactivatePopupOpen] = useState(false);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tiposTarjeta, setTiposTarjeta] = useState<TipoTarjeta[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    id: 0,
    numero_tarjeta: '',
    cliente_id: 0,
    tipo_tarjeta_id: 0,
    vehiculo_id: 0,
    canal_id: 0,
    subcanal_id: 0,
  });
  const [selectedTipoTarjetaFlota, setSelectedTipoTarjetaFlota] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermCliente, setSearchTermCliente] = useState('');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<Tarjeta | null>(null);
  const [tarjetaADesactivar, setTarjetaADesactivar] = useState<Tarjeta | null>(null);
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
      setIsDropdownOpen(true);
      if (modo === 'agregar') {
        setTarjetaSeleccionada(null);
        setSelectedTipoTarjetaFlota(null);
        const newCardNumber = await generateCardNumber();
        setFormData({
          id: 0,
          numero_tarjeta: newCardNumber,
          cliente_id: 0,
          tipo_tarjeta_id: 0,
          vehiculo_id: 0,
          canal_id: 0,
          subcanal_id: 0,
        });
        setSearchTermCliente('');
        setFilteredClientes(clientes);
        setSubcanales([]);
      } else if (modo === 'editar' && tarjetaSeleccionada) {
        const tipoTarjeta = tiposTarjeta.find(t => t.id === tarjetaSeleccionada.tipo_tarjeta_id);
        setSelectedTipoTarjetaFlota(tipoTarjeta ? tipoTarjeta.flota : false);
        setFormData({
          id: tarjetaSeleccionada.id,
          numero_tarjeta: tarjetaSeleccionada.numero_tarjeta,
          cliente_id: tarjetaSeleccionada.cliente_id || 0,
          tipo_tarjeta_id: tarjetaSeleccionada.tipo_tarjeta_id,
          vehiculo_id: tarjetaSeleccionada.vehiculo_id || 0,
          canal_id: tarjetaSeleccionada.canal_id || 0,
          subcanal_id: tarjetaSeleccionada.subcanal_id || 0,
        });
        const selectedCliente = clientes.find(c => c.id === tarjetaSeleccionada.cliente_id);
        setSearchTermCliente(selectedCliente ? selectedCliente.nombre : '');
        setFilteredClientes(clientes);
        if (tarjetaSeleccionada.canal_id) {
          await fetchSubcanales(tarjetaSeleccionada.canal_id);
        }
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
    setSelectedTipoTarjetaFlota(null);
    setFormData(prev => ({ ...prev, canal_id: 0, subcanal_id: 0 }));
    setSubcanales([]);
  };

  const openDeactivatePopup = (tarjeta: Tarjeta) => {
    setTarjetaADesactivar(tarjeta);
    setIsDeactivatePopupOpen(true);
  };

  const closeDeactivatePopup = () => {
    setTarjetaADesactivar(null);
    setIsDeactivatePopupOpen(false);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (['cliente_id', 'tipo_tarjeta_id', 'vehiculo_id', 'canal_id', 'subcanal_id'].includes(name)) {
      parsedValue = parseInt(value, 10) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));

    if (name === 'tipo_tarjeta_id' && typeof parsedValue === 'number' && parsedValue !== 0) {
      try {
        const response = await fetch(`/api/tipos_tarjetas/${parsedValue}`);
        if (response.ok) {
          const tipoTarjeta: TipoTarjeta = await response.json();
          setSelectedTipoTarjetaFlota(tipoTarjeta.flota);
          setFormData(prev => ({
            ...prev,
            cliente_id: tipoTarjeta.flota ? 0 : prev.cliente_id,
            vehiculo_id: !tipoTarjeta.flota ? 0 : prev.vehiculo_id,
            canal_id: !tipoTarjeta.flota ? 0 : prev.canal_id,
            subcanal_id: !tipoTarjeta.flota ? 0 : prev.subcanal_id,
          }));
          setSearchTermCliente('');
          setSubcanales([]);
        } else {
          console.error('Error al obtener tipo de tarjeta:', response.status, response.statusText);
          setSelectedTipoTarjetaFlota(false);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        setSelectedTipoTarjetaFlota(false);
      }
    } else if (name === 'tipo_tarjeta_id' && parsedValue === 0) {
      setSelectedTipoTarjetaFlota(null);
      setFormData(prev => ({
        ...prev,
        cliente_id: 0,
        vehiculo_id: 0,
        canal_id: 0,
        subcanal_id: 0,
      }));
      setSearchTermCliente('');
      setSubcanales([]);
    }

    if (name === 'canal_id' && typeof parsedValue === 'number' && parsedValue !== 0) {
      fetchSubcanales(parsedValue);
      setFormData(prev => ({ ...prev, subcanal_id: 0 }));
    } else if (name === 'canal_id' && parsedValue === 0) {
      setSubcanales([]);
      setFormData(prev => ({ ...prev, subcanal_id: 0 }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTermCliente(term);
    setIsDropdownOpen(true);

    if (clientes) {
      const filtered = term.length > 0
        ? clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(term))
        : clientes;
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
    if (
      !formData.numero_tarjeta ||
      !formData.tipo_tarjeta_id ||
      (selectedTipoTarjetaFlota && (!formData.vehiculo_id || !formData.canal_id || !formData.subcanal_id)) ||
      (!selectedTipoTarjetaFlota && !formData.cliente_id)
    ) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('numero_tarjeta', formData.numero_tarjeta);
    formDataToSend.append('tipo_tarjeta_id', formData.tipo_tarjeta_id.toString());
    if (selectedTipoTarjetaFlota) {
      formDataToSend.append('vehiculo_id', formData.vehiculo_id.toString());
      formDataToSend.append('canal_id', formData.canal_id.toString());
      formDataToSend.append('subcanal_id', formData.subcanal_id.toString());
    } else {
      formDataToSend.append('cliente_id', formData.cliente_id.toString());
    }

    try {
      const response = await fetch('/api/tarjetas', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Tarjeta agregada exitosamente');
        closePopup();
        fetchTarjetas();
        fetchVehiculos();
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
    if (
      !formData.id ||
      !formData.numero_tarjeta ||
      !formData.tipo_tarjeta_id ||
      (selectedTipoTarjetaFlota && (!formData.vehiculo_id || !formData.canal_id || !formData.subcanal_id)) ||
      (!selectedTipoTarjetaFlota && !formData.cliente_id)
    ) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id.toString());
    formDataToSend.append('numero_tarjeta', formData.numero_tarjeta);
    formDataToSend.append('tipo_tarjeta_id', formData.tipo_tarjeta_id.toString());
    if (selectedTipoTarjetaFlota) {
      formDataToSend.append('vehiculo_id', formData.vehiculo_id.toString());
      formDataToSend.append('canal_id', formData.canal_id.toString());
      formDataToSend.append('subcanal_id', formData.subcanal_id.toString());
    } else {
      formDataToSend.append('cliente_id', formData.cliente_id.toString());
    }

    try {
      const response = await fetch('/api/tarjetas', {
        method: 'PUT',
        body: formDataToSend,
      });
      if (response.ok) {
        alert('Tarjeta actualizada exitosamente');
        closePopup();
        fetchTarjetas();
        fetchVehiculos();
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

  const handleDeactivate = async () => {
    if (!tarjetaADesactivar) return;
    try {
      const response = await fetch(`/api/tarjetas/${tarjetaADesactivar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      if (response.ok) {
        alert('Tarjeta desactivada exitosamente');
        closeDeactivatePopup();
        fetchTarjetas();
        fetchVehiculos();
      } else {
        const errorData = await response.json();
        console.error('Error al desactivar tarjeta:', errorData);
        alert(`Error al desactivar la tarjeta: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al desactivar la tarjeta');
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
    frontImage.src = '/images/logo-mini-card.png';

    frontImage.onload = () => {
      doc.addImage(frontImage, 'PNG', 0, 0, width, height);

      const marginLeft = 10;
      const marginLeftcanal = 30;
      const marginRight = 170;
      const bottomMargin = 10;
      const numberY = height - bottomMargin - 10;
      const nameY = height - bottomMargin;
      const canalY = 30;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor('#000000');

      doc.text(tarjeta.canal || 'N/A', marginLeftcanal, canalY);
      doc.text(tarjeta.numero_tarjeta, marginLeft, numberY);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(tarjeta.cliente_nombre || tarjeta.vehiculo_nombre || 'No asociado', marginLeft, nameY);

      doc.addPage([width, height], 'landscape');

      const backImage = new Image();
      backImage.src = '/images/logo-mini-back.png';

      backImage.onload = () => {
        doc.addImage(backImage, 'PNG', 0, 0, width, height);

        const issuanceY = 150;
        const issuanceText = `Emitida: ${formatDate(tarjeta.created_at)}`;
        const textWidth = doc.getTextWidth(issuanceText);
        const issuanceX = width - marginRight - textWidth;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(issuanceText, issuanceX, issuanceY);

        doc.save(`${tarjeta.numero_tarjeta}.pdf`);
      };

      backImage.onerror = () => {
        console.error('Error al cargar la imagen trasera. Verifica la ruta: /images/logo-mini-back.png');
      };
    };

    frontImage.onerror = () => {
      console.error('Error al cargar la imagen frontal. Verifica la ruta: /images/logo-mini-card.png');
    };
  };

  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await fetch(`/api/tarjetas?page=${encodeURIComponent(currentPage)}&limit=${encodeURIComponent(itemsPerPage)}&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setTarjetas(data.tarjetas);
        setTotalItems(data.total);
      } else {
        console.error('Error al cargar tarjetas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) {
        const data: Cliente[] = await response.json();
        setClientes(data);
        setFilteredClientes(data);
      } else {
        console.error('Error al cargar los clientes:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const fetchVehiculos = useCallback(async () => {
    try {
      const response = await fetch('/api/vehiculos/disponibles');
      if (response.ok) {
        const data = await response.json();
        setVehiculos(data.vehiculos || data);
      } else {
        console.error('Error al cargar los vehículos:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const fetchTiposTarjeta = useCallback(async () => {
    try {
      const response = await fetch('/api/tipos_tarjetas');
      if (response.ok) {
        const data: TipoTarjeta[] = await response.json();
        setTiposTarjeta(data);
      } else {
        console.error('Error al cargar los tipos de tarjeta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const fetchCanales = useCallback(async () => {
    try {
      const response = await fetch('/api/canales');
      if (response.ok) {
        const data: Canal[] = await response.json();
        setCanales(data);
      } else {
        console.error('Error al cargar los canales:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const fetchSubcanales = useCallback(async (canalId: number) => {
    try {
      const response = await fetch(`/api/subcanales?canal_id=${canalId}`);
      if (response.ok) {
        const data: Subcanal[] = await response.json();
        setSubcanales(data);
      } else {
        console.error('Error al cargar los subcanales:', response.status, response.statusText);
        setSubcanales([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setSubcanales([]);
    }
  }, []);

  const handleEditar = async (tarjeta: Tarjeta) => {
    setTarjetaSeleccionada(tarjeta);
    try {
      const response = await fetch(`/api/tipos_tarjetas/${tarjeta.tipo_tarjeta_id}`);
      if (response.ok) {
        const tipoTarjeta: TipoTarjeta = await response.json();
        setSelectedTipoTarjetaFlota(tipoTarjeta.flota);
      } else {
        console.error('Error al cargar tipo de tarjeta:', response.status, response.statusText);
        setSelectedTipoTarjetaFlota(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setSelectedTipoTarjetaFlota(false);
    }
    setFormData({
      id: tarjeta.id,
      numero_tarjeta: tarjeta.numero_tarjeta,
      cliente_id: tarjeta.cliente_id || 0,
      tipo_tarjeta_id: tarjeta.tipo_tarjeta_id,
      vehiculo_id: tarjeta.vehiculo_id || 0,
      canal_id: tarjeta.canal_id || 0,
      subcanal_id: tarjeta.subcanal_id || 0,
    });
    if (tarjeta.canal_id) {
      await fetchSubcanales(tarjeta.canal_id);
    }
    openPopup('editar');
  };

  useEffect(() => {
    fetchTarjetas();
    fetchClientes();
    fetchVehiculos();
    fetchTiposTarjeta();
    fetchCanales();
  }, [fetchTarjetas, fetchClientes, fetchVehiculos, fetchTiposTarjeta, fetchCanales]);

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

  const cardsRoutes = [
    { name: 'Tarjetas', href: '/tarjetas' },
    { name: 'Tipos de tarjetas', href: '/tipo_de_tarjetas' },
      { name: 'Tarjetas desactivadas', href: '/tarjetas/desactivadas' },
  ];

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

            <nav className="flex justify-center space-x-4">
              {cardsRoutes.map((card) => {
                const isActive = pathname === card.href;
                return (
                  <Link key={card.name} href={card.href}>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {card.name}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={() => openPopup('agregar')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Agregar Tarjeta
            </button>
            <div className="w-2/5" hidden>
              <select
                name="tipo_tarjeta_id"
                value={formData.tipo_tarjeta_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                <option value="0">Filtrar por tipo de tarjeta</option>
                {tiposTarjeta.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.tipo_tarjeta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por número de tarjeta, cliente, vehículo o tipo de tarjeta..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <table className="min-w-full bg-gray-100 table-auto rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de Tarjeta</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cliente</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Vehículo</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo de Tarjeta</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Subcanal</th>
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
                    <td className="px-4 py-2">{tarjeta.cliente_nombre || '-'}</td>
                    <td className="px-4 py-2">{tarjeta.vehiculo_nombre || '-'}</td>
                    <td className="px-4 py-2">{tarjeta.tipo_tarjeta_nombre}</td>
                         <td className="px-4 py-2">{tarjeta.canal}</td>
                              <td className="px-4 py-2">{tarjeta.subcanal_nombre}</td>
                    <td className="px-4 py-2">{formatDate(tarjeta.created_at)}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEditar(tarjeta)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeactivatePopup(tarjeta)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                      >
                        Desactivar
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
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
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
                      <label htmlFor="numero_tarjeta" className="block text-center font-bold text-gray-700 mb-2">
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
                      <label htmlFor="tipo_tarjeta_id" className="block text-center font-bold text-gray-700 mb-2">
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
                    {selectedTipoTarjetaFlota === false && (
                      <div className="mb-4 relative" ref={dropdownRef}>
                        <label htmlFor="cliente_id" className="block text-center font-bold text-gray-700 mb-2">
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
                            setFilteredClientes(clientes);
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
                    )}
                    {selectedTipoTarjetaFlota === true && (
                      <>
                        <div className="mb-4">
                          <label htmlFor="vehiculo_id" className="block text-center font-bold text-gray-700 mb-2">
                            Vehículo
                          </label>
                          <select
                            name="vehiculo_id"
                            value={formData.vehiculo_id || 0}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          >
                            <option value="0">Seleccionar vehículo</option>
                            {vehiculos.map((vehiculo) => (
                              <option key={vehiculo.id} value={vehiculo.id}>
                                {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="mb-4">
                            <label htmlFor="canal_id" className="block text-center font-bold text-gray-700 mb-2">
                              Canal
                            </label>
                            <select
                              name="canal_id"
                              value={formData.canal_id || 0}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            >
                              <option value="0">Seleccionar canal</option>
                              {canales.map((canal) => (
                                <option key={canal.id} value={canal.id}>
                                  {canal.canal}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4">
                            <label htmlFor="subcanal_id" className="block text-center font-bold text-gray-700 mb-2">
                              Subcanal
                            </label>
                            <select
                              name="subcanal_id"
                              value={formData.subcanal_id || 0}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              disabled={formData.canal_id === 0}
                            >
                              <option value="0">Seleccionar subcanal</option>
                              {subcanales.map((subcanal) => (
                                <option key={subcanal.id} value={subcanal.id}>
                                  {subcanal.subcanal}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
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
                      <label htmlFor="numero_tarjeta" className="block text-center font-bold text-gray-700 mb-2">
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
                      <label htmlFor="tipo_tarjeta_id" className="block text-center font-bold text-gray-700 mb-2">
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
                    {selectedTipoTarjetaFlota === false && (
                      <div className="mb-4 relative" ref={dropdownRef}>
                        <label htmlFor="cliente_id" className="block text-center font-semibold text-gray-700 mb-2">
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
                            setFilteredClientes(clientes);
                            setIsDropdownOpen(true);
                          }}
                          placeholder="Busca o selecciona un cliente..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-center"
                        />
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredClientes.length > 0 ? (
                              filteredClientes.map((client) => (
                                <div
                                  key={client.id}
                                  onClick={() => handleSelectCliente(client)}
                                  className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-center"
                                >
                                  {client.nombre}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500 text-center">No se encontraron clientes.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {selectedTipoTarjetaFlota === true && (
                      <>
                        <div className="mb-4">
                          <label htmlFor="vehiculo_id" className="block text-center font-semibold text-gray-700 mb-2">
                            Vehículo
                          </label>
                          <select
                            name="vehiculo_id"
                            value={formData.vehiculo_id || 0}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-center"
                          >
                            <option value="0">Seleccionar vehículo</option>
                            {vehiculos.map((vehiculo) => (
                              <option key={vehiculo.id} value={vehiculo.id}>
                                {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="mb-4">
                            <label htmlFor="canal_id" className="block text-center font-semibold text-gray-700 mb-2">
                              Canal
                            </label>
                            <select
                              name="canal_id"
                              value={formData.canal_id || 0}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-center"
                            >
                              <option value="0">Seleccionar canal</option>
                              {canales.map((canal) => (
                                <option key={canal.id} value={canal.id}>
                                  {canal.canal}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4">
                            <label htmlFor="subcanal_id" className="block text-center font-semibold text-gray-700 mb-2">
                              Subcanal
                            </label>
                            <select
                              name="subcanal_id"
                              value={formData.subcanal_id || 0}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-center"
                              disabled={formData.canal_id === 0}
                            >
                              <option value="0">Seleccionar subcanal</option>
                              {subcanales.map((subcanal) => (
                                <option key={subcanal.id} value={subcanal.id}>
                                  {subcanal.subcanal}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="bg-gray-400 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {isDeactivatePopupOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeDeactivatePopup();
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2
                  className="text-2xl font-bold text-gray-800 mb-4 tracking-tight 
                  bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text
                  text-center"
                >
                  Confirmar Desactivación
                </h2>
                <p className="text-center text-gray-600 mb-4">
                  ¿Estás seguro de que deseas desactivar la tarjeta {tarjetaADesactivar?.numero_tarjeta}?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={closeDeactivatePopup}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeactivate}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Desactivar
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