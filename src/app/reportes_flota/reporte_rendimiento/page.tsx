'use client';

import React from 'react';
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
  subcanal: string;
}

interface TransaccionReporte {
  vehiculo_id: number;
  placa: string | null;
  marca: string | null;
  modelo: string | null;
  canal_id: number;
  canal: string | null;
  subcanal_id: number;
  subcanal: string | null;
  odometro_inicial: number | null;
  odometro_final: number | null;
  unidades_totales: number | null;
  monto_total: number | null;
  rendimiento: number | null;
  created_at: string | null;
}

export default function ReporteTransaccionesCanalSubcanal() {
  const [canalId, setCanalId] = useState<string>('');
  const [subcanalId, setSubcanalId] = useState<string>('');
  const [canales, setCanales] = useState<Canal[]>([]);
  const [subcanales, setSubcanales] = useState<Subcanal[]>([]);
  const [transacciones, setTransacciones] = useState<TransaccionReporte[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const LITROS_A_GALONES = 0.2641724; // Factor de conversión: 1 litro = 0.2641724 galones

  const redondearMinutosACero = (fecha = new Date()) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setMinutes(0, 0, 0);
    return nuevaFecha.toLocaleString('sv-SE', {
      timeZone: 'America/Tegucigalpa',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(' ', 'T');
  };

  const [fechaInicio, setFechaInicio] = useState<string>(redondearMinutosACero());
  const [fechaFinal, setFechaFinal] = useState<string>(redondearMinutosACero());

  // Fetch canales
  useEffect(() => {
    const fetchCanales = async () => {
      try {
        const response = await fetch('/api/canales', { method: 'GET' });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Error al obtener los canales.');
        }
        const data: Canal[] = await response.json();
        setCanales(data);
      } catch (err) {
        console.error('Error al obtener canales:', err);
        setError(err instanceof Error ? err.message : 'Error al conectar con el servidor.');
      }
    };
    fetchCanales();
  }, []);

  // Fetch subcanales when canalId changes
  useEffect(() => {
    if (!canalId) {
      setSubcanales([]);
      setSubcanalId('');
      setTransacciones([]);
      return;
    }
    const fetchSubcanales = async () => {
      try {
        const response = await fetch(`/api/subcanales?canal_id=${canalId}`, { method: 'GET' });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Error al obtener los subcanales.');
        }
        const data: Subcanal[] = await response.json();
        setSubcanales(data);
        setSubcanalId('');
        setTransacciones([]);
      } catch (err) {
        console.error('Error al obtener subcanales:', err);
        setError(err instanceof Error ? err.message : 'Error al conectar con el servidor.');
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
      const parsedCanalId = parseInt(canalId);
      const parsedSubcanalId = parseInt(subcanalId);
      if (isNaN(parsedCanalId) || isNaN(parsedSubcanalId)) {
        throw new Error('Canal o subcanal inválido.');
      }

      const response = await fetch('/api/reportes_flota/reporte_rendimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio: new Date(fechaInicio).toISOString(),
          fechaFinal: new Date(fechaFinal).toISOString(),
          canalId: parsedCanalId,
          subcanalId: parsedSubcanalId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Error al obtener el reporte.');
      }

      const data: TransaccionReporte[] = await response.json();
      console.log('API Response:', data);
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
    const doc = new jsPDF();
    const canal = canales.find((c) => c.id === parseInt(canalId));
    const subcanal = subcanales.find((sc) => sc.id === parseInt(subcanalId));
    const canalNombre = canal?.canal || 'Desconocido';
    const subcanalNombre = subcanal?.subcanal || 'Desconocido';
    const timestamp = new Date().toISOString().replace(/[:]/g, '-');

    doc.setFontSize(16);
    doc.text(`Reporte de Rendimiento por Canal y Subcanal - ${canalNombre} / ${subcanalNombre}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha Inicio: ${fechaInicio || 'N/A'}`, 14, 30);
    doc.text(`Fecha Final: ${fechaFinal || 'N/A'}`, 100, 30);

    doc.text('Resumen por Vehículo', 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [
        [
          '#',
          'Fecha Última Transacción',
          'Placa',
          'Marca',
          'Modelo',
          'Odómetro Inicial',
          'Odómetro Final',
          'Unidades Totales (L)',
          'Unidades Totales (gal)',
          'Monto Total',
          'Rendimiento (km/L)',
          'Canal',
          'Subcanal',
        ],
      ],
      body: transacciones.map((t, index) => [
        index + 1,
        t.created_at
          ? new Date(t.created_at).toLocaleString('es-HN', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'America/Tegucigalpa',
            })
          : 'N/A',
        t.placa ?? 'N/A',
        t.marca ?? 'N/A',
        t.modelo ?? 'N/A',
        t.odometro_inicial != null ? t.odometro_inicial.toFixed(2) : 'N/A',
        t.odometro_final != null ? t.odometro_final.toFixed(2) : 'N/A',
        t.unidades_totales != null ? t.unidades_totales.toFixed(2) : 'N/A',
        t.unidades_totales != null ? (t.unidades_totales * LITROS_A_GALONES).toFixed(2) : 'N/A',
        t.monto_total != null ? t.monto_total.toFixed(2) : 'N/A',
        t.rendimiento != null ? Math.abs(t.rendimiento).toFixed(2) : 'N/A',
        t.canal ?? 'N/A',
        t.subcanal ?? 'N/A',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 153, 190] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 12 },
        3: { cellWidth: 12 },
        4: { cellWidth: 12 },
        5: { cellWidth: 14 },
        6: { cellWidth: 14 },
        7: { cellWidth: 14 },
        8: { cellWidth: 14 },
        9: { cellWidth: 14 },
        10: { cellWidth: 14 },
        11: { cellWidth: 12 },
        12: { cellWidth: 12 },
      },
    });

    doc.save(`reporte_rendimiento_${canalNombre}_${subcanalNombre}_${timestamp}.pdf`);
  };

  // Excel Export
  const exportToExcel = () => {
    const canal = canales.find((c) => c.id === parseInt(canalId));
    const subcanal = subcanales.find((sc) => sc.id === parseInt(subcanalId));
    const canalNombre = canal?.canal || 'Desconocido';
    const subcanalNombre = subcanal?.subcanal || 'Desconocido';
    const timestamp = new Date().toISOString().replace(/[:]/g, '-');

    const headerData = [
      { '#': '', Fecha: `Canal: ${canalNombre}`, Placa: '', Marca: '', Modelo: '', OdometroInicial: '', OdometroFinal: '', UnidadesLitros: '', UnidadesGalones: '', Monto: '', Rendimiento: '', Canal: '', Subcanal: '' },
      { '#': '', Fecha: `Subcanal: ${subcanalNombre}`, Placa: '', Marca: '', Modelo: '', OdometroInicial: '', OdometroFinal: '', UnidadesLitros: '', UnidadesGalones: '', Monto: '', Rendimiento: '', Canal: '', Subcanal: '' },
      { '#': '', Fecha: `Fecha Inicio: ${fechaInicio || 'N/A'}`, Placa: '', Marca: '', Modelo: '', OdometroInicial: '', OdometroFinal: '', UnidadesLitros: '', UnidadesGalones: '', Monto: '', Rendimiento: '', Canal: '', Subcanal: '' },
      { '#': '', Fecha: `Fecha Final: ${fechaFinal || 'N/A'}`, Placa: '', Marca: '', Modelo: '', OdometroInicial: '', OdometroFinal: '', UnidadesLitros: '', UnidadesGalones: '', Monto: '', Rendimiento: '', Canal: '', Subcanal: '' },
      { '#': '', Fecha: '', Placa: '', Marca: '', Modelo: '', OdometroInicial: '', OdometroFinal: '', UnidadesLitros: '', UnidadesGalones: '', Monto: '', Rendimiento: '', Canal: '', Subcanal: '' },
    ];

    const transaccionesHeader = [
      { '#': '', Fecha: 'Resumen por Vehículo', Placa: '', Marca: '', Modelo: '', OdometroInicial: '', OdometroFinal: '', UnidadesLitros: '', UnidadesGalones: '', Monto: '', Rendimiento: '', Canal: '', Subcanal: '' },
      {
        '#': '#',
        Fecha: 'Fecha Última Transacción',
        Placa: 'Placa',
        Marca: 'Marca',
        Modelo: 'Modelo',
        OdometroInicial: 'Odómetro Inicial',
        OdometroFinal: 'Odómetro Final',
        UnidadesLitros: 'Unidades Totales (L)',
        UnidadesGalones: 'Unidades Totales (gal)',
        Monto: 'Monto Total',
        Rendimiento: 'Rendimiento (km/L)',
        Canal: 'Canal',
        Subcanal: 'Subcanal',
      },
    ];

    const transaccionesData = transacciones.map((t, index) => ({
      '#': index + 1,
      Fecha: t.created_at
        ? new Date(t.created_at).toLocaleString('es-HN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'America/Tegucigalpa',
          })
        : 'N/A',
      Placa: t.placa ?? 'N/A',
      Marca: t.marca ?? 'N/A',
      Modelo: t.modelo ?? 'N/A',
      OdometroInicial: t.odometro_inicial != null ? t.odometro_inicial.toFixed(2) : 'N/A',
      OdometroFinal: t.odometro_final != null ? t.odometro_final.toFixed(2) : 'N/A',
      UnidadesLitros: t.unidades_totales != null ? t.unidades_totales.toFixed(2) : 'N/A',
      UnidadesGalones: t.unidades_totales != null ? (t.unidades_totales * LITROS_A_GALONES).toFixed(2) : 'N/A',
      Monto: t.monto_total != null ? t.monto_total.toFixed(2) : 'N/A',
      Rendimiento: t.rendimiento != null ? Math.abs(t.rendimiento).toFixed(2) : 'N/A',
      Canal: t.canal ?? 'N/A',
      Subcanal: t.subcanal ?? 'N/A',
    }));

    const worksheetData = [...headerData, ...transaccionesHeader, ...transaccionesData];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
    ];

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 12 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 12 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 12 } },
    ];

  const headerCells = [
      `A${headerData.length + 2}`,
      `B${headerData.length + 2}`,
      `C${headerData.length + 2}`,
      `D${headerData.length + 2}`,
      `E${headerData.length + 2}`,
      `F${headerData.length + 2}`,
      `G${headerData.length + 2}`,
      `H${headerData.length + 2}`,
      `I${headerData.length + 2}`,
      `J${headerData.length + 2}`,
      `K${headerData.length + 2}`,
      `L${headerData.length + 2}`,
       `M${headerData.length + 2}`,
    ];


    headerCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D3D3D3' } } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen Vehículos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_rendimiento_${canalNombre}_${subcanalNombre}_${timestamp}.xlsx`);
  };

  const reportRoutes = [
    { name: 'Reporte por estación', href: '/reportes_flota/reporte_estacion' },
    { name: 'Reporte por canal y subcanal', href: '/reportes_flota/reporte_canal_subcanal' },
    { name: 'Reporte de rendimiento', href: '/reportes_flota/reporte_rendimiento' },
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
              <div className="mt-6 bg-gray-100 rounded-lg shadow-md overflow-x-auto max-w-8xl mx-auto">
                <div className="flex justify-between items-center mb-4 px-4 pt-4">
                  <h2 className="text-lg font-semibold text-gray-900">Reporte de Rendimiento por Canal y Subcanal</h2>
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
                <table className="w-full table-auto">
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan={13} className="px-4 py-2 text-left text-gray-900 font-semibold">
                        Resumen por Vehículo
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold" hidden>Vehículo ID</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha Última Transacción</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Placa</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Marca</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Modelo</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Odómetro Inicial</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Odómetro Final</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Unidades Totales (L)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Unidades Totales (gal)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Monto Total</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Rendimiento (km/L)</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Canal</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Subcanal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((t, index) => {
                      const unidades_galones = t.unidades_totales != null ? t.unidades_totales * LITROS_A_GALONES : null;
                      console.log(
                        `Vehículo ${t.vehiculo_id}: ` +
                        `odometro_inicial=${t.odometro_inicial}, odometro_final=${t.odometro_final}, ` +
                        `unidades_totales_litros=${t.unidades_totales}, unidades_totales_galones=${unidades_galones}, ` +
                        `monto_total=${t.monto_total}, rendimiento=${t.rendimiento}`
                      );
                      return (
                        <tr key={`vehiculo-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2" hidden>{t.vehiculo_id}</td>
                          <td className="px-4 py-2">
                            {t.created_at
                              ? new Date(t.created_at).toLocaleString('es-HN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                                timeZone: 'America/Tegucigalpa',
                              })
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-2">{t.placa ?? 'N/A'}</td>
                          <td className="px-4 py-2">{t.marca ?? 'N/A'}</td>
                          <td className="px-4 py-2">{t.modelo ?? 'N/A'}</td>
                          <td className="px-4 py-2">{t.odometro_inicial != null ? t.odometro_inicial.toFixed(2) : 'N/A'}</td>
                          <td className="px-4 py-2">{t.odometro_final != null ? t.odometro_final.toFixed(2) : 'N/A'}</td>
                          <td className="px-4 py-2">{t.unidades_totales != null ? t.unidades_totales.toFixed(2) : 'N/A'}</td>
                          <td className="px-4 py-2">{unidades_galones != null ? unidades_galones.toFixed(2) : 'N/A'}</td>
                          <td className="px-4 py-2">{t.monto_total != null ? t.monto_total.toFixed(2) : 'N/A'}</td>
                          <td className="px-4 py-2">{t.rendimiento != null ? Math.abs(t.rendimiento).toFixed(2) : 'N/A'}</td>
                          <td className="px-4 py-2">{t.canal ?? 'N/A'}</td>
                          <td className="px-4 py-2">{t.subcanal ?? 'N/A'}</td>
                        </tr>
                      );
                    })}
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