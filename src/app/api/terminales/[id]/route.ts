import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();  // Obtener el id desde la URL

    if (!id) {
      return NextResponse.json({ message: 'El ID de la terminal es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();

    // Realizar la eliminación de la terminal usando el ID
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
