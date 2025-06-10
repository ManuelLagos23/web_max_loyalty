import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';

  const client = await pool.connect();

  try {
    const offset = (page - 1) * limit;
    const result = await client.query(
      `
      SELECT v.id, v.marca, v.modelo, v.placa
      FROM vehiculos v
      LEFT JOIN tarjetas t ON v.id = t.vehiculo_id
      WHERE t.vehiculo_id IS NULL
        AND (v.marca ILIKE $1 OR v.modelo ILIKE $1 OR v.placa ILIKE $1)
      ORDER BY v.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM vehiculos v
      LEFT JOIN tarjetas t ON v.id = t.vehiculo_id
      WHERE t.vehiculo_id IS NULL
        AND (v.marca ILIKE $1 OR v.modelo ILIKE $1 OR v.placa ILIKE $1)
      `,
      [`%${search}%`]
    );

    const total = parseInt(totalResult.rows[0].total, 10);

    client.release();
    return NextResponse.json(
      {
        vehiculos: result.rows,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    client.release();
    console.error('Error al obtener los vehículos:', error);
    return NextResponse.json({ message: 'Error al obtener los vehículos' }, { status: 500 });
  }
}