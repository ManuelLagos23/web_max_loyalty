'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { usePathname } from 'next/navigation';

interface Canal {
  id: number;
  canal: string;
}

interface Subcanal {
  id: number;
  nombre: string;
  subcanal: number;
}

interface Transaccion {
  id: number;
  monto: number;
  unidades: number;
  odometro: number | null;
  tarjeta_id: number | null;
  monedero_id: number | null;
  canal_id: number;
  subcanal_id: number;
  created_at: string;
  canal: string | null;
  subcanal: string | null;
}

interface GroupedData {
  key: string;
  totalMonto: number;
  totalUnidades: number;
  transactionCount: number;
}

export default function ReportesCanalSubcanal() {
  const [canalId, setCanalId] = useState<string>('');
  const [subcanalId, setSubcanalId] = useState<string>('');
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
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

  const [fechaInicio, setFechaInicio] = useState(redondearMinutosACero());
  const [fechaFinal, setFechaFinal] = useState(redondearMinutosACero());

  // Aggregate data by canal
  const groupByCanal = transacciones.reduce((acc, t) => {
    const key = t.canal ?? 'N/A';
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

  const canalData = Object.values(groupByCanal);

  // Aggregate data by subcanal
  const groupBySubcanal = transacciones.reduce((acc, t) => {
    const key = t.subcanal ?? 'N/A';
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

  const subcanalData = Object.values(groupBySubcanal);

  // Fetch canales
  useEffect(() => {
    const fetchCanales = async () => {
      try {
        const response = await fetch('/api/canales', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setCanales(data);
        } else {
          const { message } = await response.json();
          setError(message || 'Error al obtener los canales.');
        }
      } catch (err) {
        console.error('Error al obtener canales:', err);
        setError('Error al conectar con el servidor.');
      }
    };
    fetchCanales();
  }, []);

  // Fetch subcanales when canalId changes
  useEffect(() => {
    if (!canalId) {
      setSubcanales([]);
      setSubcanalId('');
      return;
    }
    const fetchSubcanales = async () => {
      try {
        const response = await fetch(`/api/subcanales?canal_id=${canalId}`, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setSubcanales(data);
          setSubcanalId(''); // Reset subcanal selection
        } else {
          const { message } = await response.json();
          setError(message || 'Error al obtener los subcanales.');
        }
      } catch (err) {
        console.error('Error al obtener subcanales:', err);
        setError('Error al conectar con el servidor.');
      }
    };
    fetchSubcanales();
  }, [canalId]);

  const isButtonDisabled = !fechaInicio || !fechaFinal || !canalId || !subcanalId;

  const handleObtenerReporte = async () => {
    setError('');
    setTransacciones([]);
    setLoading(true);

    try {
      const response = await fetch('/api/reportes_flota/reporte_canal_subcanal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio,
          fechaFinal,
          canalId: parseInt(canalId),
          subcanalId: parseInt(subcanalId),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTransacciones(data);
        if (data.length === 0) {
          setError('No se encontraron transacciones para los criterios seleccionados.');
        }
      } else {
        const { message, error } = await response.json();
        setError(error || message || 'Error al obtener el reporte.');
      }
    } catch (err) {
      console.error('Error al obtener reporte:', err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();
    const canal = canales.find((c) => c.id === parseInt(canalId));
    const subcanal = subcanales.find((sc) => sc.id === parseInt(subcanalId));
    const canalNombre = canal?.canal || 'Desconocido';
    const subcanalNombre = subcanal?.subcanal || 'Desconocido';

    doc.setFontSize(16);
    doc.text(`Reporte de Transacciones de Flota - ${canalNombre} / ${subcanalNombre}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}`, 14, 30);
    doc.text(`Fecha Final: ${fechaFinal || 'N/A'}`, 100, 30);

    // Resumen por Canal Table
    doc.text('Resumen por Canal', 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [['#', 'Canal', 'Total Monto LPS.', 'Total Unidades (Litros)', 'Número de transacciones']],
      body: canalData.map((item, index) => [
        index + 1,
        item.key,
        item.totalMonto.toFixed(2),
        item.totalUnidades.toFixed(2),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 153, 190] },
    });

    const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    let finalY = (lastAutoTable?.finalY ?? 55) + 10;
    doc.text('Resumen por Subcanal', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Subcanal', 'Total Monto LPS.', 'Total Unidades (Litros)', 'Número de transacciones']],
      body: subcanalData.map((item, index) => [
        index + 1,
        item.key,
        item.totalMonto.toFixed(2),
        item.totalUnidades.toFixed(2),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 100, 180] },
    });

    finalY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 55) + 10;

    doc.text('Transacciones Detalladas', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Canal', 'Subcanal', 'Monto LPS.', 'Unidades (Litros)', 'Odómetro', 'Tarjeta ID', 'Monedero ID', 'Fecha']],
      body: transacciones.map((t, index) => [
        index + 1,
        t.canal ?? 'N/A',
        t.subcanal ?? 'N/A',
        t.monto.toFixed(2),
        t.unidades.toFixed(2),
        t.odometro ?? 'N/A',
        t.tarjeta_id ?? 'N/A',
        t.monedero_id ?? 'N/A',
        new Date(t.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [56, 178, 172] },
    });

    doc.save(`reporte_transacciones_flota_${canalNombre}_${subcanalNombre}_${fechaInicio}_${fechaFinal}.pdf`);
  };

  // Excel Export
  const exportToExcel = () => {
    const canal = canales.find((c) => c.id === parseInt(canalId));
    const subcanal = subcanales.find((sc) => sc.id === parseInt(subcanalId));
    const canalNombre = canal?.canal || 'Desconocido';
    const subcanalNombre = subcanal?.subcanal || 'Desconocido';

    const headerData = [
      { '#': '', Canal: `Fecha Inicio: ${fechaInicio || 'N/A'}`, Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '', Canal: `Fecha Final: ${fechaFinal || 'N/A'}`, Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '', Canal: `Canal: ${canalNombre}`, Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '', Canal: `Subcanal: ${subcanalNombre}`, Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '', Canal: '', Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
    ];

    const canalHeader = [
      { '#': '', Canal: 'Resumen por Canal', Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '#', Canal: 'Canal', Subcanal: 'Total Monto LPS.', Monto: 'Total Unidades (Litros)', Unidades: 'Número de transacciones', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
    ];

    const canalDataRows = canalData.map((item, index) => ({
      '#': index + 1,
      Canal: item.key,
      Subcanal: item.totalMonto.toFixed(2),
      Monto: item.totalUnidades.toFixed(2),
      Unidades: item.transactionCount,
      Odómetro: '',
      'Tarjeta ID': '',
      'Monedero ID': '',
      Fecha: '',
    }));

    const subcanalHeader = [
      { '#': '', Canal: 'Resumen por Subcanal', Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '#', Canal: 'Subcanal', Subcanal: 'Total Monto LPS.', Monto: 'Total Unidades (Litros)', Unidades: 'Número de transacciones', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
    ];

    const subcanalDataRows = subcanalData.map((item, index) => ({
      '#': index + 1,
      Canal: item.key,
      Subcanal: item.totalMonto.toFixed(2),
      Monto: item.totalUnidades.toFixed(2),
      Unidades: item.transactionCount,
      Odómetro: '',
      'Tarjeta ID': '',
      'Monedero ID': '',
      Fecha: '',
    }));

    const transactionHeader = [
      { '#': '', Canal: 'Transacciones Detalladas', Subcanal: '', Monto: '', Unidades: '', Odómetro: '', 'Tarjeta ID': '', 'Monedero ID': '', Fecha: '' },
      { '#': '#', Canal: 'Canal', Subcanal: 'Subcanal', Monto: 'Monto LPS.', Unidades: 'Unidades (Litros)', Odómetro: 'Odómetro', 'Tarjeta ID': 'Tarjeta ID', 'Monedero ID': 'Monedero ID', Fecha: 'Fecha' },
    ];

    const transactionData = transacciones.map((t, index) => ({
      '#': index + 1,
      Canal: t.canal ?? 'N/A',
      Subcanal: t.subcanal ?? 'N/A',
      Monto: t.monto.toFixed(2),
      Unidades: t.unidades.toFixed(2),
      Odómetro: t.odometro ?? 'N/A',
      'Tarjeta ID': t.tarjeta_id ?? 'N/A',
      'Monedero ID': t.monedero_id ?? 'N/A',
      Fecha: new Date(t.created_at).toLocaleDateString(),
    }));

    const worksheetData = [
      ...headerData,
      ...canalHeader,
      ...canalDataRows,
      ...subcanalHeader,
      ...subcanalDataRows,
      ...transactionHeader,
      ...transactionData,
    ];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
    ];

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 8 } },
      { s: { r: headerData.length + canalHeader.length + canalDataRows.length, c: 0 }, e: { r: headerData.length + canalHeader.length + canalDataRows.length, c: 8 } },
      { s: { r: headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length, c: 0 }, e: { r: headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length, c: 8 } },
    ];

    const canalHeaderCells = [`A${headerData.length + 2}`, `B${headerData.length + 2}`, `C${headerData.length + 2}`, `D${headerData.length + 2}`, `E${headerData.length + 2}`, `F${headerData.length + 2}`, `G${headerData.length + 2}`, `H${headerData.length + 2}`, `I${headerData.length + 2}`];
    const subcanalHeaderCells = [`A${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `B${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `C${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `D${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `E${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `F${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `G${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `H${headerData.length + canalHeader.length + canalDataRows.length + 2}`, `I${headerData.length + canalHeader.length + canalDataRows.length + 2}`];
    const transactionHeaderCells = [`A${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `B${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `C${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `D${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `E${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `F${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `G${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `H${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`, `I${headerData.length + canalHeader.length + canalDataRows.length + subcanalHeader.length + subcanalDataRows.length + 2}`];

    [...canalHeaderCells, ...subcanalHeaderCells, ...transactionHeaderCells].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones Flota');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_transacciones_flota_${canalNombre}_${subcanalNombre}_${fechaInicio}_${fechaFinal}.xlsx`);
  };

  const reportRoutes = [
    { name: 'Reporte por estación', href: '/reportes_flota/reporte_estacion' },
    { name: 'Reporte por canal y subcanal', href: '/reportes_flota/reporte_canal_subcanal' },
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
                  <label htmlFor="canal" className="block text-sm font-medium text-gray-700">
                    Canal
                  </label>
                  <select
                    id="canal"
                    value={canalId}
                    onChange={(e) => setCanalId(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Seleccione un canal</option>
                    {canales.map((canal) => (
                      <option key={canal.id} value={canal.id}>
                        {canal.canal}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subcanal" className="block text-sm font-medium text-gray-700">
                    Subcanal
                  </label>
                  <select
                    id="subcanal"
                    value={subcanalId}
                    onChange={(e) => setSubcanalId(e.target.value)}
                    required
                    disabled={!canalId}
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Seleccione un subcanal</option>
                    {subcanales.map((subcanal) => (
                      <option key={subcanal.id} value={subcanal.id}>
                        {subcanal.subcanal}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleObtenerReporte}
                    disabled={isButtonDisabled || loading}
                    className={`w-32 px-3 py-1.5 rounded-lg text-sm text-white font-medium transition-all duration-300 ${
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
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {transacciones.length > 0 && (
              <div className="mt-6 bg-gray-100 rounded-lg shadow-md overflow-x-auto">
                <div className="flex justify-between items-center mb-4 px-4 pt-4">
                  <h2 className="text-lg font-semibold text-gray-900">Reporte de Transacciones de Flota</h2>
                  <div>
                    <button
                      onClick={exportToPDF}
                      className="mr-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
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
                  {/* Resumen por Canal */}
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={9} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Resumen por Canal
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades (Litros)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de transacciones</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {canalData.map((item, index) => (
                      <tr key={`canal-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.key}</td>
                        <td className="px-4 py-2">{item.totalMonto.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.totalUnidades.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.transactionCount}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Resumen por Subcanal */}
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={9} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Resumen por Subcanal
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Subcanal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades (Litros)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de transacciones</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcanalData.map((item, index) => (
                      <tr key={`subcanal-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.key}</td>
                        <td className="px-4 py-2">{item.totalMonto.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.totalUnidades.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.transactionCount}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Transacciones Detalladas */}
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={9} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Transacciones Detalladas
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Subcanal</th>
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
                        <td className="px-4 py-2">{transaccion.canal ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.subcanal ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.monto.toFixed(2)}</td>
                        <td className="px-4 py-2">{transaccion.unidades.toFixed(2)}</td>
                        <td className="px-4 py-2">{transaccion.odometro ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.tarjeta_id ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.monedero_id ?? 'N/A'}</td>
                        <td className="px-4 py-2">{new Date(transaccion.created_at).toLocaleDateString()}</td>
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