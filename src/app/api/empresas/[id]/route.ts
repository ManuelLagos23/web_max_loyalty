import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET: Fetch a single empresa by ID
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID de la empresa es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        e.id,
        e.nombre_empresa,
        e.nombre_impreso,
        p.pais AS pais,
        m.moneda AS moneda,
        e.correo,
        e.telefono,
        e.nfi,
        e.prefijo_tarjetas,
        encode(e.logo, 'base64') as logo,
        encode(e.logo_impreso, 'base64') as logo_impreso,
        e.pais as pais_id,
        e.moneda as moneda_id
      FROM empresas e
      JOIN paises p ON e.pais = p.id
      JOIN monedas m ON e.moneda = m.id
      WHERE e.id = $1
      `,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al obtener la empresa:', error);
    return NextResponse.json({ message: 'Error al obtener la empresa' }, { status: 500 });
  }
}

// DELETE: Delete an empresa by ID
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID de la empresa es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM empresas WHERE id = $1 RETURNING *`,
      [id]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Empresa eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la empresa:', error);
    return NextResponse.json({ message: 'Error al eliminar la empresa' }, { status: 500 });
  }
}