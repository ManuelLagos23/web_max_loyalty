import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID de la terminal es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM terminales WHERE id = $1 RETURNING *`,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Terminal no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Terminal eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la terminal:', error);
    return NextResponse.json({ message: 'Error al eliminar la terminal' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'El ID de la terminal es obligatorio' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, empresa, estacion_servicio, codigo_terminal, nombre_terminal, numero_serie, mac, modelo, marca, codigo_activacion, id_activacion FROM terminales WHERE id = $1`,
      [id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No se encontró la terminal con ese ID' }, { status: 404 });
    }

    const terminal = {
      id: result.rows[0].id,
      empresa: result.rows[0].empresa,
      estacion_servicio: result.rows[0].estacion_servicio,
      codigo_terminal: result.rows[0].codigo_terminal,
      nombre_terminal: result.rows[0].nombre_terminal,
      numero_serie: result.rows[0].numero_serie,
      mac: result.rows[0].mac,
      modelo: result.rows[0].modelo,
      marca: result.rows[0].marca,
      codigo_activacion: result.rows[0].codigo_activacion,
      id_activacion: result.rows[0].id_activacion,
    };

    return NextResponse.json(terminal);
  } catch (error) {
    console.error('Error al obtener la terminal:', error);
    return NextResponse.json({ message: 'Error al obtener la terminal' }, { status: 500 });
  }
}