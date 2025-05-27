

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
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      'DELETE FROM turnos WHERE id = $1 RETURNING id',
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Turno no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Turno eliminado' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
  return NextResponse.json({ message: 'Error al crear el turno' }, { status: 500 });
  }
}