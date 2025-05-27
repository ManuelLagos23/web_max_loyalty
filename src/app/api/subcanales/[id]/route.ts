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
    const result = await client.query(
      `DELETE FROM subcanales 
       WHERE id = $1 
       RETURNING id, subcanal, subcanal_codigo, canal_id, 
       (SELECT canal FROM canales WHERE id = subcanales.canal_id) AS canal_nombre`,
      [Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el subcanal con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Subcanal eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error('Error al eliminar el subcanal:', error);
    return NextResponse.json({ message: 'Error al eliminar el subcanal' }, { status: 500 });
  }
}