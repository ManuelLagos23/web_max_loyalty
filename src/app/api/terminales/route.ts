import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const formData = await request.formData();

  const empresa = formData.get('empresa');
  const estacion_servicio = formData.get('estacion_servicio');
  const codigo_terminal = formData.get('codigo_terminal');
  const nombre_terminal = formData.get('nombre_terminal');
  const numero_serie = formData.get('numero_serie');
  const mac = formData.get('mac');
  const modelo = formData.get('modelo');
  const marca = formData.get('marca');

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO terminales (empresa, estacion_servicio, codigo_terminal, nombre_terminal, numero_serie, mac, modelo, marca)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [empresa, estacion_servicio, codigo_terminal, nombre_terminal, numero_serie, mac, modelo, marca]
    );

    client.release();

    return NextResponse.json({ message: 'Terminal creada con éxito' });
  } catch (error) {
    console.error('Error al guardar la terminal:', error);
    return NextResponse.json({ message: 'Error al crear la terminal' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, empresa, estacion_servicio, codigo_terminal, nombre_terminal, numero_serie, mac, modelo, marca, codigo_activacion, id_activacion FROM terminales`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las terminales:', error);
    return NextResponse.json({ message: 'Error al obtener las terminales' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const empresa = formData.get('empresa');
    const estacion_servicio = formData.get('estacion_servicio');
    const codigo_terminal = formData.get('codigo_terminal');
    const nombre_terminal = formData.get('nombre_terminal');
    const numero_serie = formData.get('numero_serie');
    const mac = formData.get('mac');
    const modelo = formData.get('modelo');
    const marca = formData.get('marca');
    const codigo_activacion = formData.get('codigo_activacion') || null;

    if (!id) {
      return NextResponse.json({ message: 'El ID de la terminal es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    let result;

    if (formData.has('id_activacion') && formData.get('id_activacion') === '0') {
      const id_activacion = formData.get('id_activacion');
      result = await client.query(
        `UPDATE terminales
         SET empresa = $1, estacion_servicio = $2, codigo_terminal = $3, nombre_terminal = $4, numero_serie = $5, mac = $6, modelo = $7, marca = $8, codigo_activacion = $9, id_activacion = $10
         WHERE id = $11
         RETURNING *`,
        [empresa, estacion_servicio, codigo_terminal, nombre_terminal, numero_serie, mac, modelo, marca, codigo_activacion, id_activacion, id]
      );
    } else {
      result = await client.query(
        `UPDATE terminales
         SET empresa = $1, estacion_servicio = $2, codigo_terminal = $3, nombre_terminal = $4, numero_serie = $5, mac = $6, modelo = $7, marca = $8, codigo_activacion = $9
         WHERE id = $10
         RETURNING *`,
        [empresa, estacion_servicio, codigo_terminal, nombre_terminal, numero_serie, mac, modelo, marca, codigo_activacion, id]
      );
    }

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'No se encontró la terminal con ese ID' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la terminal:', error);
    return NextResponse.json({ message: 'Error al actualizar la terminal' }, { status: 500 });
  }
}