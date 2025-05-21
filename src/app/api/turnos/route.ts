import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fecha_inicio = formData.get('fecha_inicio')?.toString();
    const fecha_final = formData.get('fecha_final')?.toString();
    const miembro_id = formData.get('miembro_id')?.toString();
    const empresa_id = formData.get('empresa_id')?.toString();
    const establecimiento = formData.get('establecimiento')?.toString();
    const terminal_id = formData.get('terminal_id')?.toString();
    const estado = formData.get('estado')?.toString() === 'true';

    // Validar campos obligatorios, incluyendo fecha_final
    if (!fecha_inicio || !fecha_final || !miembro_id || !empresa_id || !establecimiento || !terminal_id) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      INSERT INTO turnos (fecha_inicio, fecha_final, miembro_id, empresa_id, establecimiento_id, terminal_id, estado)
      VALUES ($1::timestamp, $2::timestamp, $3, $4, $5, $6, $7)
      RETURNING 
        id, 
        fecha_inicio, 
        fecha_final, 
        miembro_id, 
        empresa_id, 
        establecimiento_id, 
        terminal_id, 
        estado
      `,
      [fecha_inicio, fecha_final, miembro_id, empresa_id, establecimiento, terminal_id, estado]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear turno:', error);
     return NextResponse.json({ message: 'Error al crear el turno' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        t.id,
        t.fecha_inicio,
        t.fecha_final,
        t.miembro_id,
        m.nombre AS usuario_nombre,
        t.empresa_id,
        e.nombre_empresa AS empresa_nombre,
        t.establecimiento_id,
        c.nombre_centro_costos AS establecimiento_nombre,
        t.terminal_id,
        tr.nombre_terminal AS terminal_nombre,
        t.estado
      FROM turnos t
      LEFT JOIN miembros m ON t.miembro_id = m.id
      LEFT JOIN empresas e ON t.empresa_id = e.id
      LEFT JOIN costos c ON t.establecimiento_id = c.id
      LEFT JOIN terminales tr ON t.terminal_id = tr.id
      WHERE 
        COALESCE(m.nombre, '') ILIKE $1 OR
        COALESCE(e.nombre_empresa, '') ILIKE $1 OR
        COALESCE(c.nombre_centro_costos, '') ILIKE $1 OR
        COALESCE(tr.nombre_terminal, '') ILIKE $1 OR
        t.fecha_inicio::text ILIKE $1 OR
        t.fecha_final::text ILIKE $1
      ORDER BY t.fecha_inicio DESC
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener turnos:', error);
  return NextResponse.json({ message: 'Error al crear el turno' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const fecha_inicio = formData.get('fecha_inicio')?.toString();
    const fecha_final = formData.get('fecha_final')?.toString();
    const miembro_id = formData.get('miembro_id')?.toString();
    const empresa_id = formData.get('empresa_id')?.toString();
    const establecimiento = formData.get('establecimiento')?.toString();
    const terminal_id = formData.get('terminal_id')?.toString();
    const estado = formData.get('estado')?.toString() === 'true';

    // Validar campos obligatorios, incluyendo fecha_final
    if (!id || !fecha_inicio || !fecha_final || !miembro_id || !empresa_id || !establecimiento || !terminal_id) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      UPDATE turnos
      SET 
        fecha_inicio = $1::timestamp, 
        fecha_final = $2::timestamp, 
        miembro_id = $3, 
        empresa_id = $4, 
        establecimiento_id = $5, 
        terminal_id = $6, 
        estado = $7
      WHERE id = $8
      RETURNING 
        id, 
        fecha_inicio, 
        fecha_final, 
        miembro_id, 
        empresa_id, 
        establecimiento_id, 
        terminal_id, 
        estado
      `,
      [fecha_inicio, fecha_final, miembro_id, empresa_id, establecimiento, terminal_id, estado, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Turno no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    return NextResponse.json({ message: 'Error al crear el turno' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      'DELETE FROM turnos WHERE id = $1 RETURNING id',
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Turno no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Turno eliminado' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
  return NextResponse.json({ message: 'Error al crear el turno' }, { status: 500 });
  }
}