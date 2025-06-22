import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configure PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set in .env
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Define request body interface
interface ReportRequest {
  fechaInicio: string;
  fechaFinal: string;
  canalId: number;
  subcanalId: number;
}

// Define transaction interface matching frontend
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

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: ReportRequest = await req.json();
    const { fechaInicio, fechaFinal, canalId, subcanalId } = body;

    // Validate input
    if (!fechaInicio || !fechaFinal || !canalId || !subcanalId) {
      return NextResponse.json(
        { message: 'Missing required fields: fechaInicio, fechaFinal, canalId, or subcanalId' },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFinal);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format for fechaInicio or fechaFinal' },
        { status: 400 }
      );
    }

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      return NextResponse.json(
        { message: 'fechaInicio cannot be later than fechaFinal' },
        { status: 400 }
      );
    }

    // Query database for transactions
    const query = `
      SELECT 
        t.id,
        t.monto,
        t.unidades,
        t.odometro,
        t.tarjeta_id,
        t.monedero_id,
        t.canal_id,
        t.subcanal_id,
        t.created_at,
        c.canal AS canal,
        sc.subcanal AS subcanal
      FROM transacciones_flota t
      LEFT JOIN canales c ON t.canal_id = c.id
      LEFT JOIN subcanales sc ON t.subcanal_id = sc.id
      WHERE t.created_at BETWEEN $1 AND $2
      AND t.canal_id = $3
      AND t.subcanal_id = $4
      ORDER BY t.created_at DESC;
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(query, [fechaInicio, fechaFinal, canalId, subcanalId]);
      const transactions: Transaccion[] = result.rows.map((row) => ({
        id: row.id,
        monto: parseFloat(row.monto),
        unidades: parseFloat(row.unidades),
        odometro: row.odometro ? parseFloat(row.odometro) : null,
        tarjeta_id: row.tarjeta_id,
        monedero_id: row.monedero_id,
        canal_id: row.canal_id,
        subcanal_id: row.subcanal_id,
        created_at: row.created_at.toISOString(),
        canal: row.canal || null,
        subcanal: row.subcanal || null,
      }));

      return NextResponse.json(transactions, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching fleet transactions report:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}