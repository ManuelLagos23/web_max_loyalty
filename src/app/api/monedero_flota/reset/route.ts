import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to validate session based on request cookies
async function validateSession(request: NextRequest) {
  try {
    const cookie = request.cookies.get('session');
    if (!cookie) {
      console.warn('No session cookie found');
      return null;
    }

    const session = JSON.parse(cookie.value);
    if (!session || !session.id) {
      console.warn('Invalid session data:', session);
      return null;
    }

    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, nombre FROM usuarios WHERE id = $1',
      [session.id]
    );
    const usuario = result.rows[0];
    client.release();

    if (!usuario) {
      console.warn('User not found for session ID:', session.id);
      return null;
    }

    return { id: usuario.id, nombre: usuario.nombre };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        mr.id,
        mr.monedero_id,
        mr.vehiculo_id,
        mr.canal_id,
        mr.subcanal_id,
        mr.usuario_id,
        mr.created_at,
        CONCAT(v.marca, ' ', v.modelo, ' - ', v.placa) AS vehiculo_nombre,
        c.canal AS canal_nombre,
        s.subcanal AS subcanal_nombre,
        u.nombre AS usuario_nombre
      FROM monedero_reset mr
      LEFT JOIN vehiculos v ON mr.vehiculo_id = v.id
      LEFT JOIN canales c ON mr.canal_id = c.id
      LEFT JOIN subcanales s ON mr.subcanal_id = s.id
      LEFT JOIN usuarios u ON mr.usuario_id = u.id
      ORDER BY mr.id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const totalResult = await client.query(
      'SELECT COUNT(*) AS total FROM monedero_reset'
    );
    const total = parseInt(totalResult.rows[0].total, 10);
    client.release();

    return NextResponse.json({
      data: result.rows,
      total,
    });
  } catch (error: unknown) {
    console.error('Error al obtener los registros de reseteo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { message: `Error al obtener los registros de reseteo: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validar la sesión del usuario
  const session = await validateSession(request);
  if (!session || !session.id) {
    return NextResponse.json(
      { message: 'Usuario no autenticado. Por favor, inicia sesión.' },
      { status: 401 }
    );
  }

  try {
    const { vehiculo_ids, created_at } = await request.json();

    // Validar que vehiculo_ids es un array y no está vacío
    if (!Array.isArray(vehiculo_ids) || vehiculo_ids.length === 0) {
      return NextResponse.json(
        { message: 'Se requiere un array de vehiculo_ids no vacío' },
        { status: 400 }
      );
    }

    // Validar que todos los IDs son números enteros
    if (!vehiculo_ids.every((id) => Number.isInteger(Number(id)))) {
      return NextResponse.json(
        { message: 'Todos los vehiculo_ids deben ser números enteros' },
        { status: 400 }
      );
    }

    // Validar que created_at es un timestamp válido
    if (!created_at || isNaN(Date.parse(created_at))) {
      return NextResponse.json(
        { message: 'Se requiere un created_at válido en formato ISO 8601' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Iniciar una transacción
      await client.query('BEGIN');

      // Actualizar monedero_flota y registrar en monedero_reset
      const updatedMonederos = [];
      for (const vehiculo_id of vehiculo_ids) {
        // Obtener el monedero correspondiente
        const monederoResult = await client.query(
          `SELECT id, galones_totales
           FROM monedero_flota
           WHERE vehiculo_id = $1`,
          [vehiculo_id]
        );

        if (monederoResult.rowCount === 0) {
          console.warn(`No se encontró monedero para vehiculo_id ${vehiculo_id}`);
          continue;
        }

        const monedero = monederoResult.rows[0];
        const { id: monedero_id, galones_totales } = monedero;

        // Obtener canal_id y subcanal_id desde la tabla tarjetas
        const tarjetaResult = await client.query(
          `SELECT canal_id, subcanal_id
           FROM tarjetas
           WHERE vehiculo_id = $1
           LIMIT 1`,
          [vehiculo_id]
        );

        const tarjeta = tarjetaResult.rowCount !== null && tarjetaResult.rowCount > 0 
          ? tarjetaResult.rows[0] 
          : { canal_id: null, subcanal_id: null };
        const { canal_id, subcanal_id } = tarjeta;

        // Actualizar galones_disponibles, galones_consumidos y odometro
        const updateResult = await client.query(
          `UPDATE monedero_flota
           SET galones_disponibles = $1,
               galones_consumidos = 0,
               odometro = 0
           WHERE id = $2
           RETURNING id, galones_totales, galones_disponibles, galones_consumidos, odometro, vehiculo_id`,
          [galones_totales, monedero_id]
        );

        // Verificar rowCount explícitamente
        if (updateResult.rowCount !== null && updateResult.rowCount > 0) {
          updatedMonederos.push(updateResult.rows[0]);

          // Registrar el reseteo en la tabla monedero_reset con el usuario_id y created_at
          await client.query(
            `INSERT INTO monedero_reset (monedero_id, vehiculo_id, canal_id, subcanal_id, usuario_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [monedero_id, vehiculo_id, canal_id || null, subcanal_id || null, session.id, created_at]
          );
        }
      }

      // Confirmar la transacción
      await client.query('COMMIT');

      if (updatedMonederos.length === 0) {
        return NextResponse.json(
          { message: 'No se encontraron monederos para los vehículos proporcionados' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Monederos reseteados con éxito',
        data: updatedMonederos,
      });
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Error al resetear los monederos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { message: `Error al resetear los monederos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
