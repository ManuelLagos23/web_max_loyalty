import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET handler to retrieve a specific tipo_tarjeta by ID
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'ID de tipo de tarjeta inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, tipo_tarjeta, codigo_tipo_tarjeta, descripcion, flota 
       FROM tipos_tarjetas 
       WHERE id = $1`,
      [Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: 'No se encontró el tipo de tarjeta con el ID proporcionado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error('Error al obtener el tipo de tarjeta:', error);
    return NextResponse.json({ message: 'Error al obtener el tipo de tarjeta' }, { status: 500 });
  }
}

// DELETE handler (unchanged)
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'ID de la tipo de tarjeta es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM tipos_tarjetas           
       WHERE id = $1 
    `,
      [Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el tipo de tarjeta con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Tipo de tarjeta eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error('Error al eliminar el tipo de tarjeta:', error);
    return NextResponse.json({ message: 'Error al eliminar el tipo de tarjeta' }, { status: 500 });
  }
}