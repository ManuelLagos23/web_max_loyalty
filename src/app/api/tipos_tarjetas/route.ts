import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo tipo de tarjeta
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tipo_tarjeta = formData.get('tipo_tarjeta');
    const codigo_tipo_tarjeta = formData.get('codigo_tipo_tarjeta');
    const descripcion = formData.get('descripcion');

    if (
      !tipo_tarjeta ||
      !codigo_tipo_tarjeta ||
      !descripcion ||
      typeof tipo_tarjeta !== 'string' ||
      typeof codigo_tipo_tarjeta !== 'string' ||
      typeof descripcion !== 'string'
    ) {
      return NextResponse.json(
        { message: 'El tipo de tarjeta, código y descripción son obligatorios y deben ser cadenas de texto' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO tipos_tarjetas (tipo_tarjeta, codigo_tipo_tarjeta, descripcion) 
       VALUES ($1, $2, $3) 
       RETURNING id, tipo_tarjeta, codigo_tipo_tarjeta, descripcion`,
      [tipo_tarjeta, codigo_tipo_tarjeta, descripcion]
    );
    client.release();

    return NextResponse.json({
      message: 'Tipo de tarjeta creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el tipo de tarjeta:', error);
    return NextResponse.json({ message: 'Error al crear el tipo de tarjeta' }, { status: 500 });
  }
}

// Método GET para obtener todos los tipos de tarjeta
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, tipo_tarjeta, codigo_tipo_tarjeta, descripcion FROM tipos_tarjetas`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los tipos de tarjeta:', error);
    return NextResponse.json({ message: 'Error al obtener los tipos de tarjeta' }, { status: 500 });
  }
}

// Método PUT para actualizar un tipo de tarjeta
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const tipo_tarjeta = formData.get('tipo_tarjeta');
    const codigo_tipo_tarjeta = formData.get('codigo_tipo_tarjeta');
    const descripcion = formData.get('descripcion');

    if (
      !id ||
      !tipo_tarjeta ||
      !codigo_tipo_tarjeta ||
      !descripcion ||
      typeof tipo_tarjeta !== 'string' ||
      typeof codigo_tipo_tarjeta !== 'string' ||
      typeof descripcion !== 'string'
    ) {
      return NextResponse.json(
        { message: 'El ID, tipo de tarjeta, código y descripción son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE tipos_tarjetas 
       SET tipo_tarjeta = $1, codigo_tipo_tarjeta = $2, descripcion = $3 
       WHERE id = $4 
       RETURNING id, tipo_tarjeta, codigo_tipo_tarjeta, descripcion`,
      [tipo_tarjeta, codigo_tipo_tarjeta, descripcion, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: 'No se encontró el tipo de tarjeta con el ID proporcionado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tipo de tarjeta actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el tipo de tarjeta:', error);
    return NextResponse.json({ message: 'Error al actualizar el tipo de tarjeta' }, { status: 500 });
  }
}
