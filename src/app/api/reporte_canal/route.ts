import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    // Parse JSON body
    const { fechaInicio, fechaFinal, canalId } = await request.json();

    // Basic validation
    if (!fechaInicio || !fechaFinal || !canalId || isNaN(Number(canalId))) {
      return NextResponse.json(
        { message: 'Faltan parámetros o son inválidos' },
        { status: 400 }
      );
    }

    const canal_id = Number(canalId);
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!dateTimeRegex.test(fechaInicio) || !dateTimeRegex.test(fechaFinal)) {
      return NextResponse.json(
        { message: 'Formato de fecha y hora inválido (use YYYY-MM-DDThh:mm)' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Verify channel exists
    const canalResult = await client.query(
      `SELECT id FROM canales WHERE id = $1`,
      [canal_id]
    );

    if (canalResult.rowCount === 0) {
      client.release();
      return NextResponse.json(
        { message: 'Canal no encontrado' },
        { status: 404 }
      );
    }

    // Query transactions with joins, using timestamp comparison
    const result = await client.query(
      `SELECT 
         c.canal,
         t.monto,
         t.descuento,
         tc.name AS tipo_combustible,
         t.unidades,
         cl.nombre AS cliente,
         t.fecha
       FROM transacciones t
       LEFT JOIN canales c ON t.canal_id = c.id
       INNER JOIN tipo_combustible tc ON t.tipo_combustible_id = tc.id
       INNER JOIN clientes cl ON t.cliente_id = cl.id
       WHERE t.canal_id = $1
       AND t.fecha >= $2::timestamp
       AND t.fecha <= $3::timestamp
       ORDER BY t.fecha`,
      [canal_id, fechaInicio, fechaFinal]
    );

    // Format response
    const transacciones = result.rows.map((row) => ({
      canal: row.canal || null,
      monto: Number(row.monto),
      descuento: Number(row.descuento),
      tipo_combustible: row.tipo_combustible,
      unidades: row.unidades ? Number(row.unidades) : null,
      cliente: row.cliente,
      fecha: new Date(row.fecha).toISOString(),
    }));

    client.release();

    return NextResponse.json(transacciones);
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error('Error en la consulta:', {
      message: err.message,
      code: err.code,
      requestBody: await request.json().catch(() => 'Invalid JSON'),
    });

    return NextResponse.json(
      { message: 'Error en la consulta', error: err.message },
      { status: 500 }
    );
  }
}