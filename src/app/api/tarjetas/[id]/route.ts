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
      return NextResponse.json({ message: 'ID de la tarjeta es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query('DELETE FROM tarjetas WHERE id = $1 RETURNING id', [id]);

    client.release();

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tarjeta eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la tarjeta:', error);
    return NextResponse.json({ message: 'Error al eliminar la tarjeta' }, { status: 500 });
  }
}