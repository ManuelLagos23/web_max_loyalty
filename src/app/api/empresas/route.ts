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

    // Validar campos obligatorios (sin incluir logo y logo_impreso)
    if (!nombre_empresa || !nombre_impreso || !pais || !moneda || !correo || !telefono || !nfi || !prefijo_tarjetas) {
      return NextResponse.json({ message: 'Todos los campos excepto los logos son obligatorios' }, { status: 400 });
    }

    let logoBuffer: Buffer | null = null;
    let logoImpBuffer: Buffer | null = null;

    if (logo && typeof logo !== 'string') {
      logoBuffer = Buffer.from(await (logo as File).arrayBuffer());
    }
    if (logo_impreso && typeof logo_impreso !== 'string') {
      logoImpBuffer = Buffer.from(await (logo_impreso as File).arrayBuffer());
    }

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

// 🚀 Método GET para obtener todas las estaciones con nombres reales de país y moneda
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT 
        e.id,
        e.nombre_empresa,
        e.nombre_impreso,
        p.pais AS pais,
        m.moneda AS moneda,
        e.correo,
        e.telefono,
        e.nfi,
        e.prefijo_tarjetas,
        encode(e.logo, 'base64') as logo,
        encode(e.logo_impreso, 'base64') as logo_impreso,
        e.pais as pais_id,
        e.moneda as moneda_id
      FROM empresas e
      JOIN paises p ON e.pais = p.id
      JOIN monedas m ON e.moneda = m.id
      `
    );
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las estaciones:', error);
    return NextResponse.json({ message: 'Error al obtener las estaciones' }, { status: 500 });
  }
}


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

    // Validar campos obligatorios (excepto logo y logo_impreso)
    if (!id || !nombre_empresa || !nombre_impreso || !pais || !moneda || !correo || !telefono || !nfi || !prefijo_tarjetas) {
      return NextResponse.json({ message: 'El ID y todos los campos (excepto logos) son obligatorios' }, { status: 400 });
    }

    const client = await pool.connect();
    let query = `
      UPDATE empresas 
      SET nombre_empresa = $1, nombre_impreso = $2, pais = $3, moneda = $4, correo = $5, telefono = $6, nfi = $7, prefijo_tarjetas = $8`;
    const values: (string | Buffer | null)[] = [nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas];
    let paramIndex = values.length + 1;

    // Handle logo only if present in formData
    if (formData.has('logo')) {
      const logo = formData.get('logo');
      if (logo && typeof logo !== 'string') {
        const logoBuffer = Buffer.from(await (logo as File).arrayBuffer());
        query += `, logo = $${paramIndex}`;
        values.push(logoBuffer);
        paramIndex++;
      } else if (logo === 'null') {
        query += `, logo = NULL`;
      }
    }

    // Handle logo_impreso only if present in formData
    if (formData.has('logo_impreso')) {
      const logo_impreso = formData.get('logo_impreso');
      if (logo_impreso && typeof logo_impreso !== 'string') {
        const logoImpBuffer = Buffer.from(await (logo_impreso as File).arrayBuffer());
        query += `, logo_impreso = $${paramIndex}`;
        values.push(logoImpBuffer);
        paramIndex++;
      } else if (logo_impreso === 'null') {
        query += `, logo_impreso = NULL`;
      }
    }

    query += ` WHERE id = $${paramIndex} 
              RETURNING id, nombre_empresa, nombre_impreso, pais, moneda, correo, telefono, nfi, prefijo_tarjetas, 
                        encode(logo, 'base64') as logo, encode(logo_impreso, 'base64') as logo_impreso`;
    values.push(id);

    const result = await client.query(query, values);

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la empresa:', error);
    return NextResponse.json({ message: 'Error al actualizar la empresa' }, { status: 500 });
  }
}