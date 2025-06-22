import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID de la transacción es obligatorio' }, { status: 400 });
    }

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
        ca.canal AS canal_nombre,
        tc.name AS tipo_combustible_nombre,
        t.turno_id,
        t.turno_estado
      FROM transacciones t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN costos ct ON t.establecimiento_id = ct.id
      LEFT JOIN terminales te ON t.terminal_id = te.id
      LEFT JOIN canales ca ON t.canal_id = ca.id
      LEFT JOIN tipo_combustible tc ON t.tipo_combustible_id = tc.id
      WHERE t.id = $1
      `,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Transacción no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener la transacción:', error);
    return NextResponse.json({ message: 'Error al obtener la transacción' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'El ID de la transacción es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM transacciones WHERE id = $1 RETURNING *`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Transacción no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transacción eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la transacción:', error);
    return NextResponse.json({ message: 'Error al eliminar la transacción' }, { status: 500 });
  }
}