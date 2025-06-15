import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT t.id, t.numero_tarjeta, t.cliente_id, t.vehiculo_id, t.tipo_tarjeta_id, t.created_at, 
             t.canal_id, COALESCE(can.canal, '') AS canal,
             t.subcanal_id, COALESCE(s.subcanal, '') AS subcanal_nombre,
             COALESCE(c.nombre, '') AS cliente_nombre, 
             COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') AS vehiculo_nombre,
             COALESCE(tt.tipo_tarjeta, '') AS tipo_tarjeta_nombre,
             COALESCE(
               CASE 
                 WHEN t.cliente_id IS NOT NULL THEN (
                   SELECT can2.codigo_canal 
                   FROM canales can2 
                   WHERE can2.id = c.canal_id
                 )
                 WHEN t.vehiculo_id IS NOT NULL THEN (
                   SELECT can3.codigo_canal 
                   FROM canales can3 
                   WHERE can3.id = t.canal_id
                 )
                 ELSE ''
               END, ''
             ) AS codigo_canal
      FROM tarjetas t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN vehiculos v ON t.vehiculo_id = v.id
      LEFT JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      LEFT JOIN canales can ON t.canal_id = can.id
      LEFT JOIN subcanales s ON t.subcanal_id = s.id
      WHERE t.id = $1
      `,
      [parseInt(id)]
    );

    if (!result.rowCount) {
      return NextResponse.json({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.warn('Error al cargar la tarjeta:', error);
    return NextResponse.json(
      { message: 'Error al cargar la tarjeta' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}


export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  let active: boolean;

  try {
    const body = await request.json();
    active = body.active;
  } catch (_error) {
    console.warn('Error al parsear el cuerpo de la solicitud:', _error);
    return NextResponse.json(
      { message: 'Cuerpo de la solicitud inválido' },
      { status: 400 }
    );
  }

  if (typeof active !== 'boolean') {
    return NextResponse.json(
      { message: 'El campo active debe ser un valor booleano' },
      { status: 400 }
    );
  }

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      'UPDATE tarjetas SET active = $1 WHERE id = $2 RETURNING id',
      [active, parseInt(id)]
    );

    if (!result.rowCount) {
      return NextResponse.json({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Tarjeta actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.warn('Error al actualizar la tarjeta:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la tarjeta' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}