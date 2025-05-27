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
          `DELETE FROM descuentos 
       WHERE id = $1 
       RETURNING id, active, create_date, create_uid, descuento, display_name, canal_id, tipo_combustible_id, write_date, write_uid`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el canal con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Canal eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar el canal:', error);
    return NextResponse.json({ message: 'Error al eliminar el canal' }, { status: 500 });
  }
}