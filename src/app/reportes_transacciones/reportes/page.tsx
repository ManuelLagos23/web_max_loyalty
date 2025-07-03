'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { usePathname } from 'next/navigation';

interface Establecimiento {
  id: number;
  nombre_centro_costos: string;
}

interface Transaccion {
  canal: string | null;
  monto: number;
  descuento: number;
  tipo_combustible: string;
  unidades: number | null;
  cliente: string;
  fecha: string;
}

interface GroupedData {
  key: string;
  totalMonto: number;
  totalDescuento: number;
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

  // Helper function to format numbers with thousand separators
  const formatNumber = (value: number | null) => {
    if (value === null || isNaN(value)) return 'N/A';
    return value.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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

  // Aggregate data by canal
  const groupByCanal = transacciones.reduce((acc, t) => {
    const key = t.canal ?? 'N/A';
    if (!acc[key]) {
      acc[key] = {
        key,
        totalMonto: 0,
        totalDescuento: 0,
        totalUnidades: 0,
        transactionCount: 0,
      };
    }
    acc[key].totalMonto += t.monto;
    acc[key].totalDescuento += t.descuento;
    acc[key].totalUnidades += t.unidades ?? 0;
    acc[key].transactionCount += 1;
    return acc;
  }, {} as Record<string, GroupedData>);

  const canalData = Object.values(groupByCanal);

  // Aggregate data by tipo_combustible
  const groupByTipoCombustible = transacciones.reduce((acc, t) => {
    const key = t.tipo_combustible;
    if (!acc[key]) {
      acc[key] = {
        key,
        totalMonto: 0,
        totalDescuento: 0,
        totalUnidades: 0,
        transactionCount: 0,
      };
    }
    acc[key].totalMonto += t.monto;
    acc[key].totalDescuento += t.descuento;
    acc[key].totalUnidades += t.unidades ?? 0;
    acc[key].transactionCount += 1;
    return acc;
  }, {} as Record<string, GroupedData>);

  const tipoCombustibleData = Object.values(groupByTipoCombustible);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await fetch('/api/costos', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setEstablecimientos(data);
        } else {
          const { message } = await response.json();
          setError(message || 'Error al obtener los establecimientos.');
        }
      } catch (err) {
        console.error('Error al obtener establecimientos:', err);
        setError('Error al conectar con el servidor.');
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
      const response = await fetch('/api/reporte_general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio,
          fechaFinal,
          establecimientoId: parseInt(establecimientoId),
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
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';

    doc.setFontSize(16);
    doc.text(`Reporte de Transacciones ${establecimientoNombre}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}`, 14, 30);
    doc.text(`Fecha Final: ${fechaFinal || 'N/A'}`, 100, 30);

    // Resumen por Tipo de Combustible Table
    doc.text('Resumen por Tipo de Combustible', 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [['#', 'Tipo Combustible', 'Total Monto LPS.', 'Total Descuento LPS.', 'Total Unidades(Litros)', 'Número de transacciones']],
      body: tipoCombustibleData.map((item, index) => [
        index + 1,
        item.key,
        formatNumber(item.totalMonto),
        formatNumber(item.totalDescuento),
        formatNumber(item.totalUnidades),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 153, 190] },
    });

    const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    let finalY = (lastAutoTable?.finalY ?? 55) + 10;
    doc.text('Resumen por Canal', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Canal', 'Total Monto LPS.', 'Total Descuento LPS.', 'Total Unidades (Litros).', 'Número de transacciones']],
      body: canalData.map((item, index) => [
        index + 1,
        item.key,
        formatNumber(item.totalMonto),
        formatNumber(item.totalDescuento),
        formatNumber(item.totalUnidades),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 100, 180] },
    });

    finalY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 55) + 10;
    doc.text('Transacciones Detalladas', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Canal', 'Monto LPS.', 'Descuento LPS.', 'Tipo Combustible', 'Unidades (Litros.)', 'Cliente', 'Fecha']],
      body: transacciones.map((t, index) => [
        index + 1,
        t.canal ?? 'N/A',
        formatNumber(t.monto),
        formatNumber(t.descuento),
        t.tipo_combustible,
        formatNumber(t.unidades),
        t.cliente,
        new Date(t.fecha).toLocaleDateString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [56, 178, 172] },
    });

    doc.save(`reporte_transacciones_${fechaInicio}_${fechaFinal}.pdf`);
  };

  // Excel Export
  const exportToExcel = () => {
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';

    const headerData = [
      { '#': '', Canal: `Fecha Inicio: ${fechaInicio || 'N/A'}`, Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { '#': '', Canal: `Fecha Final: ${fechaFinal || 'N/A'}`, Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { '#': '', Canal: `Establecimiento: ${establecimientoNombre}`, Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { '#': '', Canal: '', Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
    ];

    const tipoCombustibleHeader = [
      { '#': '', Canal: 'Resumen por Tipo de Combustible', Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { '#': '#', Canal: 'Tipo Combustible', Monto: 'Total Monto LPS.', Descuento: 'Total Descuento LPS.', 'Tipo Combustible': 'Total Unidades (Litros.)', Unidades: 'Número de transacciones', Cliente: '', Fecha: '' },
    ];

    const tipoCombustibleDataRows = tipoCombustibleData.map((item, index) => ({
      '#': index + 1,
      Canal: item.key,
      Monto: formatNumber(item.totalMonto),
      Descuento: formatNumber(item.totalDescuento),
      'Tipo Combustible': formatNumber(item.totalUnidades),
      Unidades: item.transactionCount,
      Cliente: '',
      Fecha: '',
    }));

    const canalHeader = [
      { '#': '', Canal: 'Resumen por Canal', Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { '#': '#', Canal: 'Canal', Monto: 'Total Monto LPS.', Descuento: 'Total Descuento LPS.', 'Tipo Combustible': 'Total Unidades (Litros)', Unidades: 'Número de transacciones', Cliente: '', Fecha: '' },
    ];

    const canalDataRows = canalData.map((item, index) => ({
      '#': index + 1,
      Canal: item.key,
      Monto: formatNumber(item.totalMonto),
      Descuento: formatNumber(item.totalDescuento),
      'Tipo Combustible': formatNumber(item.totalUnidades),
      Unidades: item.transactionCount,
      Cliente: '',
      Fecha: '',
    }));

    const transactionHeader = [
      { '#': '', Canal: 'Transacciones Detalladas', Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { '#': '#', Canal: 'Canal', Monto: 'Monto', Descuento: 'Descuento', 'Tipo Combustible': 'Tipo Combustible', Unidades: 'Unidades', Cliente: 'Cliente', Fecha: 'Fecha' },
    ];

    const transactionData = transacciones.map((t, index) => ({
      '#': index + 1,
      Canal: t.canal ?? 'N/A',
      Monto: formatNumber(t.monto),
      Descuento: formatNumber(t.descuento),
      'Tipo Combustible': t.tipo_combustible,
      Unidades: formatNumber(t.unidades),
      Cliente: t.cliente,
      Fecha: new Date(t.fecha).toLocaleDateString(),
    }));

    const worksheetData = [
      ...headerData,
      ...tipoCombustibleHeader,
      ...tipoCombustibleDataRows,
      ...canalHeader,
      ...canalDataRows,
      ...transactionHeader,
      ...transactionData,
    ];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 15 }, // Increased width to accommodate thousand separators
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
    ];

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } },
      { s: { r: headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length, c: 0 }, e: { r: headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length, c: 7 } },
      { s: { r: headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length, c: 0 }, e: { r: headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length, c: 7 } },
    ];

    const tipoCombustibleHeaderCells = [
      `A${headerData.length + 2}`,
      `B${headerData.length + 2}`,
      `C${headerData.length + 2}`,
      `D${headerData.length + 2}`,
      `E${headerData.length + 2}`,
      `F${headerData.length + 2}`,
      `G${headerData.length + 2}`,
    ];
    const canalHeaderCells = [
      `A${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `B${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `C${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `D${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `E${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `F${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
      `G${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + 2}`,
    ];
    const transactionHeaderCells = [
      `A${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `B${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `C${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `D${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `E${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `F${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `G${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
      `H${headerData.length + tipoCombustibleHeader.length + tipoCombustibleDataRows.length + canalHeader.length + canalDataRows.length + 2}`,
    ];

    [...tipoCombustibleHeaderCells, ...canalHeaderCells, ...transactionHeaderCells].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_transacciones_${fechaInicio}_${fechaFinal}.xlsx`);
  };

  const reportRoutes = [
    { name: 'Reporte general', href: '/reportes_transacciones/reportes' },
    { name: 'Reporte por canal', href: '/reportes_transacciones/reporte_canal' },
  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
                Reportes
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
                  <h2 className="text-lg font-semibold text-gray-900">Reporte General</h2>
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
                  {/* Resumen por Tipo de Combustible */}
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={8} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Resumen por Tipo de Combustible
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo Combustible</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Descuento LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades (Litros)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de transacciones</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipoCombustibleData.map((item, index) => (
                      <tr key={`tipo-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.key}</td>
                        <td className="px-4 py-2">{formatNumber(item.totalMonto)}</td>
                        <td className="px-4 py-2">{formatNumber(item.totalDescuento)}</td>
                        <td className="px-4 py-2">{formatNumber(item.totalUnidades)}</td>
                        <td className="px-4 py-2">{item.transactionCount}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Resumen por Canal */}
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={8} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Resumen por Canal
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Descuento LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades (Litros).</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Número de transacciones</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {canalData.map((item, index) => (
                      <tr key={`canal-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.key}</td>
                        <td className="px-4 py-2">{formatNumber(item.totalMonto)}</td>
                        <td className="px-4 py-2">{formatNumber(item.totalDescuento)}</td>
                        <td className="px-4 py-2">{formatNumber(item.totalUnidades)}</td>
                        <td className="px-4 py-2">{item.transactionCount}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Transacciones Detalladas */}
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={8} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Transacciones Detalladas
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Monto LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Descuento LPS.</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo Combustible</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Unidades (Litros.)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cliente</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((transaccion, index) => (
                      <tr key={`transaccion-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{transaccion.canal ?? 'N/A'}</td>
                        <td className="px-4 py-2">{formatNumber(transaccion.monto)}</td>
                        <td className="px-4 py-2">{formatNumber(transaccion.descuento)}</td>
                        <td className="px-4 py-2">{transaccion.tipo_combustible}</td>
                        <td className="px-4 py-2">{formatNumber(transaccion.unidades)}</td>
                        <td className="px-4 py-2">{transaccion.cliente}</td>
                        <td className="px-4 py-2">{new Date(transaccion.fecha).toLocaleDateString()}</td>
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