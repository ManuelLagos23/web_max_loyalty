import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString();
    const email = formData.get('email')?.toString();
    const contraseña = formData.get('contraseña')?.toString();
    const foto = formData.get('foto');
    const numTelefono = formData.get('num_telefono')?.toString();
    const admin = formData.get('admin')?.toString() === 'true'; // Convertir string a booleano

    if (!nombre || !email || !contraseña || !numTelefono || !foto) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    const arrayBuffer = await (foto as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await client.query(
      `
      INSERT INTO usuarios (nombre, email, password, img, num_telefono, admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, email, num_telefono, encode(img, 'base64') as img, admin
      `,
      [nombre, email, contraseña, buffer, numTelefono, admin]
    );

    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al agregar el usuario:', error);
    return NextResponse.json({ message: 'Error al agregar el usuario' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre, email, num_telefono, encode(img, 'base64') as img, admin FROM usuarios`
    );
    client.release();
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return NextResponse.json({ message: 'Error al obtener los usuarios' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const nombre = formData.get('nombre')?.toString();
    const email = formData.get('email')?.toString();
    const contraseña = formData.get('contraseña')?.toString();
    const numTelefono = formData.get('num_telefono')?.toString();
    const foto = formData.get('foto');
    const admin = formData.get('admin')?.toString() === 'true'; // Convertir string a booleano

    if (!id || !nombre || !email || !numTelefono) {
      return NextResponse.json(
        { message: 'El ID, nombre, email y número de teléfono son obligatorios' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    let query = `
      UPDATE usuarios 
      SET nombre = $1, email = $2, num_telefono = $3, admin = $4`;
    const values: (string | Buffer | boolean)[] = [nombre, email, numTelefono, admin];

    let paramIndex = 5;

    if (contraseña) {
      query += `, password = $${paramIndex}`;
      values.push(contraseña);
      paramIndex++;
    }

    if (foto && typeof foto !== 'string') {
      const arrayBuffer = await (foto as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      query += `, img = $${paramIndex}`;
      values.push(buffer);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING id, nombre, email, num_telefono, encode(img, 'base64') as img, admin`;
    values.push(id);

    const result = await client.query(query, values);

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return NextResponse.json({ message: 'Error al actualizar el usuario' }, { status: 500 });
  }
}