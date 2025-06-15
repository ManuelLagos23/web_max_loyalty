import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const canal_id = searchParams.get('canal_id');
  const subcanal_id = searchParams.get('subcanal_id');

  if (!canal_id) {
    return NextResponse.json(
      { message: 'canal_id es obligatorio' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    let query = `
      SELECT 
        t.id, 
        t.numero_tarjeta, 
        t.vehiculo_id, 
        t.canal_id, 
        t.subcanal_id
      FROM tarjetas t
      LEFT JOIN monedero_flota mf ON t.vehiculo_id = mf.vehiculo_id
      WHERE t.active = true
        AND t.canal_id = $1
        AND t.vehiculo_id IS NOT NULL
        AND mf.vehiculo_id IS NULL
    `;
    const params = [canal_id];

    if (subcanal_id) {
      query += ` AND t.subcanal_id = $2`;
      params.push(subcanal_id);
    }

    query += ` ORDER BY t.id`;

    const result = await client.query(query, params);

    const vehiculoIds = [...new Set(result.rows.map((row) => row.vehiculo_id))];

    const tarjetas = result.rows.map((row) => ({
      id: row.id,
      numero_tarjeta: row.numero_tarjeta,
      vehiculo_id: row.vehiculo_id,
      canal_id: row.canal_id,
      subcanal_id: row.subcanal_id,
    }));

    console.log(
      `Vehículo IDs filtrados (no en monedero_flota) para canal_id=${canal_id}${subcanal_id ? `, subcanal_id=${subcanal_id}` : ''}:`,
      vehiculoIds
    );

    client.release();
    return NextResponse.json(
      {
        vehiculo_ids: vehiculoIds,
        tarjetas: tarjetas,
      },
      { status: 200 }
    );
  } catch (error) {
    client.release();
    console.error('Error al obtener los vehículo IDs y tarjetas:', error);
    return NextResponse.json(
      { message: 'Error al obtener los vehículo IDs y tarjetas' },
      { status: 500 }
    );
  }
}
