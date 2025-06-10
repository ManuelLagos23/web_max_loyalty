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
      SELECT 
        t.id, 
        t.numero_tarjeta, 
        t.cliente_id, 
        COALESCE(c.nombre, '') AS cliente_nombre, 
        t.vehiculo_id, 
        COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') AS vehiculo_nombre, 
        t.tipo_tarjeta_id, 
        COALESCE(tt.tipo_tarjeta, '') AS tipo_tarjeta_nombre, 
        t.created_at, 
        t.canal_id, 
        COALESCE(can.canal, '') AS codigo_canal, 
        t.subcanal_id, 
        COALESCE(s.subcanal, '') AS subcanal_nombre,
        t.active
      FROM tarjetas t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN vehiculos v ON t.vehiculo_id = v.id
      LEFT JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      LEFT JOIN canales can ON t.canal_id = can.id
      LEFT JOIN subcanales s ON t.subcanal_id = s.id
      WHERE t.active = false
        AND (t.numero_tarjeta ILIKE $1 
             OR COALESCE(c.nombre, '') ILIKE $1 
             OR COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') ILIKE $1 
             OR COALESCE(tt.tipo_tarjeta, '') ILIKE $1)
      ORDER BY t.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM tarjetas t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN vehiculos v ON t.vehiculo_id = v.id
      LEFT JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      WHERE t.active = false
        AND (t.numero_tarjeta ILIKE $1 
             OR COALESCE(c.nombre, '') ILIKE $1 
             OR COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') ILIKE $1 
             OR COALESCE(tt.tipo_tarjeta, '') ILIKE $1)
      `,
      [`%${search}%`]
    );

    const total = parseInt(totalResult.rows[0].total, 10);

    client.release();
    return NextResponse.json(
      {
        tarjetas: result.rows,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    client.release();
    console.error('Error al obtener las tarjetas desactivadas:', error);
    return NextResponse.json({ message: 'Error al obtener las tarjetas desactivadas' }, { status: 500 });
  }
}