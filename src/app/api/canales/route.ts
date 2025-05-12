import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar un nuevo canal
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const canal = formData.get('canal');
    const codigo_canal = formData.get('codigo_canal');

    if (!canal || typeof canal !== 'string' || !codigo_canal || typeof codigo_canal !== 'string') {
      return NextResponse.json(
        { message: 'El canal y el código del canal son obligatorios y deben ser cadenas de texto' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO canales (canal, codigo_canal) VALUES ($1, $2) RETURNING id, canal, codigo_canal`,
      [canal, codigo_canal]
    );
    client.release();

    return NextResponse.json({
      message: 'Canal creado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar el canal:', error);
    return NextResponse.json({ message: 'Error al crear el canal' }, { status: 500 });
  }
}

// Método GET para obtener todos los canales
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT id, canal, codigo_canal FROM canales`);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los canales:', error);
    return NextResponse.json({ message: 'Error al obtener los canales' }, { status: 500 });
  }
}

// Método PUT para actualizar un canal
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const canal = formData.get('canal');
    const codigo_canal = formData.get('codigo_canal');

    if (!id || !canal || typeof canal !== 'string' || !codigo_canal || typeof codigo_canal !== 'string') {
      return NextResponse.json(
        { message: 'El ID, el canal y el código del canal son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE canales SET canal = $1, codigo_canal = $2 WHERE id = $3 RETURNING id, canal, codigo_canal`,
      [canal, codigo_canal, id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el canal con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Canal actualizado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar el canal:', error);
    return NextResponse.json({ message: 'Error al actualizar el canal' }, { status: 500 });
  }
}

// Método DELETE para eliminar un canal
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'El ID es obligatorio y debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM canales WHERE id = $1 RETURNING id, canal, codigo_canal`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró el canal con el ID proporcionado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Canal eliminado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar el canal:', error);
    return NextResponse.json({ message: 'Error al eliminar el canal' }, { status: 500 });
  }
}