'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

interface Costo {
  id: number;
  nombre_centro_costos: string;
  empresa: string;
}

interface Empresa {
  id: number;
  nombre_empresa: string;
}

export default function CrearTerminal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    empresa: '',
    estacion_servicio: '',
    codigo_terminal: '',
    nombre_terminal: '',
    numero_serie: '',
    mac: '',
    modelo: '',
    marca: '',
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [costos, setCostos] = useState<Costo[]>([]);
  const [, setLoading] = useState(true);

  // Cargar empresas y centros de costos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasRes, costosRes] = await Promise.all([
          fetch('/api/empresas'),
          fetch('/api/costos'),
        ]);
        const empresasData = await empresasRes.json();
        const costosData = await costosRes.json();
        setEmpresas(empresasData);
        setCostos(costosData);
        console.log('Empresas:', empresasData);
        console.log('Costos:', costosData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
        alert('Error al cargar los datos');
      }
    };
    fetchData();
  }, []);

  // Filtrar centros de costos por empresa seleccionada
  const filteredCostos = formData.empresa
    ? costos.filter((costo) => String(costo.empresa) === String(formData.empresa))
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'empresa' ? { estacion_servicio: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.empresa ||
      !formData.estacion_servicio ||
      !formData.codigo_terminal ||
      !formData.nombre_terminal ||
      !formData.numero_serie ||
      !formData.mac ||
      !formData.modelo ||
      !formData.marca
    ) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const data = new FormData();
    data.append('empresa', formData.empresa);
    data.append('estacion_servicio', formData.estacion_servicio);
    data.append('codigo_terminal', formData.codigo_terminal);
    data.append('nombre_terminal', formData.nombre_terminal);
    data.append('numero_serie', formData.numero_serie);
    data.append('mac', formData.mac);
    data.append('modelo', formData.modelo);
    data.append('marca', formData.marca);

    try {
      const response = await fetch('/api/terminales', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Terminal creada con éxito');
      router.push('/terminales');
    } catch (error) {
      console.error('Error al crear terminal:', error);
      alert('Error al crear la terminal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 px-3 sm:px-4 lg:px-6">
        <Navbar />
      <div className="w-full max-w-2xl sm:max-w-5xl bg-white border p-6 sm:p-10 mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center">Crear Terminal</h1>
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="empresa" className="block text-center text-base sm:text-lg font-medium">
              Empresa
            </label>
            <select
              name="empresa"
              value={formData.empresa}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
              required
            >
              <option value="">Seleccione una empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre_empresa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estacion_servicio" className="block text-center text-base sm:text-lg font-medium">
              Estación de servicio
            </label>
            <select
              name="estacion_servicio"
              value={formData.estacion_servicio}
              onChange={handleInputChange}
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
              disabled={!formData.empresa}
              required
            >
              <option value="">Seleccione una estación</option>
              {filteredCostos.map((costo) => (
                <option key={costo.id} value={costo.id}>
                  {costo.nombre_centro_costos}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div>
              <label htmlFor="codigo_terminal" className="block text-center text-base sm:text-lg font-medium">
                Código terminal
              </label>
              <input
                type="text"
                name="codigo_terminal"
                placeholder="Ejemplo: TER-001"
                value={formData.codigo_terminal}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="nombre_terminal" className="block text-center text-base sm:text-lg font-medium">
                Nombre terminal
              </label>
              <input
                type="text"
                name="nombre_terminal"
                placeholder="Ejemplo: Terminal GSIE El Paraíso"
                value={formData.nombre_terminal}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div>
              <label htmlFor="numero_serie" className="block text-center text-base sm:text-lg font-medium">
                Número de serie
              </label>
              <input
                type="text"
                name="numero_serie"
                placeholder="Ejemplo: SN123456"
                value={formData.numero_serie}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="mac" className="block text-center text-base sm:text-lg font-medium">
                Dirección MAC
              </label>
              <input
                type="text"
                name="mac"
                placeholder="Ejemplo: 00:1A:2B:3C:4D:5E"
                value={formData.mac}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div>
              <label htmlFor="modelo" className="block text-center text-base sm:text-lg font-medium">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                placeholder="Ejemplo: V2 PRO"
                value={formData.modelo}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="marca" className="block text-center text-base sm:text-lg font-medium">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                placeholder="Ejemplo: SUNMI"
                value={formData.marca}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 border border-gray-300 rounded text-center text-base sm:text-lg"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-5 sm:gap-6 mt-6 sm:mt-10">
            <button
              type="button"
              onClick={() => router.push('/terminales')}
              className="w-full sm:w-auto bg-gray-500 text-white px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg hover:bg-gray-600 text-base sm:text-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-500 text-white px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg hover:bg-blue-600 text-base sm:text-lg"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}