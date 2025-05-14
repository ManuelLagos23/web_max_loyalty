import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID del cliente es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        c.id, 
        c.nombre, 
        c.pais AS pais_id, 
        c.estado AS estado_id, 
        c.canal_id, 
        c.subcanal_id, 
        c.ciudad, 
        c.email, 
        c.telefono, 
        c.nfi, 
        encode(c.logo, 'base64') as logo,
        p.pais, 
        e.estado, 
        can.canal AS canal_nombre, 
        sub.subcanal AS subcanal_nombre
      FROM clientes c
      LEFT JOIN paises p ON c.pais = p.id
      LEFT JOIN estados e ON c.estado = e.id
      LEFT JOIN canales can ON c.canal_id = can.id
      LEFT JOIN subcanales sub ON c.subcanal_id = sub.id
      WHERE c.id = $1
      `,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    return NextResponse.json({ message: 'Error al obtener el cliente' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID del cliente es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM clientes WHERE id = $1 RETURNING *`,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cliente eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    return NextResponse.json({ message: 'Error al eliminar el cliente' }, { status: 500 });
  }
}