'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { usePathname } from 'next/navigation';

// Extender la interfaz de jsPDF para incluir lastAutoTable
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY?: number;
  };
}

interface Establecimiento {
  id: number;
  nombre_centro_costos: string;
}

interface Transaccion {
  id: number;
  monto: number;
  unidades: number;
  odometro: number | null;
  tarjeta_id: number | null;
  monedero_id: number | null;
  establecimiento_id: number;
  tipo_combustible_id: number;
  created_at: string;
  tipo_combustible: string | null;
}

interface GroupedData {
  key: string;
  totalMonto: number;
  totalUnidades: number;
  transactionCount: number;
}

export default function Reportes() {
  const [establecimientoId, setEstablecimientoId] = useState<string>('');
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const redondearMinutosACero = (fecha = new Date()) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setMinutes(0, 0, 0);
    const año = nuevaFecha.getFullYear();
    const mes = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const dia = String(nuevaFecha.getDate()).padStart(2, '0');
    const horas = '00';
    const minutos = '00';
    return `${año}-${mes}-${dia}T${horas}:${minutos}`;
  };

  const [fechaInicio, setFechaInicio] = useState<string>(redondearMinutosACero());
  const [fechaFinal, setFechaFinal] = useState<string>(redondearMinutosACero());

  // Aggregate data by tipo_combustible
  const groupByTipoCombustible = transacciones.reduce((acc, t) => {
    const key = t.tipo_combustible ?? 'N/A';
    if (!acc[key]) {
      acc[key] = {
        key,
        totalMonto: 0,
        totalUnidades: 0,
        transactionCount: 0,
      };
    }
    acc[key].totalMonto += t.monto;
    acc[key].totalUnidades += t.unidades;
    acc[key].transactionCount += 1;
    return acc;
  }, {} as Record<string, GroupedData>);

  const tipoCombustibleData = Object.values(groupByTipoCombustible);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await fetch('/api/costos', { method: 'GET' });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Error al obtener los establecimientos.');
        }
        const data: Establecimiento[] = await response.json();
        setEstablecimientos(data);
      } catch (err) {
        console.error('Error al obtener establecimientos:', err);
        setError(err instanceof Error ? err.message : 'Error al conectar con el servidor.');
      }
    };
    fetchEstablecimientos();
  }, []);

  const isButtonDisabled = !fechaInicio || !fechaFinal || !establecimientoId;

  const handleObtenerReporte = async () => {
    setError('');
    setTransacciones([]);
    setLoading(true);

    try {
      const parsedEstablecimientoId = parseInt(establecimientoId);
      if (isNaN(parsedEstablecimientoId)) {
        throw new Error('Establecimiento inválido.');
      }

      const response = await fetch('/api/reportes_flota/reporte_estacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio,
          fechaFinal,
          establecimientoId: parsedEstablecimientoId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Error al obtener el reporte.');
      }

      const data: Transaccion[] = await response.json();
      setTransacciones(data);
      if (data.length === 0) {
        setError('No se encontraron transacciones para los criterios seleccionados.');
      }
    } catch (err) {
      console.error('Error al obtener reporte:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF() as JsPDFWithAutoTable;
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';
    const safeFechaInicio = fechaInicio.replace(/[:]/g, '-');
    const safeFechaFinal = fechaFinal.replace(/[:]/g, '-');

    doc.setFontSize(16);
    doc.text(`Reporte de Transacciones de Flota - ${establecimientoNombre}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}`, 14, 30);
    doc.text(`Fecha Final: ${fechaFinal || 'N/A'}`, 100, 30);

    // Resumen por Tipo de Combustible
    doc.text('Resumen por Tipo de Combustible', 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [['#', 'Tipo de Combustible', 'Total Monto LPS.', 'Total Unidades (Litros)', 'Número de transacciones']],
      body: tipoCombustibleData.map((item, index) => [
        index + 1,
        item.key,
        item.totalMonto.toFixed(2),
        item.totalUnidades.toFixed(2),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 153, 190] },
    });

    const finalY = (doc.lastAutoTable.finalY ?? 55) + 10;

    // Transacciones Detalladas
    doc.text('Transacciones Detalladas', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Tipo Combustible', 'Monto LPS.', 'Unidades (Litros)', 'Odómetro', 'Tarjeta ID', 'Monedero ID', 'Fecha']],
      body: transacciones.map((t, index) => [
        index + 1,
        t.tipo_combustible ?? 'N/A',
        t.monto.toFixed(2),
        t.unidades.toFixed(2),
        t.odometro?.toFixed(2) ?? 'N/A',
        t.tarjeta_id ?? 'N/A',
        t.monedero_id ?? 'N/A',
        new Date(t.created_at).toLocaleDateString('es-HN'),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [56, 178, 172] },
    });

    doc.save(`reporte_transacciones_flota_${establecimientoNombre}_${safeFechaInicio}_${safeFechaFinal}.pdf`);
  };

  // Excel Export
  const exportToExcel = () => {
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';
    const safeFechaInicio = fechaInicio.replace(/[:]/g, '-');
    const safeFechaFinal = fechaFinal.replace(/[:]/g, '-');

    const headerData = [
      { '#': '', 'Tipo Combustible': `Fecha Inicio: ${fechaInicio || 'N/A'}`, 'Monto': '', 'Unidades': '', 'Odómetro': '', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
      { '#': '', 'Tipo Combustible': `Fecha Final: ${fechaFinal || 'N/A'}`, 'Monto': '', 'Unidades': '', 'Odómetro': '', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
      { '#': '', 'Tipo Combustible': `Establecimiento: ${establecimientoNombre}`, 'Monto': '', 'Unidades': '', 'Odómetro': '', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
      { '#': '', 'Tipo Combustible': '', 'Monto': '', 'Unidades': '', 'Odómetro': '', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
    ];

    const tipoCombustibleHeader = [
      { '#': '', 'Tipo Combustible': 'Resumen por Tipo de Combustible', 'Monto': '', 'Unidades': '', 'Odómetro': '', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
      { '#': '#', 'Tipo Combustible': 'Tipo de Combustible', 'Monto': 'Total Monto LPS.', 'Unidades': 'Total Unidades (Litros)', 'Odómetro': 'Número de transacciones', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
    ];

    const tipoCombustibleDataRows = tipoCombustibleData.map((item, index) => ({
      '#': index + 1,
      'Tipo Combustible': item.key,
      'Monto': item.totalMonto.toFixed(2),
      'Unidades': item.totalUnidades.toFixed(2),
      'Odómetro': item.transactionCount,
      'Tarjeta ID': '',
      'Monedero ID': '',
      'Fecha': '',
    }));

    const transactionHeader = [
      { '#': '', 'Tipo Combustible': 'Transacciones Detalladas', 'Monto': '', 'Unidades': '', 'Odómetro': '', 'Tarjeta ID': '', 'Monedero ID': '', 'Fecha': '' },
      { '#': '#', 'Tipo Combustible': 'Tipo Combustible', 'Monto': 'Monto LPS.', 'Unidades': 'Unidades (Litros)', 'Odómetro': 'Odómetro', 'Tarjeta ID': 'Tarjeta ID', 'Monedero ID': 'Monedero ID', 'Fecha': 'Fecha' },
    ];

    const transactionData = transacciones.map((t, index) => ({
      '#': index + 1,
      'Tipo Combustible': t.tipo_combustible ?? 'N/A',
      'Monto': t.monto.toFixed(2),
      'Unidades': t.unidades.toFixed(2),
      'Odómetro': t.odometro?.toFixed(2) ?? 'N/A',
      'Tarjeta ID': t.tarjeta_id ?? 'N/A',
      'Monedero ID': t.monedero_id ?? 'N/A',
      'Fecha': new Date(t.created_at).toLocaleDateString('es-HN'),
    }));

    const worksheetData = [
      ...headerData,
      ...tipoCombustibleHeader,
      ...tipoCombustibleDataRows,
      ...transactionHeader,
      ...transactionData,
    ];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
      { s: { r: headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length, c: 0 }, e: { r: headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length, c: 7 } },
    ];

    const tipoCombustibleHeaderCells = [
      `A${headerData.length + 2}`,
      `B${headerData.length + 2}`,
      `C${headerData.length + 2}`,
      `D${headerData.length + 2}`,
      `E${headerData.length + 2}`,
      `F${headerData.length + 2}`,
      `G${headerData.length + 2}`,
      `H${headerData.length + 2}`,
    ];
    const transactionHeaderCells = [
      `A${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `B${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `C${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `D${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `E${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `F${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `G${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `H${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
    ];

    [...tipoCombustibleHeaderCells, ...transactionHeaderCells].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D3D3D3' } } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones Flota');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_transacciones_flota_${establecimientoNombre}_${safeFechaInicio}_${safeFechaFinal}.xlsx`);
  };

  const reportRoutes = [
    { name: 'Reporte por estación', href: '/reportes_flota/reporte_estacion' },
    { name: 'Reporte por canal', href: '/reportes_flota/reporte_canal_subcanal' },
    { name: 'Reporte de vehículos', href: '/reportes_flota/reporte_rendimiento' },
  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
                Reportes de Flota
              </h1>
              <nav className="flex justify-center space-x-4">
                {reportRoutes.map((reporte) => {
                  const isActive = pathname === reporte.href;
                  return (
                    <Link key={reporte.name} href={reporte.href}>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-gray-200 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {reporte.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                    Fecha de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="fechaFinal" className="block text-sm font-medium text-gray-700">
                    Fecha Final
                  </label>
                  <input
                    type="datetime-local"
                    id="fechaFinal"
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="establecimiento" className="block text-sm font-medium text-gray-700">
                    Establecimiento
                  </label>
                  <select
                    id="establecimiento"
                    value={establecimientoId}
                    onChange={(e) => setEstablecimientoId(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Seleccione un establecimiento</option>
                    {establecimientos.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.nombre_centro_costos}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleObtenerReporte}
                    disabled={isButtonDisabled || loading}
                    className={`w-full px-3 py-1.5 rounded-lg text-sm text-white font-medium transition-all duration-300 ${
                      isButtonDisabled || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Cargando...' : 'Obtener Reporte'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-6xl mx-auto">
                {error}
              </div>
            )}

            {transacciones.length > 0 && (
              <div className="mt-6 bg-gray-100 rounded-lg shadow-md overflow-x-auto max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-4 px-4 pt-4">
                  <h2 className="text-lg font-semibold text-gray-900">Reporte de Transacciones de Flota</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportToPDF}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                    >
                      Descargar PDF
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                    >
                      Descargar Excel
                    </button>
                  </div>
                </div>
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={8} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Resumen por Tipo de Combustible
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo de Combustible</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades (Litros)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de transacciones</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipoCombustibleData.map((item, index) => (
                      <tr key={`tipo-combustible-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.key}</td>
                        <td className="px-4 py-2">{item.totalMonto.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.totalUnidades.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.transactionCount}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={8} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Transacciones Detalladas
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo Combustible</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Unidades (Litros)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Odómetro</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tarjeta ID</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Monedero ID</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((transaccion, index) => (
                      <tr key={`transaccion-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{transaccion.tipo_combustible ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.monto.toFixed(2)}</td>
                        <td className="px-4 py-2">{transaccion.unidades.toFixed(2)}</td>
                        <td className="px-4 py-2">{transaccion.odometro?.toFixed(2) ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.tarjeta_id ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.monedero_id ?? 'N/A'}</td>
                        <td className="px-4 py-2">{new Date(transaccion.created_at).toLocaleDateString('es-HN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}