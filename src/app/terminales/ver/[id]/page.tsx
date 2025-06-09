'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

type Terminal = {
  id: number;
  codigo_terminal: string;
  nombre_terminal: string;
  numero_serie: string;
  mac: string;
  modelo: string;
  marca: string;
  id_activacion?: string;
  empresa_id: number;
  estacion_servicio_id: number;
};

type Empresa = {
  id: number;
  nombre_empresa: string;
};

type Costo = {
  id: number;
  nombre_centro_costos: string;
};

export default function TerminalView() {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [costos, setCostos] = useState<Costo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchTerminal = async () => {
      try {
        const response = await fetch(`/api/terminales/${id}`);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setTerminal(data);
      } catch (error) {
        console.error('Error fetching terminal:', error);
        setError('Error al cargar la terminal');
      }
    };

    const fetchEmpresas = async () => {
      try {
        const response = await fetch('/api/empresas');
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setEmpresas(data);
      } catch (error) {
        console.error('Error fetching empresas:', error);
        setError('Error al cargar las empresas');
      }
    };

    const fetchCostos = async () => {
      try {
        const response = await fetch('/api/costos');
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setCostos(data);
      } catch (error) {
        console.error('Error fetching costos:', error);
        setError('Error al cargar los centros de costos');
      }
    };

    const loadData = async () => {
      await Promise.all([fetchTerminal(), fetchEmpresas(), fetchCostos()]);
      setLoading(false);
    };

    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !terminal) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 font-medium text-lg">{error || 'Terminal no encontrada'}</p>
      </div>
    );
  }

  // Debug logging
  console.log('Terminal Data:', terminal);
  console.log('Empresas Data:', empresas);
  console.log('Costos Data:', costos);
  console.log('Empresa ID:', terminal.empresa_id, 'Matched:', empresas.find(e => e.id === terminal.empresa_id));
  console.log('Estacion Servicio ID:', terminal.estacion_servicio_id, 'Matched:', costos.find(c => c.id === terminal.estacion_servicio_id));

  const fieldGroups = [
    {
      label: 'Identificación',
      fields: [
        { label: 'Código Terminal', value: terminal.codigo_terminal },
        { label: 'Nombre Terminal', value: terminal.nombre_terminal },
        { label: 'Número de Serie', value: terminal.numero_serie },
        { label: 'MAC', value: terminal.mac },
      ],
    },
    {
      label: 'Especificaciones',
      fields: [
        { label: 'Modelo', value: terminal.modelo },
        { label: 'Marca', value: terminal.marca },
      ],
    },
    
    {
      label: 'Estado',
      fields: [
        { label: 'ID de Activación', value: terminal.id_activacion || '-' },
      ],
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-gray-800 py-6 px-6 sm:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Detalles de la Terminal
            </h1>
            <p className="text-blue-100 text-center mt-1 text-sm sm:text-base">
              {terminal.nombre_terminal} ({terminal.codigo_terminal})
            </p>
          </div>
          <div className="p-6 sm:p-8">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[0].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[0].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[1].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[1].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {fieldGroups[2].label}
                </h2>
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {fieldGroups[2].fields.map((field, fieldIdx) => (
                      <tr
                        key={fieldIdx}
                        className={`${fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-200">
                          {field.label}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-200">
                          {field.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => router.push('/terminales')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base font-semibold"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}