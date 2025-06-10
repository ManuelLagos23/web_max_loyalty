import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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