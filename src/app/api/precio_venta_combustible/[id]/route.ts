

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
      return NextResponse.json({ message: 'ID del precio es obligatorio' }, { status: 400 });
    }


    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM precio_venta_combustible 
       WHERE id = $1 
       RETURNING id, monedas_id, fecha_final, fecha_inicio, notas, precio_sucursal_ids, semana_year, precio, tipo_combustible_id`,
      [Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el precio de venta con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Precio de venta eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar el precio de venta:', error);
    return NextResponse.json({ message: 'Error al eliminar el precio de venta' }, { status: 500 });
  }
}