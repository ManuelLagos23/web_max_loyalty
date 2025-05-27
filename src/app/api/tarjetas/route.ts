import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const numero = searchParams.get('numero');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';

  const client = await pool.connect();

  try {
    if (tipo === 'generar') {
      let newCardNumber = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 100;

      const lastCardResult = await client.query(`
        SELECT numero_correlativo
        FROM tarjetas
        ORDER BY created_at DESC, numero_correlativo DESC
        LIMIT 1
      `);

      let correlative = 1;
      if (lastCardResult.rows.length > 0) {
        const lastCorrelativeStr = lastCardResult.rows[0].numero_correlativo;
        correlative = parseInt(lastCorrelativeStr, 10) + 1;
        if (correlative > 9999) {
          client.release();
          return NextResponse.json(
            { message: 'Se ha alcanzado el límite de correlativos (9999)' },
            { status: 400 }
          );
        }
      }

   
      while (!isUnique && attempts < maxAttempts && correlative <= 9999) {
        attempts++;
        const correlativePart = correlative.toString().padStart(4, '0');
       newCardNumber = correlativePart;

        const checkResult = await client.query(
          'SELECT id FROM tarjetas WHERE numero_tarjeta = $1',
          [newCardNumber]
        );

        if ((checkResult.rowCount ?? 0) === 0) {
          isUnique = true;
        } else {
          correlative++;
        }
      }

      if (!isUnique) {
        client.release();
        return NextResponse.json(
          { message: 'No se pudo generar un número de tarjeta único' },
          { status: 500 }
        );
      }

      client.release();
      return NextResponse.json({ numero_tarjeta: newCardNumber }, { status: 200 });
    }

    if (tipo === 'ultimo') {
      const result = await client.query(`
        SELECT numero_tarjeta, numero_correlativo
        FROM tarjetas
        ORDER BY created_at DESC, numero_correlativo DESC
        LIMIT 1
      `);
      client.release();
      const ultimo = result.rows[0]
        ? {
            numero_tarjeta: result.rows[0].numero_tarjeta,
            numero_correlativo: result.rows[0].numero_correlativo,
          }
        : null;
      return NextResponse.json({ ultimo_numero: ultimo }, { status: 200 });
    }

    if (numero) {
      const result = await client.query(
        'SELECT id FROM tarjetas WHERE numero_tarjeta = $1',
        [numero]
      );
      client.release();
      return NextResponse.json({ exists: (result.rowCount ?? 0) > 0 }, { status: 200 });
    }

    const offset = (page - 1) * limit;
    const result = await client.query(
      `
      SELECT t.id, t.numero_tarjeta, t.cliente_id, t.tipo_tarjeta_id, t.created_at, 
             c.nombre AS cliente_nombre, tt.tipo_tarjeta AS tipo_tarjeta_nombre,
             c.canal_id, can.codigo_canal
      FROM tarjetas t
      JOIN clientes c ON t.cliente_id = c.id
      JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      JOIN canales can ON c.canal_id = can.id
      WHERE t.numero_tarjeta ILIKE $1 OR c.nombre ILIKE $1 OR tt.tipo_tarjeta ILIKE $1
      ORDER BY t.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM tarjetas t
      JOIN clientes c ON t.cliente_id = c.id
      JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      JOIN canales can ON c.canal_id = can.id
      WHERE t.numero_tarjeta ILIKE $1 OR c.nombre ILIKE $1 OR tt.tipo_tarjeta ILIKE $1
      `,
      [`%${search}%`]
    );

    const total = parseInt(totalResult.rows[0].total, 10);

    client.release();
    return NextResponse.json(
      {
        tarjetas: result.rows,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    client.release();
    console.error('Error al obtener las tarjetas:', error);
    return NextResponse.json({ message: 'Error al obtener las tarjetas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const numero_tarjeta = formData.get('numero_tarjeta')?.toString();
    const cliente_id = formData.get('cliente_id')?.toString();
    const tipo_tarjeta_id = formData.get('tipo_tarjeta_id')?.toString();

    if (!numero_tarjeta || !cliente_id || !tipo_tarjeta_id) {
      return NextResponse.json(
        { message: 'Número de tarjeta, cliente y tipo de tarjeta son obligatorios' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(numero_tarjeta)) {
      return NextResponse.json(
        { message: 'El número de tarjeta debe tener 8 dígitos' },
        { status: 400 }
      );
    }

    const numero_correlativo = numero_tarjeta.slice(-4);

    const client = await pool.connect();

    const clienteCheck = await client.query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
    if ((clienteCheck.rowCount ?? 0) === 0) {
      client.release();
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 400 });
    }

    const tipoTarjetaCheck = await client.query(
      'SELECT id FROM tipos_tarjetas WHERE id = $1',
      [tipo_tarjeta_id]
    );
    if ((tipoTarjetaCheck.rowCount ?? 0) === 0) {
      client.release();
      return NextResponse.json({ message: 'Tipo de tarjeta no encontrado' }, { status: 400 });
    }

    const numeroCheck = await client.query(
      'SELECT id FROM tarjetas WHERE numero_tarjeta = $1',
      [numero_tarjeta]
    );
    if ((numeroCheck.rowCount ?? 0) > 0) {
      client.release();
      return NextResponse.json({ message: 'El número de tarjeta ya existe' }, { status: 400 });
    }

    const result = await client.query(
      `
      INSERT INTO tarjetas (numero_tarjeta, numero_correlativo, cliente_id, tipo_tarjeta_id, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING id, numero_tarjeta, cliente_id, tipo_tarjeta_id, created_at,
                (SELECT nombre FROM clientes WHERE id = $3) as cliente_nombre,
                (SELECT tipo_tarjeta FROM tipos_tarjetas WHERE id = $4) as tipo_tarjeta_nombre,
                (SELECT canal_id FROM clientes WHERE id = $3) as canal_id,
                (SELECT codigo_canal FROM canales WHERE id = (SELECT canal_id FROM clientes WHERE id = $3)) as codigo_canal
      `,
      [numero_tarjeta, numero_correlativo, cliente_id, tipo_tarjeta_id]
    );

    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al guardar la tarjeta:', error);
    return NextResponse.json({ message: 'Error al crear la tarjeta' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    const numero_tarjeta = formData.get('numero_tarjeta')?.toString();
    const cliente_id = formData.get('cliente_id')?.toString();
    const tipo_tarjeta_id = formData.get('tipo_tarjeta_id')?.toString();

    if (!id || !numero_tarjeta || !cliente_id || !tipo_tarjeta_id) {
      return NextResponse.json(
        { message: 'ID, número de tarjeta, cliente y tipo de tarjeta son obligatorios' },
        { status: 400 }
      );
    }

    if (!/^\d{8}$/.test(numero_tarjeta)) {
      return NextResponse.json(
        { message: 'El número de tarjeta debe tener 8 dígitos' },
        { status: 400 }
      );
    }

    const numero_correlativo = numero_tarjeta.slice(-4);

    const client = await pool.connect();

    const clienteCheck = await client.query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
    if ((clienteCheck.rowCount ?? 0) === 0) {
      client.release();
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 400 });
    }

    const tipoTarjetaCheck = await client.query(
      'SELECT id FROM tipos_tarjetas WHERE id = $1',
      [tipo_tarjeta_id]
    );
    if ((tipoTarjetaCheck.rowCount ?? 0) === 0) {
      client.release();
      return NextResponse.json({ message: 'Tipo de tarjeta no encontrado' }, { status: 400 });
    }

    const numeroCheck = await client.query(
      'SELECT id FROM tarjetas WHERE numero_tarjeta = $1 AND id != $2',
      [numero_tarjeta, id]
    );
    if ((numeroCheck.rowCount ?? 0) > 0) {
      client.release();
      return NextResponse.json({ message: 'El número de tarjeta ya existe' }, { status: 400 });
    }

    const result = await client.query(
      `
      UPDATE tarjetas 
      SET numero_tarjeta = $1, numero_correlativo = $2, cliente_id = $3, tipo_tarjeta_id = $4
      WHERE id = $5
      RETURNING id, numero_tarjeta, cliente_id, tipo_tarjeta_id, created_at,
                (SELECT nombre FROM clientes WHERE id = $3) as cliente_nombre,
                (SELECT tipo_tarjeta FROM tipos_tarjetas WHERE id = $4) as tipo_tarjeta_nombre,
                (SELECT canal_id FROM clientes WHERE id = $3) as canal_id,
                (SELECT codigo_canal FROM canales WHERE id = (SELECT canal_id FROM clientes WHERE id = $3)) as codigo_canal
      `,
      [numero_tarjeta, numero_correlativo, cliente_id, tipo_tarjeta_id, id]
    );

    client.release();

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la tarjeta:', error);
    return NextResponse.json({ message: 'Error al actualizar la tarjeta' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'ID de la tarjeta es obligatorio' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query('DELETE FROM tarjetas WHERE id = $1 RETURNING id', [id]);

    client.release();

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tarjeta eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la tarjeta:', error);
    return NextResponse.json({ message: 'Error al eliminar la tarjeta' }, { status: 500 });
  }
}