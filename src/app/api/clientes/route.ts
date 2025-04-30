import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString();
    const pais = formData.get('pais')?.toString();
    const estado = formData.get('estado')?.toString();
    const ciudad = formData.get('ciudad')?.toString();
    const email = formData.get('email')?.toString();
    const telefono = formData.get('telefono')?.toString();
    const nfi = formData.get('nfi')?.toString();
    const logo = formData.get('logo');

    if (!nombre || !pais || !estado || !ciudad || !email || !telefono || !nfi || !logo) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    const arrayBuffer = await (logo as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await client.query(
      `
      INSERT INTO clientes (nombre, pais, estado, ciudad, email, telefono, nfi, logo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, nombre, pais, estado, ciudad, email, telefono, nfi, encode(logo, 'base64') as logo
      `,
      [nombre, pais, estado, ciudad, email, telefono, nfi, buffer]
    );

    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al guardar el cliente:', error);
    return NextResponse.json({ message: 'Error al crear el cliente' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre, pais, estado, ciudad, email, telefono, nfi, encode(logo, 'base64') as logo FROM clientes`
    );
    client.release();
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    return NextResponse.json({ message: 'Error al obtener los clientes' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const nombre = formData.get('nombre')?.toString();
    const pais = formData.get('pais')?.toString();
    const estado = formData.get('estado')?.toString();
    const ciudad = formData.get('ciudad')?.toString();
    const email = formData.get('email')?.toString();
    const telefono = formData.get('telefono')?.toString();
    const nfi = formData.get('nfi')?.toString();
    const logo = formData.get('logo');

    if (!id || !nombre || !pais || !estado || !ciudad || !email || !telefono || !nfi) {
      return NextResponse.json({ message: 'El ID y todos los campos del cliente son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    let query = `
      UPDATE clientes 
      SET nombre = $1, pais = $2, estado = $3, ciudad = $4, email = $5, telefono = $6, nfi = $7`;
    let values: any[] = [nombre, pais, estado, ciudad, email, telefono, nfi];

    if (logo && typeof logo !== 'string') {
      const arrayBuffer = await (logo as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      query += `, logo = $${values.length + 1}`;
      values.push(buffer);
    }

    query += ` WHERE id = $${values.length + 1} RETURNING id, nombre, pais, estado, ciudad, email, telefono, nfi, encode(logo, 'base64') as logo`;
    values.push(id);

    const result = await client.query(query, values);

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return NextResponse.json({ message: 'Error al actualizar el cliente' }, { status: 500 });
  }
}