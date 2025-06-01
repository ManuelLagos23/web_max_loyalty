import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Método POST para agregar una nueva transacción
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const cliente_id = formData.get('cliente_id');
    const establecimiento_id = formData.get('establecimiento_id');
    const fecha = formData.get('fecha');
    const monto = formData.get('monto');
    const terminal_id = formData.get('terminal_id');
    const unidades = formData.get('unidades');
    const descuento = formData.get('descuento');
    const canal_id = formData.get('canal_id');
    const tipo_combustible_id = formData.get('tipo_combustible_id');

    // Validar que todos los campos sean correctos
    if (
      !cliente_id ||
      !establecimiento_id ||
      !fecha ||
      !monto ||
      !terminal_id ||
      !unidades ||
      !descuento ||
      !canal_id ||
      !tipo_combustible_id ||
      typeof cliente_id !== 'string' ||
      typeof establecimiento_id !== 'string' ||
      typeof fecha !== 'string' ||
      typeof monto !== 'string' ||
      typeof terminal_id !== 'string' ||
      typeof unidades !== 'string' ||
      typeof descuento !== 'string' ||
      typeof canal_id !== 'string' ||
      typeof tipo_combustible_id !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      INSERT INTO transacciones (
        cliente_id, establecimiento_id, fecha, monto, terminal_id,
        unidades, descuento, canal_id, tipo_combustible_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        (SELECT nombre FROM clientes WHERE id = $1) AS cliente_nombre,
        (SELECT nombre_centro_costos FROM costos WHERE id = $2) AS establecimiento_nombre,
        fecha,
        monto,
        (SELECT nombre_terminal FROM terminales WHERE id = $5) AS terminal_nombre,
        numero_tarjeta,
        estado,
        unidades,
        descuento,
        (SELECT canal FROM canales WHERE id = $8) AS canal_nombre,
        (SELECT name FROM tipo_combustible WHERE id = $9) AS tipo_combustible_nombre
      `,
      [
        cliente_id,
        establecimiento_id,
        fecha,
        monto,
        terminal_id,
        unidades,
        descuento,
        canal_id,
        tipo_combustible_id,
      ]
    );
    client.release();

    return NextResponse.json({
      message: 'Transacción creada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar la transacción:', error);
    return NextResponse.json({ message: 'Error al crear la transacción' }, { status: 500 });
  }
}

// Método GET para obtener todas las transacciones
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT
        t.id,
        c.nombre AS cliente_nombre,
        ct.nombre_centro_costos AS establecimiento_nombre,
        t.fecha,
        t.monto,
        te.nombre_terminal AS terminal_nombre,
        t.numero_tarjeta,
        t.estado,
        t.unidades,
        t.descuento,
        t.turno_id,
        t.turno_estado,
        ca.canal AS canal_nombre,
        tc.name AS tipo_combustible_nombre
      FROM transacciones t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN costos ct ON t.establecimiento_id = ct.id
      LEFT JOIN terminales te ON t.terminal_id = te.id
      LEFT JOIN canales ca ON t.canal_id = ca.id
      LEFT JOIN tipo_combustible tc ON t.tipo_combustible_id = tc.id
      order by id desc
      `
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    return NextResponse.json({ message: 'Error al obtener las transacciones' }, { status: 500 });
  }
}

// Método PUT para actualizar una transacción
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const cliente_id = formData.get('cliente_id');
    const establecimiento_id = formData.get('establecimiento_id');
    const fecha = formData.get('fecha');
    const monto = formData.get('monto');
    const terminal_id = formData.get('terminal_id');
    const unidades = formData.get('unidades');
    const descuento = formData.get('descuento');
    const canal_id = formData.get('canal_id');
    const tipo_combustible_id = formData.get('tipo_combustible_id');

    // Validar que todos los campos sean correctos
    if (
      !id ||
      !cliente_id ||
      !establecimiento_id ||
      !fecha ||
      !monto ||
      !terminal_id ||
      !unidades ||
      !descuento ||
      !canal_id ||
      !tipo_combustible_id ||
      typeof id !== 'string' ||
      typeof cliente_id !== 'string' ||
      typeof establecimiento_id !== 'string' ||
      typeof fecha !== 'string' ||
      typeof monto !== 'string' ||
      typeof terminal_id !== 'string' ||
      typeof unidades !== 'string' ||
      typeof descuento !== 'string' ||
      typeof canal_id !== 'string' ||
      typeof tipo_combustible_id !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    // Convertir id a número
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      return NextResponse.json({ message: 'El ID debe ser un número válido' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `
      UPDATE transacciones
      SET
        cliente_id = $1,
        establecimiento_id = $2,
        fecha = $3,
        monto = $4,
        terminal_id = $5,
        unidades = $6,
        descuento = $7,
        canal_id = $8,
        tipo_combustible_id = $9
      WHERE id = $10
      RETURNING
        id,
        (SELECT nombre FROM clientes WHERE id = $1) AS cliente_nombre,
        (SELECT nombre_centro_costos FROM costos WHERE id = $2) AS establecimiento_nombre,
        fecha,
        monto,
        (SELECT nombre_terminal FROM terminales WHERE id = $5) AS terminal_nombre,
        numero_tarjeta,
        estado,
        unidades,
        descuento,
        (SELECT canal FROM canales WHERE id = $8) AS canal_nombre,
        (SELECT name FROM tipo_combustible WHERE id = $9) AS tipo_combustible_nombre
      `,
      [
        cliente_id,
        establecimiento_id,
        fecha,
        monto,
        terminal_id,
        unidades,
        descuento,
        canal_id,
        tipo_combustible_id,
        idNumber,
      ]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: 'No se encontró la transacción con el ID proporcionado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Transacción actualizada con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar la transacción:', error);
    return NextResponse.json({ message: 'Error al actualizar la transacción' }, { status: 500 });
  }
}