import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configure PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Define request body interface
interface ReportRequest {
  fechaInicio: string;
  fechaFinal: string;
  canalId: number;
  subcanalId: number;
}

// Define transaction report interface
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
  created_at: string | null; // Última fecha de transacción
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: ReportRequest = await req.json();
    const { fechaInicio, fechaFinal, canalId, subcanalId } = body;

    // Validate input
    if (!fechaInicio || !fechaFinal || !canalId || !subcanalId) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos: fechaInicio, fechaFinal, canalId o subcanalId' },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFinal);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: 'Formato de fecha inválido para fechaInicio o fechaFinal' },
        { status: 400 }
      );
    }

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      return NextResponse.json(
        { message: 'fechaInicio no puede ser posterior a fechaFinal' },
        { status: 400 }
      );
    }

    // Query database for aggregated data
    const query = `
      SELECT 
        tf.vehiculo_id,
        v.placa,
        v.marca,
        v.modelo,
        c.id AS canal_id,
        c.canal,
        sc.id AS subcanal_id,
        sc.subcanal,
        MIN(tf.odometro) AS odometro_inicial,
        MAX(tf.odometro) AS odometro_final,
        SUM(tf.unidades) AS unidades_totales,
        SUM(tf.monto) AS monto_total,
        CASE 
          WHEN SUM(tf.unidades) > 0 
          THEN (MAX(tf.odometro) - MIN(tf.odometro))::FLOAT / NULLIF(SUM(tf.unidades), 0)
          ELSE NULL 
        END AS rendimiento,
        MAX(tf.created_at) AS created_at
      FROM transacciones_flota tf
      INNER JOIN vehiculos v ON tf.vehiculo_id = v.id
      INNER JOIN monedero_flota mf ON v.id = mf.vehiculo_id
      INNER JOIN tarjetas t ON mf.tarjeta_id = t.id
      INNER JOIN canales c ON t.canal_id = c.id
      INNER JOIN subcanales sc ON t.subcanal_id = sc.id
      WHERE tf.created_at BETWEEN $1 AND $2
        AND t.canal_id = $3
        AND t.subcanal_id = $4
        AND tf.odometro IS NOT NULL
        AND tf.unidades IS NOT NULL
      GROUP BY tf.vehiculo_id, v.placa, v.marca, v.modelo, c.id, c.canal, sc.id, sc.subcanal
      ORDER BY v.placa;
    `;

    const client = await pool.connect();
    try {
      // Set timezone for the connection
      await client.query("SET TIME ZONE 'America/Tegucigalpa'");
      const result = await client.query(query, [fechaInicio, fechaFinal, canalId, subcanalId]);

      // Map results to TransaccionReporte
      const transactions: TransaccionReporte[] = result.rows.map((row) => ({
        vehiculo_id: row.vehiculo_id,
        placa: row.placa || null,
        marca: row.marca || null,
        modelo: row.modelo || null,
        canal_id: row.canal_id,
        canal: row.canal || null,
        subcanal_id: row.subcanal_id,
        subcanal: row.subcanal || null,
        odometro_inicial: row.odometro_inicial != null ? parseFloat(row.odometro_inicial) : null,
        odometro_final: row.odometro_final != null ? parseFloat(row.odometro_final) : null,
        unidades_totales: row.unidades_totales != null ? parseFloat(row.unidades_totales) : null,
        monto_total: row.monto_total != null ? parseFloat(row.monto_total) : null,
        rendimiento: row.rendimiento != null ? parseFloat(row.rendimiento) : null,
        created_at: row.created_at ? row.created_at.toISOString() : null,
      }));

      // Log for debugging
      console.log('Transacciones mapeadas:', transactions);

      return NextResponse.json(transactions, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener el reporte de rendimiento:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: (error as Error).message },
      { status: 500 }
    );
  }
}