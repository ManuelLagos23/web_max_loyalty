import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'El ID del miembro es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Verificar si el miembro tiene tarjetas asociadas
      const checkTarjetas = await client.query(
        `SELECT id FROM tarjetas WHERE id = $1 LIMIT 1`,
        [id]
      );

      if (checkTarjetas.rowCount && checkTarjetas.rowCount > 0) {
        client.release();
        return NextResponse.json(
          { message: 'No se puede eliminar el miembro porque tiene tarjetas asociadas' },
          { status: 400 }
        );
      }

      // Eliminar el miembro
      const result = await client.query(
        `DELETE FROM miembros WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rowCount === 0) {
        client.release();
        return NextResponse.json({ message: 'Miembro no encontrado' }, { status: 404 });
      }

      client.release();
      return NextResponse.json({ message: 'Miembro eliminado con éxito' }, { status: 200 });
    } catch (error) {
      client.release();
      console.error('Error al procesar la eliminación:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error al eliminar el miembro:', error);
    return NextResponse.json({ message: 'Error al eliminar el miembro' }, { status: 500 });
  }
}