

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
      return NextResponse.json({ message: 'ID de la tipo de tarjeta es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM tipo_combustible WHERE id = $1 RETURNING id, name, code`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el tipo de combustible con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Tipo de combustible eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar el tipo de combustible:', error);
    return NextResponse.json({ message: 'Error al eliminar el tipo de combustible' }, { status: 500 });
  }
}