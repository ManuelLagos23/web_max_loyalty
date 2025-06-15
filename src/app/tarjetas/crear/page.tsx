'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

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

export default function AgregarTarjeta() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    numero_tarjeta: '',
    cliente_id: 0,
    tipo_tarjeta_id: 0,
    vehiculo_id: 0,
    canal_id: 0,
    subcanal_id: 0,
  });
  const [tiposTarjeta, setTiposTarjeta] = useState<TipoTarjeta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [selectedTipoTarjetaFlota, setSelectedTipoTarjetaFlota] = useState<boolean | null>(null);
  const [searchTermCliente, setSearchTermCliente] = useState('');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLoading] = useState(true);

  const generateCardNumber = async () => {
    try {
      const response = await fetch('/api/tarjetas?tipo=generar', { method: 'GET' });
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

  useEffect(() => {
    const initializeForm = async () => {
      const newCardNumber = await generateCardNumber();
      setFormData(prev => ({ ...prev, numero_tarjeta: newCardNumber }));
      Promise.all([
        fetchClientes(),
        fetchVehiculos(),
        fetchTiposTarjeta(),
        fetchCanales(),
      ]).finally(() => setLoading(false));
    };
    initializeForm();
  }, [fetchClientes, fetchVehiculos, fetchTiposTarjeta, fetchCanales]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      await fetchSubcanales(parsedValue);
      setFormData(prev => ({ ...prev, subcanal_id: 0 }));
    } else if (name === 'canal_id' && parsedValue === 0) {
      setSubcanales([]);
      setFormData(prev => ({ ...prev, subcanal_id: 0 }));
    }
  };

  const handleSearchClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTermCliente(term);
    setIsDropdownOpen(true);
    const filtered = term.length > 0
      ? clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(term))
      : clientes;
    setFilteredClientes(filtered);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setFormData((prev) => ({ ...prev, cliente_id: cliente.id }));
    setSearchTermCliente(cliente.nombre);
    setIsDropdownOpen(false); // Cerrar el desplegable al seleccionar
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
        router.push('/tarjetas');
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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 px-3 sm:px-4 lg:px-6">
        <Navbar />
        <div className="w-full max-w-7xl bg-white border border-gray-300 p-6 sm:p-10 mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6 
            bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
            transition-all duration-300 text-center">
            Agregar Tarjeta
          </h1>
          <form onSubmit={handleSubmitAgregar} className="space-y-6">
            <div className="mb-4">
              <label htmlFor="numero_tarjeta" className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                Número de Tarjeta
              </label>
              <input
                type="text"
                name="numero_tarjeta"
                value={formData.numero_tarjeta}
                readOnly
                className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="tipo_tarjeta_id" className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                Tipo de Tarjeta
              </label>
              <select
                name="tipo_tarjeta_id"
                value={formData.tipo_tarjeta_id}
                onChange={handleInputChange}
                className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="cliente_id" className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  id="cliente_id"
                  name="cliente_id"
                  value={searchTermCliente}
                  onChange={handleSearchClienteChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Busca o selecciona un cliente..."
                  className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isDropdownOpen && filteredClientes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto left-0 right-0 mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                    {filteredClientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        onClick={() => handleSelectCliente(cliente)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer text-center"
                      >
                        {cliente.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedTipoTarjetaFlota === true && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="mb-4">
                  <label htmlFor="canal_id" className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                    Canal
                  </label>
                  <select
                    name="canal_id"
                    value={formData.canal_id || 0}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label htmlFor="subcanal_id" className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                    Subcanal
                  </label>
                  <select
                    name="subcanal_id"
                    value={formData.subcanal_id || 0}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="mb-4">
                  <label htmlFor="vehiculo_id" className="block text-center text-sm sm:text-base font-bold text-black mb-2">
                    Vehículo
                  </label>
                  <select
                    name="vehiculo_id"
                    value={formData.vehiculo_id || 0}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded text-center text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Seleccionar vehículo</option>
                    {vehiculos.map((vehiculo) => (
                      <option key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.push('/tarjetas')}
                className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base transition-all duration-300"
              >
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}