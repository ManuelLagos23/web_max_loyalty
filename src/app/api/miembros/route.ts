
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const nombre = formData.get('nombre');
  const user = formData.get('user');
  const email = formData.get('email');
  const establecimiento = formData.get('establecimiento');
  const empresa_id = formData.get('empresa_id');
  const terminal_id = formData.get('terminal_id');
  const password = formData.get('password');

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO miembros (nombre, "user", email, establecimiento, empresa_id, terminal_id, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nombre, user, email, establecimiento, empresa_id, terminal_id, password]
    );

    client.release();

    return NextResponse.json({ message: 'Miembro creado con éxito' });
  } catch (error) {
    console.error('Error al guardar el miembro:', error);
    return NextResponse.json({ message: 'Error al crear el miembro' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
    m.id, 
    m.nombre, 
    m."user", 
    m.email, 
    e.nombre_empresa AS empresa_nombre, 
    t.nombre_terminal AS terminal_nombre, 
    es.nombre_centro_costos AS establecimiento_nombre,
    m.terminal_id,
    m.empresa_id,
    m.establecimiento
FROM miembros m
LEFT JOIN empresas e ON m.empresa_id = e.id
LEFT JOIN terminales t ON m.terminal_id = t.id
LEFT JOIN costos es ON m.establecimiento = es.id;`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los miembros:', error);
    return NextResponse.json({ message: 'Error al obtener los miembros' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const nombre = formData.get('nombre');
    const user = formData.get('user');
    const email = formData.get('email');
    const establecimiento = formData.get('establecimiento');
    const empresa_id = formData.get('empresa_id');
    const terminal_id = formData.get('terminal_id');
    const password = formData.get('password');

    if (!id) {
      return NextResponse.json({ message: 'El ID del miembro es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();

    let query = `
      UPDATE miembros 
      SET nombre = $1, "user" = $2, email = $3, establecimiento = $4, empresa_id = $5, terminal_id = $6
    `;
    const values = [nombre, user, email, establecimiento, empresa_id, terminal_id];

    // Add password to the query only if it is provided
    if (password) {
      query += `, password = $${values.length + 1}`;
      values.push(password);
    }

    query += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);

    const result = await client.query(query, values);

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el miembro:', error);
    return NextResponse.json({ message: 'Error al actualizar el miembro' }, { status: 500 });
  }
}