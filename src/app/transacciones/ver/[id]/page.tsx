'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

type Transaccion = {
  id: number;
  cliente_nombre: string;
  establecimiento_nombre: string;
  fecha: string;
  monto: number;
  terminal_nombre: string;
  numero_tarjeta: string | null;
  estado: string | null;
  unidades: number;
  descuento: number;
  canal_nombre: string;
  tipo_combustible_nombre: string;
  turno_id: number | null;
  turno_estado: string | null;
};

export default function VerTransaccion() {
  const { id } = useParams();
  const router = useRouter();
  const [transaccion, setTransaccion] = useState<Transaccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaccion = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/transacciones/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTransaccion(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Transacción no encontrada');
        }
      } catch (error) {
        console.error('Error fetching transaccion:', error);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaccion();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !transaccion) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-700 font-medium text-base">{error || 'Transacción no encontrada'}</p>
      </div>
    );
  }

  const fieldGroups = [
    {
      label: 'Detalles Principales',
      fields: [
        { label: 'Cantidad (Litros):', value: transaccion.unidades != null ? transaccion.unidades.toFixed(2) : 'N/A' },
        { label: 'Número de Tarjeta:', value: transaccion.numero_tarjeta ?? 'Sin tarjeta' },
        { label: 'Tipo de Combustible:', value: transaccion.tipo_combustible_nombre || '-' },
        { label: 'Cliente:', value: transaccion.cliente_nombre ?? 'Sin cliente' },
      ],
    },
    {
      label: 'Información Adicional',
      fields: [
        { label: 'Fecha:', value: new Date(transaccion.fecha).toLocaleDateString() },
        { label: 'Monto (LPS.):', value: transaccion.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
        { label: 'Establecimiento:', value: transaccion.establecimiento_nombre },
        { label: 'Terminal:', value: transaccion.terminal_nombre },
        { label: 'Estado:', value: transaccion.estado ? 'Validada' : 'Cancelada' },
        { label: 'Canal:', value: transaccion.canal_nombre },
        { label: 'Descuento (LPS.):', value: transaccion.descuento != null ? transaccion.descuento.toFixed(2) : 'N/A' },
        { label: 'Turno ID:', value: transaccion.turno_id ?? 'N/A' },
      ],
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="bg-gray-800 py-4 px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Recibo de Transacción
            </h1>
            <p className="text-blue-100 text-center mt-1 text-sm">
              Transacción ID: {transaccion.id}
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4">
              {fieldGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="animate-fade-in">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-1">
                    {group.label}
                  </h2>
                  <table className="w-full table-auto border-collapse">
                    <tbody>
                      {group.fields.map((field, fieldIdx) => (
                        <tr
                          key={fieldIdx}
                          className={`${fieldIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
                        >
                          <td className="py-2 px-3 text-sm font-bold text-gray-600 border-b border-gray-200">
                            {field.label}
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-800 border-b border-gray-200">
                            {field.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => router.push('/transacciones')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300
                  shadow-md hover:shadow-lg text-sm font-semibold"
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