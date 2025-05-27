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
      'SELECT id, nombre, email, num_telefono, encode(img, \'base64\') as img FROM usuarios WHERE id = $1',
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

// Método POST para agregar un nuevo descuento
export async function POST(request: NextRequest) {
  try {
    // Validate the current session to get the logged-in user
    const session = await validateSession(request);
    if (!session || !session.id) {
      return NextResponse.json(
        { message: 'Usuario no autenticado. Por favor, inicia sesión.' },
        { status: 401 }
      );
    }
    const userId = session.id;
    const userName = session.nombre;

    const formData = await request.formData();
    const active = formData.get('active') === 'true';
    const descuento = formData.get('descuento');
    const display_name = formData.get('display_name');
    const canal_id = formData.get('canal_id');
    const tipo_combustible_id = formData.get('tipo_combustible_id');

    if (
      !display_name || typeof display_name !== 'string' ||
      !canal_id || isNaN(Number(canal_id)) ||
      !tipo_combustible_id || isNaN(Number(tipo_combustible_id)) ||
      !descuento || isNaN(Number(descuento))
    ) {
      return NextResponse.json(
        { message: 'Todos los campos obligatorios deben ser válidos (display_name, canal_id, tipo_combustible_id, descuento)' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO descuentos (active, descuento, display_name, canal_id, tipo_combustible_id, create_date, write_date, create_uid, write_uid)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7)
       RETURNING id, active, create_date, create_uid, descuento, display_name, canal_id, tipo_combustible_id, write_date, write_uid`,
      [active, Number(descuento), display_name, Number(canal_id), Number(tipo_combustible_id), userId, userId]
    );
    client.release();

    return NextResponse.json({
      message: 'Descuento creado con éxito',
      data: { ...result.rows[0], create_uid_name: userName, write_uid_name: userName },
    });
  } catch (error) {
    console.error('Error al guardar el descuento:', error);
    return NextResponse.json({ message: 'Error al crear el descuento' }, { status: 500 });
  }
}

// Método GET para obtener todos los descuentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const client = await pool.connect();
    const offset = (page - 1) * limit;
    const result = await client.query(
      `
      SELECT 
        d.id, d.active, d.create_date, d.create_uid, d.descuento, d.display_name, 
        d.canal_id, d.tipo_combustible_id, d.write_date, d.write_uid,
        c.canal AS canal_nombre, tc.name AS tipo_combustible_nombre,
        u1.nombre AS create_uid_name, u2.nombre AS write_uid_name
      FROM descuentos d
      JOIN canales c ON d.canal_id = c.id
      JOIN tipo_combustible tc ON d.tipo_combustible_id = tc.id
      LEFT JOIN usuarios u1 ON d.create_uid = u1.id
      LEFT JOIN usuarios u2 ON d.write_uid = u2.id
      ORDER BY d.id
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM descuentos d
      JOIN canales c ON d.canal_id = c.id
      JOIN tipo_combustible tc ON d.tipo_combustible_id = tc.id
      `,
    );

    const total = parseInt(totalResult.rows[0].total, 10);
    client.release();

    return NextResponse.json({
      data: result.rows,
      total,
    });
  } catch (error) {
    console.error('Error al obtener los descuentos:', error);
    return NextResponse.json({ message: 'Error al obtener los descuentos' }, { status: 500 });
  }
}

// Método PUT para actualizar un descuento
export async function PUT(request: NextRequest) {
  try {
    // Validate the current session to get the logged-in user
    const session = await validateSession(request);
    if (!session || !session.id) {
      return NextResponse.json(
        { message: 'Usuario no autenticado. Por favor, inicia sesión.' },
        { status: 401 }
      );
    }
    const userId = session.id;
    const userName = session.nombre;

    const formData = await request.formData();
    const id = formData.get('id');
    const active = formData.get('active') === 'true';
    const descuento = formData.get('descuento');
    const display_name = formData.get('display_name');
    const canal_id = formData.get('canal_id');
    const tipo_combustible_id = formData.get('tipo_combustible_id');

    if (
      !id || isNaN(Number(id)) ||
      !display_name || typeof display_name !== 'string' ||
      !canal_id || isNaN(Number(canal_id)) ||
      !tipo_combustible_id || isNaN(Number(tipo_combustible_id)) ||
      !descuento || isNaN(Number(descuento))
    ) {
      return NextResponse.json(
        { message: 'El ID y todos los campos obligatorios deben ser válidos (display_name, canal_id, tipo_combustible_id, descuento)' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE descuentos 
       SET active = $1, descuento = $2, display_name = $3, 
           canal_id = $4, tipo_combustible_id = $5, write_date = NOW(), write_uid = $6
       WHERE id = $7
       RETURNING id, active, create_date, create_uid, descuento, display_name, canal_id, tipo_combustible_id, write_date, write_uid`,
      [active, Number(descuento), display_name, Number(canal_id), Number(tipo_combustible_id), userId, Number(id)]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el descuento con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Descuento actualizado con éxito',
      data: { ...result.rows[0], write_uid_name: userName },
    });
  } catch (error) {
    console.error('Error al actualizar el descuento:', error);
    return NextResponse.json({ message: 'Error al actualizar el descuento' }, { status: 500 });
  }
}
