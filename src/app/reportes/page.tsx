'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
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
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFinal, setFechaFinal] = useState<string>('');
  const [establecimientoId, setEstablecimientoId] = useState<string>('');
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();

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
          setError('No se encontraron transacciones para el rango de fechas seleccionado.');
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

  // PDF Export for Canal
  const exportCanalToPDF = () => {
    const doc = new jsPDF();
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';

    doc.setFontSize(16);
    doc.text('Reporte de Transacciones - Resumen por Canal', 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}                       Fecha Final: ${fechaFinal || 'N/A'}`, 14, 30);

    doc.text(`Establecimiento: ${establecimientoNombre}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [['Canal', 'Total Monto', 'Total Descuento', 'Total Unidades', 'Cantidad Transacciones']],
      body: canalData.map((item) => [
        item.key,
        item.totalMonto.toFixed(2),
        item.totalDescuento.toFixed(2),
        item.totalUnidades.toFixed(2),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [46, 204, 113] },
    });

    doc.save(`reporte_canal_${fechaInicio}_${fechaFinal}.pdf`);
  };

  // PDF Export for Tipo Combustible
  const exportTipoCombustibleToPDF = () => {
    const doc = new jsPDF();
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';

    doc.setFontSize(16);
    doc.text('Reporte de Transacciones - Resumen por Tipo de Combustible', 14, 20);
    doc.setFontSize(12);
 doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}                       Fecha Final: ${fechaFinal || 'N/A'}`, 14, 30);

    doc.text(`Establecimiento: ${establecimientoNombre}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [['Tipo Combustible', 'Total Monto', 'Total Descuento', 'Total Unidades', 'Cantidad Transacciones']],
      body: tipoCombustibleData.map((item) => [
        item.key,
        item.totalMonto.toFixed(2),
        item.totalDescuento.toFixed(2),
        item.totalUnidades.toFixed(2),
        item.transactionCount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 159, 64] },
    });

    doc.save(`reporte_tipo_combustible_${fechaInicio}_${fechaFinal}.pdf`);
  };

  // Excel Export for Canal
  const exportCanalToExcel = () => {
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';

    const headerData = [
      { Canal: `Fecha Inicio: ${fechaInicio || 'N/A'}`, Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { Canal: `Fecha Final: ${fechaFinal || 'N/A'}`, Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { Canal: `Establecimiento: ${establecimientoNombre}`, Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { Canal: '', Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { Canal: 'Resumen por Canal', Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { Canal: 'Canal', Monto: 'Total Monto', Descuento: 'Total Descuento', 'Total Unidades': 'Total Unidades', 'Cantidad Transacciones': 'Cantidad Transacciones' },
    ];

    const canalDataRows = canalData.map((item) => ({
      Canal: item.key,
      Monto: item.totalMonto.toFixed(2),
      Descuento: item.totalDescuento.toFixed(2),
      'Total Unidades': item.totalUnidades.toFixed(2),
      'Cantidad Transacciones': item.transactionCount,
    }));

    const worksheetData = [...headerData, ...canalDataRows];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
    ];

    const headerCells = ['A6', 'B6', 'C6', 'D6', 'E6'];
    headerCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen por Canal');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_canal_${fechaInicio}_${fechaFinal}.xlsx`);
  };

  // Excel Export for Tipo Combustible
  const exportTipoCombustibleToExcel = () => {
    const establecimiento = establecimientos.find((est) => est.id === parseInt(establecimientoId));
    const establecimientoNombre = establecimiento?.nombre_centro_costos || 'Desconocido';

    const headerData = [
      { 'Tipo Combustible': `Fecha Inicio: ${fechaInicio || 'N/A'}`, Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { 'Tipo Combustible': `Fecha Final: ${fechaFinal || 'N/A'}`, Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { 'Tipo Combustible': `Establecimiento: ${establecimientoNombre}`, Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { 'Tipo Combustible': '', Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { 'Tipo Combustible': 'Resumen por Tipo de Combustible', Monto: '', Descuento: '', 'Total Unidades': '', 'Cantidad Transacciones': '' },
      { 'Tipo Combustible': 'Tipo Combustible', Monto: 'Total Monto', Descuento: 'Total Descuento', 'Total Unidades': 'Total Unidades', 'Cantidad Transacciones': 'Cantidad Transacciones' },
    ];

    const tipoCombustibleDataRows = tipoCombustibleData.map((item) => ({
      'Tipo Combustible': item.key,
      Monto: item.totalMonto.toFixed(2),
      Descuento: item.totalDescuento.toFixed(2),
      'Total Unidades': item.totalUnidades.toFixed(2),
      'Cantidad Transacciones': item.transactionCount,
    }));

    const worksheetData = [...headerData, ...tipoCombustibleDataRows];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
    ];

    const headerCells = ['A6', 'B6', 'C6', 'D6', 'E6'];
    headerCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen por Tipo de Combustible');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_tipo_combustible_${fechaInicio}_${fechaFinal}.xlsx`);
  };

  const reportRoutes = [
    { name: 'Reporte general', href: '/reportes' },
    { name: 'Reporte por canal', href: '/reporte_canal' },
    { name: 'Reporte 3', href: '#' },
    { name: 'Reporte 4', href: '#' },
    { name: 'Reporte 5', href: '#' },
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

            <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div>
  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
    Fecha de Inicio
  </label>
  <input
    type="datetime-local"
    id="fechaInicio"
    value={fechaInicio ? `${fechaInicio.slice(0, 14)}00` : ''}
    onChange={(e) => {
      const value = e.target.value;
      if (value) {
        // Extract date and hour, set minutes to 00
        const [date, time] = value.split('T');
        const hour = time.split(':')[0];
        setFechaInicio(`${date}T${hour}:00`);
      } else {
        setFechaInicio('');
      }
    }}
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
              <div className="mt-6 space-y-8">
                {/* Grouped by Canal Table */}
                <div className="bg-gray-100 rounded-lg shadow-md overflow-x-auto">
                  <div className="flex justify-between items-center mb-4 px-4 pt-4">
                    <h2 className="text-lg font-semibold text-gray-900">Resumen por Canal</h2>
                    <div>
                      <button
                        onClick={exportCanalToPDF}
                        className="mr-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                      >
                        Descargar PDF
                      </button>
                      <button
                        onClick={exportCanalToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                      >
                        Descargar Excel
                      </button>
                    </div>
                  </div>
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Descuento</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cantidad Transacciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {canalData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-4 py-2">{item.key}</td>
                          <td className="px-4 py-2">{item.totalMonto.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.totalDescuento.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.totalUnidades.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.transactionCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grouped by Tipo Combustible Table */}
                <div className="bg-gray-100 rounded-lg shadow-md overflow-x-auto">
                  <div className="flex justify-between items-center mb-4 px-4 pt-4">
                    <h2 className="text-lg font-semibold text-gray-900">Resumen por Tipo de Combustible</h2>
                    <div>
                      <button
                        onClick={exportTipoCombustibleToPDF}
                        className="mr-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                      >
                        Descargar PDF
                      </button>
                      <button
                        onClick={exportTipoCombustibleToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                      >
                        Descargar Excel
                      </button>
                    </div>
                  </div>
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo Combustible</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Monto</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Descuento</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Total Unidades</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cantidad Transacciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tipoCombustibleData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-4 py-2">{item.key}</td>
                          <td className="px-4 py-2">{item.totalMonto.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.totalDescuento.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.totalUnidades.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.transactionCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}