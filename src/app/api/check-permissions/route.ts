
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  let requestedPath = searchParams.get('path');

  if (!userId || !requestedPath) {
    return NextResponse.json({ message: 'Faltan userId o path' }, { status: 400 });
  }

  if (requestedPath.startsWith('/vehiculos/editar/')) {
    requestedPath = '/vehiculos/editar';
  }



  if (requestedPath.startsWith('/vehiculos/ver/')) {
    requestedPath = '/vehiculos/ver';
  }



    if (requestedPath.startsWith('/clientes/editar/')) {
    requestedPath = '/clientes/editar';
  }



    if (requestedPath.startsWith('/clientes/ver/')) {
    requestedPath = '/clientes/ver';
  }


    if (requestedPath.startsWith('/transacciones/ver/')) {
    requestedPath = '/transacciones/ver';
  }

    if (requestedPath.startsWith('/transacciones_flota/ver/')) {
    requestedPath = '/transacciones_flota/ver';
  }




  try {
    const client = await pool.connect();
    try {
      const userResult = await client.query(
        'SELECT admin FROM usuarios WHERE id = $1',
        [userId]
      );

      if (!userResult.rowCount) {
        return NextResponse.json({ allowed: false, message: 'Usuario no encontrado' }, { status: 404 });
      }

      if (userResult.rows[0].admin) {
        return NextResponse.json({ allowed: true });
      }

      const permisoResult = await client.query(
        'SELECT permitido FROM permisos WHERE usuario_id = $1 AND ruta = $2 AND permitido = TRUE',
        [userId, requestedPath]
      );

      if (!permisoResult.rowCount || permisoResult.rowCount === 0) {
        console.log(`[Check Permissions] Permiso denegado para usuario ID: ${userId}, ruta: ${requestedPath}`);
        return NextResponse.json({ allowed: false, message: 'Permiso denegado' }, { status: 403 });
      }

      console.log(`[Check Permissions] Permiso concedido para usuario ID: ${userId}, ruta: ${requestedPath}`);
      return NextResponse.json({ allowed: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Check Permissions] Error:', error);
    return NextResponse.json({ allowed: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
