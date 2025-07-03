
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');

  if (!usuarioId) {
    return NextResponse.json({ message: 'Usuario ID requerido' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, usuario_id, ruta, permitido FROM permisos WHERE usuario_id = $1',
      [usuarioId]
    );
    client.release();
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los permisos:', error);
    return NextResponse.json({ message: 'Error al obtener los permisos' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const permisos = await request.json();

    if (!Array.isArray(permisos) || permisos.length === 0) {
      return NextResponse.json({ message: 'Se requiere una lista de permisos' }, { status: 400 });
    }

    const client = await pool.connect();
    const updatedPermisos = [];

    for (const permiso of permisos) {
      const { id, usuario_id, ruta, permitido } = permiso;

      if (!usuario_id || !ruta) {
        continue; // Saltar permisos inválidos
      }

      let result;
      if (id && id !== 0) {
        // Actualizar permiso existente
        result = await client.query(
          `
          UPDATE permisos 
          SET permitido = $1
          WHERE id = $2
          RETURNING id, usuario_id, ruta, permitido
          `,
          [permitido, id]
        );
      } else {
        // Crear nuevo permiso
        result = await client.query(
          `
          INSERT INTO permisos (usuario_id, ruta, permitido)
          VALUES ($1, $2, $3)
          ON CONFLICT (usuario_id, ruta)
          DO UPDATE SET permitido = $3
          RETURNING id, usuario_id, ruta, permitido
          `,
          [usuario_id, ruta, permitido]
        );
      }

      // Manejar el caso en que rowCount sea null o 0
      if (result.rowCount && result.rowCount > 0) {
        updatedPermisos.push(result.rows[0]);
      }
    }

    client.release();

    if (updatedPermisos.length === 0) {
      return NextResponse.json({ message: 'No se actualizaron permisos' }, { status: 404 });
    }

    return NextResponse.json(updatedPermisos, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar los permisos:', error);
    return NextResponse.json({ message: 'Error al actualizar los permisos' }, { status: 500 });
  }
}
