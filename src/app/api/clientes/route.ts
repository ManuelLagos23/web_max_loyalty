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
    const canal_id = formData.get('canal_id')?.toString();
    const subcanal_id = formData.get('subcanal_id')?.toString();
    const ciudad = formData.get('ciudad')?.toString();
    const email = formData.get('email')?.toString();
    const telefono = formData.get('telefono')?.toString();
    const nfi = formData.get('nfi')?.toString();
    const logo = formData.get('logo');

    if (!nombre || !pais || !estado || !canal_id || !subcanal_id || !ciudad || !email || !telefono || !nfi) {
      return NextResponse.json({ message: 'Todos los campos excepto el logo son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();

    // Validar que los IDs existan
    const paisCheck = await client.query('SELECT id FROM paises WHERE id = $1', [pais]);
    if (paisCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'País no encontrado' }, { status: 400 });
    }
    const estadoCheck = await client.query('SELECT id FROM estados WHERE id = $1', [estado]);
    if (estadoCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Estado no encontrado' }, { status: 400 });
    }
    const canalCheck = await client.query('SELECT id FROM canales WHERE id = $1', [canal_id]);
    if (canalCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Canal no encontrado' }, { status: 400 });
    }
    const subcanalCheck = await client.query('SELECT id FROM subcanales WHERE id = $1 AND canal_id = $2', [subcanal_id, canal_id]);
    if (subcanalCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Subcanal no encontrado o no corresponde al canal' }, { status: 400 });
    }

    let buffer: Buffer | null = null;
    if (logo && typeof logo !== 'string') {
      const arrayBuffer = await (logo as File).arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const result = await client.query(
      `
      INSERT INTO clientes (nombre, pais, estado, canal_id, subcanal_id, ciudad, email, telefono, nfi, logo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, nombre, ciudad, email, telefono, nfi, 
        encode(logo, 'base64') as logo,
        pais AS pais_id, estado AS estado_id, canal_id, subcanal_id,
        (SELECT pais FROM paises WHERE id = $2) AS pais,
        (SELECT estado FROM estados WHERE id = $3) AS estado,
        (SELECT canal FROM canales WHERE id = $4) AS canal_nombre,
        (SELECT subcanal FROM subcanales WHERE id = $5) AS subcanal_nombre
      `,
      [nombre, pais, estado, canal_id, subcanal_id, ciudad, email, telefono, nfi, buffer]
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
      `
      SELECT 
        c.id, 
        c.nombre, 
        p.pais AS pais, 
        e.estado AS estado, 
        c.ciudad, 
        c.email, 
        c.telefono, 
        c.nfi, 
        c.pais AS pais_id,
        c.estado AS estado_id,
        c.canal_id,
        c.subcanal_id,
        can.canal AS canal_nombre,
        sub.subcanal AS subcanal_nombre,
        encode(c.logo, 'base64') as logo
      FROM clientes c
      LEFT JOIN paises p ON c.pais = p.id
      LEFT JOIN estados e ON c.estado = e.id
      LEFT JOIN canales can ON c.canal_id = can.id
      LEFT JOIN subcanales sub ON c.subcanal_id = sub.id
      `
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
    const canal_id = formData.get('canal_id')?.toString();
    const subcanal_id = formData.get('subcanal_id')?.toString();
    const ciudad = formData.get('ciudad')?.toString();
    const email = formData.get('email')?.toString();
    const telefono = formData.get('telefono')?.toString();
    const nfi = formData.get('nfi')?.toString();
    const logo = formData.get('logo');

    if (!id || !nombre || !pais || !estado || !canal_id || !subcanal_id || !ciudad || !email || !telefono || !nfi) {
      return NextResponse.json({ message: 'El ID y todos los campos del cliente excepto el logo son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();

    // Validar que los IDs existan
    const paisCheck = await client.query('SELECT id FROM paises WHERE id = $1', [pais]);
    if (paisCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'País no encontrado' }, { status: 400 });
    }
    const estadoCheck = await client.query('SELECT id FROM estados WHERE id = $1', [estado]);
    if (estadoCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Estado no encontrado' }, { status: 400 });
    }
    const canalCheck = await client.query('SELECT id FROM canales WHERE id = $1', [canal_id]);
    if (canalCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Canal no encontrado' }, { status: 400 });
    }
    const subcanalCheck = await client.query('SELECT id FROM subcanales WHERE id = $1 AND canal_id = $2', [subcanal_id, canal_id]);
    if (subcanalCheck.rowCount === 0) {
      client.release();
      return NextResponse.json({ message: 'Subcanal no encontrado o no corresponde al canal' }, { status: 400 });
    }

    let query = `
      UPDATE clientes 
      SET nombre = $1, pais = $2, estado = $3, canal_id = $4, subcanal_id = $5, ciudad = $6, email = $7, telefono = $8, nfi = $9`;
    const values: (string | Buffer | null)[] = [nombre, pais, estado, canal_id, subcanal_id, ciudad, email, telefono, nfi];

    if (logo && typeof logo !== 'string') {
      const arrayBuffer = await (logo as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      query += `, logo = $${values.length + 1}`;
      values.push(buffer);
    } else if (logo === null || logo === 'null') {
      query += `, logo = NULL`;
    }

    query += ` WHERE id = $${values.length + 1} 
      RETURNING 
        id, nombre, ciudad, email, telefono, nfi, 
        encode(logo, 'base64') as logo,
        pais AS pais_id, estado AS estado_id, canal_id, subcanal_id,
        (SELECT pais FROM paises WHERE id = $2) AS pais,
        (SELECT estado FROM estados WHERE id = $3) AS estado,
        (SELECT canal FROM canales WHERE id = $4) AS canal_nombre,
        (SELECT subcanal FROM subcanales WHERE id = $5) AS subcanal_nombre`;
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