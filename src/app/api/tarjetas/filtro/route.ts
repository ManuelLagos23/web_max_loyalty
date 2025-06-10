import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const canal_id = searchParams.get('canal_id');
  const subcanal_id = searchParams.get('subcanal_id');

  // Validar que se proporcionen ambos parámetros
  if (!canal_id || !subcanal_id) {
    return NextResponse.json(
      { message: 'canal_id y subcanal_id son obligatorios' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    // Consulta para obtener los vehiculo_id y las tarjetas asociadas
    const result = await client.query(
      `
      SELECT t.id, t.numero_tarjeta, t.vehiculo_id, t.canal_id, t.subcanal_id
      FROM tarjetas t
      WHERE t.active = true
        AND t.canal_id = $1
        AND t.subcanal_id = $2
        AND t.vehiculo_id IS NOT NULL
      ORDER BY t.id
      `,
      [canal_id, subcanal_id]
    );

    // Extraer los vehiculo_id únicos
    const vehiculoIds = [...new Set(result.rows.map((row) => row.vehiculo_id))];
    // Mapear las tarjetas
    const tarjetas = result.rows.map((row) => ({
      id: row.id,
      numero_tarjeta: row.numero_tarjeta,
      vehiculo_id: row.vehiculo_id,
      canal_id: row.canal_id,
      subcanal_id: row.subcanal_id,
    }));

    console.log(`Vehículo IDs encontrados para canal_id=${canal_id}, subcanal_id=${subcanal_id}:`, vehiculoIds);
    console.log(`Tarjetas encontradas para canal_id=${canal_id}, subcanal_id=${subcanal_id}:`, tarjetas);

    client.release();
    return NextResponse.json(
      { 
        vehiculo_ids: vehiculoIds,
        tarjetas: tarjetas
      }, 
      { status: 200 }
    );
  } catch (error) {
    client.release();
    console.error('Error al obtener los vehículo IDs y tarjetas:', error);
    return NextResponse.json({ message: 'Error al obtener los vehículo IDs y tarjetas' }, { status: 500 });
  }
}