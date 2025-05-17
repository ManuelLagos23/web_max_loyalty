'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Canal {
  id: number;
  canal: string;
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

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFinal, setFechaFinal] = useState<string>('');
  const [canalId, setCanalId] = useState<string>('');
  const [canales, setCanales] = useState<Canal[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCanales = async () => {
      try {
        const response = await fetch('/api/canales', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCanales(data);
          } else {
            console.error('Expected an array for canales, received:', data);
            setError('Datos de canales no válidos.');
          }
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

  const isButtonDisabled = !fechaInicio || !fechaFinal || !canalId;

  const handleObtenerReporte = async () => {
    setError('');
    setTransacciones([]);
    setCurrentPage(1);
    setLoading(true);

    try {
      const response = await fetch('/api/reporte_canal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio,
          fechaFinal,
          canalId: parseInt(canalId),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTransacciones(data);
          if (data.length === 0) {
            setError('No se encontraron transacciones para los criterios seleccionados.');
          }
        } else {
          console.error('Expected an array for transacciones, received:', data);
          setError('Datos de transacciones no válidos.');
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

  // Pagination logic
  const totalPages = Math.ceil(transacciones.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transacciones.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();
    const canal = canales.find((c) => c.id === parseInt(canalId));
    const canalNombre = canal?.canal || 'Desconocido';

    doc.setFontSize(16);
    doc.text('Reporte de Transacciones por Canal', 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}`, 14, 30);
    doc.text(`Fecha Final: ${fechaFinal || 'N/A'}`, 14, 40);
    doc.text(`Canal: ${canalNombre}`, 14, 50);

    autoTable(doc, {
      startY: 60,
      head: [['Canal', 'Monto', 'Descuento', 'Tipo Combustible', 'Unidades', 'Cliente', 'Fecha']],
      body: transacciones.map((t) => [
        t.canal ?? 'N/A',
        t.monto.toFixed(2),
        t.descuento.toFixed(2),
        t.tipo_combustible,
        t.unidades?.toFixed(2) ?? 'N/A',
        t.cliente,
        new Date(t.fecha).toLocaleDateString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 153, 225] },
    });
    doc.save(`reporte_transacciones_canal_${fechaInicio}_${fechaFinal}.pdf`);
  };

  // Excel Export
  const exportToExcel = () => {
    const canal = canales.find((c) => c.id === parseInt(canalId));
    const canalNombre = canal?.canal || 'Desconocido';

    // Debug log to verify transaction count
    console.log('Exporting transactions:', transacciones);

    // Create header rows
    const headerData = [
      { Canal: `Fecha Inicio: ${fechaInicio || 'N/A'}`, Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { Canal: `Fecha Final: ${fechaFinal || 'N/A'}`, Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { Canal: `Canal: ${canalNombre}`, Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' },
      { Canal: '', Monto: '', Descuento: '', 'Tipo Combustible': '', Unidades: '', Cliente: '', Fecha: '' }, // Empty row
      { Canal: 'Canal', Monto: 'Monto', Descuento: 'Descuento', 'Tipo Combustible': 'Tipo Combustible', Unidades: 'Unidades', Cliente: 'Cliente', Fecha: 'Fecha' }, // Column headers
    ];

    // Create transaction rows
    const transactionData = transacciones.map((t) => ({
      Canal: t.canal ?? 'N/A',
      Monto: t.monto.toFixed(2),
      Descuento: t.descuento.toFixed(2),
      'Tipo Combustible': t.tipo_combustible,
      Unidades: t.unidades?.toFixed(2) ?? 'N/A',
      Cliente: t.cliente,
      Fecha: new Date(t.fecha).toLocaleDateString(),
    }));

    // Combine header and transaction data
    const worksheetData = [...headerData, ...transactionData];

    // Create worksheet without header option to avoid extra columns
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
    ];

    // Set merges for header rows (first three rows only)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    ];

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');

    // Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_transacciones_canal_${fechaInicio}_${fechaFinal}.xlsx`);
  };

  // Define report routes
  const reportRoutes = [
    { name: 'Reporte general', href: '/reportes' },
    { name: 'Reporte por canal', href: '/reporte_canal' }, // Fixed route
    { name: 'Reporte 3', href: '/reportes/reporte3' },
    { name: 'Reporte 4', href: '/reportes/reporte4' },
    { name: 'Reporte 5', href: '/reportes/reporte5' },
  ];

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
                Reporte por canal
              </h1>
              <nav className="flex justify-center space-x-4">
                {reportRoutes.map((reporte) => (
                  <Link key={reporte.name} href={reporte.href}>
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
                    >
                      {reporte.name}
                    </button>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    max="2025-05-15"
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="fechaFinal" className="block text-sm font-medium text-gray-700">
                    Fecha Final
                  </label>
                  <input
                    type="date"
                    id="fechaFinal"
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    max="2025-05-15"
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
                <div className="flex justify-end mb-4 px-4 pt-4">
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
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Monto</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Descuento</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tipo Combustible</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Unidades</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Cliente</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((transaccion, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-4 py-2">{transaccion.canal ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.monto.toFixed(2)}</td>
                        <td className="px-4 py-2">{transaccion.descuento.toFixed(2)}</td>
                        <td className="px-4 py-2">{transaccion.tipo_combustible}</td>
                        <td className="px-4 py-2">{transaccion.unidades?.toFixed(2) ?? 'N/A'}</td>
                        <td className="px-4 py-2">{transaccion.cliente}</td>
                        <td className="px-4 py-2">{new Date(transaccion.fecha).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center px-4 py-4">
                  <p className="text-gray-700">
                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, transacciones.length)} de{' '}
                    {transacciones.length} transacciones
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}