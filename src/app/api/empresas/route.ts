import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Crear un pool de conexión con la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🚀 Método POST para crear una nueva estación
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Obtener los valores del formulario
    const nombre_empresa = formData.get('nombre_empresa')?.toString();
    const nombre_impreso = formData.get('nombre_impreso')?.toString();
    const pais = formData.get('pais')?.toString();
    const moneda = formData.get('moneda')?.toString();
    const correo = formData.get('correo')?.toString();
    const telefono = formData.get('telefono')?.toString();
    const nfi = formData.get('nfi')?.toString();
    const prefijo_tarjetas = formData.get('prefijo_tarjetas')?.toString();
    const logo = formData.get('logo');
    const logo_impreso = formData.get('logo_impreso');

    // Validar campos obligatorios
    if (!nombre_empresa || !nombre_impreso || !pais || !moneda || !correo || !telefono || !nfi || !prefijo_tarjetas || !logo || !logo_impreso) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const logoBuffer = Buffer.from(await (logo as File).arrayBuffer());
    const logoImpBuffer = Buffer.from(await (logo_impreso as File).arrayBuffer());

    const client = await pool.connect();

    const result = await client.query(
      `
      INSERT INTO empresas (nombre_empresa, nombre_impreso, logo, logo_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas, encode(logo, 'base64') as logo, encode(logo_impreso, 'base64') as logo_impreso
      `,
      [nombre_empresa, nombre_impreso, logoBuffer, logoImpBuffer, pais, moneda, correo, telefono, nfi, prefijo_tarjetas]
    );

    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
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
      `
      SELECT id, nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas, 
             encode(logo, 'base64') as logo, encode(logo_impreso, 'base64') as logo_impreso 
      FROM empresas
      `
    );
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las estaciones:', error);
    return NextResponse.json({ message: 'Error al obtener las estaciones' }, { status: 500 });
  }
}

// 🚀 Método PUT para actualizar los datos de una estación
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const nombre_empresa = formData.get('nombre_empresa')?.toString();
    const nombre_impreso = formData.get('nombre_impreso')?.toString();
    const pais = formData.get('pais')?.toString();
    const moneda = formData.get('moneda')?.toString();
    const correo = formData.get('correo')?.toString();
    const telefono = formData.get('telefono')?.toString();
    const nfi = formData.get('nfi')?.toString();
    const prefijo_tarjetas = formData.get('prefijo_tarjetas')?.toString();
    const logo = formData.get('logo');
    const logo_impreso = formData.get('logo_impreso');

    // Validar campos obligatorios (excepto logo y logo_impreso, que son opcionales al actualizar)
    if (!id || !nombre_empresa || !nombre_impreso || !pais || !moneda || !correo || !telefono || !nfi || !prefijo_tarjetas) {
      return NextResponse.json({ message: 'El ID y todos los campos (excepto logos) son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    let query = `
      UPDATE empresas 
      SET nombre_empresa = $1, nombre_impreso = $2, pais = $3, moneda = $4, correo = $5, telefono = $6, nfi = $7, prefijo_tarjetas = $8`;
    let values: any[] = [nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas];

    if (logo && typeof logo !== 'string') {
      const logoBuffer = Buffer.from(await (logo as File).arrayBuffer());
      query += `, logo = $${values.length + 1}`;
      values.push(logoBuffer);
    }

    if (logo_impreso && typeof logo_impreso !== 'string') {
      const logoImpBuffer = Buffer.from(await (logo_impreso as File).arrayBuffer());
      query += `, logo_impreso = $${values.length + 1}`;
      values.push(logoImpBuffer);
    }

    query += ` WHERE id = $${values.length + 1} 
              RETURNING id, nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas, 
                        encode(logo, 'base64') as logo, encode(logo_impreso, 'base64') as logo_impreso`;
    values.push(id);

    const result = await client.query(query, values);

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Estación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la estación:', error);
    return NextResponse.json({ message: 'Error al actualizar la estación' }, { status: 500 });
  }
}