// src/app/api/estaciones/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Crear un pool de conexión con la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🚀 Método POST para crear una nueva estación
export async function POST(request: Request) {
  const formData = await request.formData();

  // Obtener los valores del formulario
  const nombre_empresa = formData.get('nombre_empresa');
  const nombre_impreso = formData.get('nombre_impreso');
  const pais = formData.get('pais');
  const moneda = formData.get('moneda');
  const correo = formData.get('correo');
  const telefono = formData.get('telefono');
  const nfi = formData.get('nfi');
  const prefijo_tarjetas = formData.get('prefijo_tarjetas');

  // Obtener los logos como archivos binarios
  const logo = formData.get('logo') as Blob;
  const logo_impreso = formData.get('logo_impreso') as Blob;

  try {
    // Convertir los logos a buffer
    const logoBuffer = logo ? Buffer.from(await logo.arrayBuffer()) : null;
    const logoImpresoBuffer = logo_impreso ? Buffer.from(await logo_impreso.arrayBuffer()) : null;

    const client = await pool.connect();

    // Insertar los datos en la tabla "estaciones"
    await client.query(
      `INSERT INTO empresas (nombre_empresa, nombre_impreso, logo, logo_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [nombre_empresa, nombre_impreso, logoBuffer, logoImpresoBuffer, pais, moneda, correo, telefono, nfi, prefijo_tarjetas]
    );

    client.release();

    return NextResponse.json({ message: 'Estación creada con éxito' });
  } catch (error) {
    console.error('Error al guardar la estación:', error);
    return NextResponse.json({ message: 'Error al crear la estación' }, { status: 500 });
  }
}

// 🚀 Método GET para obtener todas las estaciones
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas FROM empresas`
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las estaciones:', error);
    return NextResponse.json({ message: 'Error al obtener las estaciones' }, { status: 500 });
  }
}

// 🚀 Método PUT para actualizar los datos de una estación
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const nombre_empresa = formData.get('nombre_empresa');
    const nombre_impreso = formData.get('nombre_impreso');
    const pais = formData.get('pais');
    const moneda = formData.get('moneda');
    const correo = formData.get('correo');
    const telefono = formData.get('telefono');
    const nfi = formData.get('nfi');
    const prefijo_tarjetas = formData.get('prefijo_tarjetas');

    // Validar que el ID esté presente
    if (!id) {
      return NextResponse.json({ message: 'El ID de la estación es obligatorio' }, { status: 400 });
    }

    // Verificar si hay archivos de logo
    const logo = formData.get('logo') as Blob;
    const logo_impreso = formData.get('logo_impreso') as Blob;
    let logoBuffer = null;
    let logoImpresoBuffer = null;

    if (logo) logoBuffer = Buffer.from(await logo.arrayBuffer());
    if (logo_impreso) logoImpresoBuffer = Buffer.from(await logo_impreso.arrayBuffer());

    const client = await pool.connect();

    // Realizar la actualización de los datos
    const result = await client.query(
      `UPDATE empresas
       SET nombre_empresa = $1, nombre_impreso = $2, pais = $3, moneda = $4, correo = $5, telefono = $6, nfi = $7, prefijo_tarjetas = $8,
           logo = COALESCE($9, logo), logo_impreso = COALESCE($10, logo_impreso)
       WHERE id = $11
       RETURNING *`,
      [nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas, logoBuffer, logoImpresoBuffer, id]
    );

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la estación:', error);
    return NextResponse.json({ message: 'Error al actualizar la estación' }, { status: 500 });
  }
}
