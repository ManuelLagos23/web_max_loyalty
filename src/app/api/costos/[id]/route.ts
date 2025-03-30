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
      return NextResponse.json({ message: 'El ID del centro de costos es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM costos WHERE id = $1 RETURNING *`,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Centro de costos no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Centro de costos eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el centro de costos:', error);
    return NextResponse.json({ message: 'Error al eliminar el centro de costos' }, { status: 500 });
  }
}
