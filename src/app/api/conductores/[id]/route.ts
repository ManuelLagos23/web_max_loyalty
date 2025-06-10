import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `SELECT c.id, c.nombre, c.numero_licencia, c.telefono, c.correo, c.vehiculo_id, c.tipo_licencia, c.fecha_emision, c.fecha_expiracion, c.tipo_sangre, v.marca as vehiculo_marca, v.modelo as vehiculo_modelo, v.placa as vehiculo_placa
       FROM conductores c
       LEFT JOIN vehiculos v ON c.vehiculo_id = v.id
       WHERE c.id = $1`,
      [id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No se encontró el conductor con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener el conductor:', error);
    return NextResponse.json({ message: 'Error al obtener el conductor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query('DELETE FROM conductores WHERE id = $1 RETURNING *', [id]);
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el conductor con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Conductor eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el conductor:', error);
    return NextResponse.json({ message: 'Error al eliminar el conductor' }, { status: 500 });
  }
}