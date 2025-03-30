import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(request: NextRequest) {
  try {
    // Extraer el ID de la URL
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop(); // Obtener el id desde la URL

    if (!id) {
      return NextResponse.json({ message: 'El ID del país es obligatorio' }, { status: 400 });
    }

    // Conectar a la base de datos
    const client = await pool.connect();
    
    // Ejecutar la consulta DELETE
    const result = await client.query(
      `DELETE FROM paises WHERE id = $1 RETURNING *`,
      [id]
    );

    // Liberar la conexión
    client.release();

    // Si no se encontró el país, devolver un error 404
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'País no encontrado' }, { status: 404 });
    }

    // Si la eliminación fue exitosa
    return NextResponse.json({ message: 'País eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el país:', error);
    return NextResponse.json({ message: 'Error al eliminar el país' }, { status: 500 });
  }
}
