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
      SELECT t.id, t.numero_tarjeta, t.cliente_id, t.vehiculo_id, t.tipo_tarjeta_id, t.created_at, 
             COALESCE(c.nombre, '') AS cliente_nombre, 
             COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') AS vehiculo_nombre,
             tt.tipo_tarjeta AS tipo_tarjeta_nombre,
             COALESCE(c.canal_id, 0) AS canal_id, 
             COALESCE(can.codigo_canal, '') AS codigo_canal
      FROM tarjetas t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN vehiculos v ON t.vehiculo_id = v.id
      JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      LEFT JOIN canales can ON c.canal_id = can.id
      WHERE t.numero_tarjeta ILIKE $1 
         OR COALESCE(c.nombre, '') ILIKE $1 
         OR COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') ILIKE $1 
         OR tt.tipo_tarjeta ILIKE $1
      ORDER BY t.id
      LIMIT $2 OFFSET $3
      `,
      [`%${search}%`, limit, offset]
    );

    const totalResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM tarjetas t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN vehiculos v ON t.vehiculo_id = v.id
      JOIN tipos_tarjetas tt ON t.tipo_tarjeta_id = tt.id
      LEFT JOIN canales can ON c.canal_id = can.id
      WHERE t.numero_tarjeta ILIKE $1 
         OR COALESCE(c.nombre, '') ILIKE $1 
         OR COALESCE(v.marca || ' ' || v.modelo || ' - ' || v.placa, '') ILIKE $1 
         OR tt.tipo_tarjeta ILIKE $1
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
    const vehiculo_id = formData.get('vehiculo_id')?.toString();
    const tipo_tarjeta_id = formData.get('tipo_tarjeta_id')?.toString();
    const canal_id = formData.get('canal_id')?.toString();
    const subcanal_id = formData.get('subcanal_id')?.toString();

    // Validar campos obligatorios y tipos
    if (!numero_tarjeta || !tipo_tarjeta_id) {
      return NextResponse.json(
        { message: 'Número de tarjeta y tipo de tarjeta son obligatorios' },
        { status: 400 }
      );
    }

    // Validar que exactamente uno de cliente_id o vehiculo_id esté presente
    if (!cliente_id && !vehiculo_id) {
      return NextResponse.json(
        { message: 'Debe proporcionar un cliente_id o un vehiculo_id' },
        { status: 400 }
      );
    }
    if (cliente_id && vehiculo_id) {
      return NextResponse.json(
        { message: 'No puede proporcionar ambos: cliente_id y vehiculo_id' },
        { status: 400 }
      );
    }

    // Validar canal_id y subcanal_id si se proporciona vehiculo_id
    if (vehiculo_id && (!canal_id || !subcanal_id)) {
      return NextResponse.json(
        { message: 'Canal y subcanal son obligatorios para tarjetas de flota' },
        { status: 400 }
      );
    }

    // Validar formato de número de tarjeta
    if (!/^\d{4}$/.test(numero_tarjeta)) {
      return NextResponse.json(
        { message: 'El número de tarjeta debe tener 4 dígitos' },
        { status: 400 }
      );
    }

    const numero_correlativo = numero_tarjeta.slice(-4);

    const client = await pool.connect();

    // Verificar existencia de cliente_id si se proporciona
    if (cliente_id) {
      const clienteCheck = await client.query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
      if ((clienteCheck.rowCount ?? 0) === 0) {
        client.release();
        return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 400 });
      }
    }

    // Verificar existencia de vehiculo_id si se proporciona
    if (vehiculo_id) {
      const vehiculoCheck = await client.query('SELECT id FROM vehiculos WHERE id = $1', [vehiculo_id]);
      if ((vehiculoCheck.rowCount ?? 0) === 0) {
        client.release();
        return NextResponse.json({ message: 'Vehículo no encontrado' }, { status: 400 });
      }
    }

    // Verificar existencia de tipo_tarjeta_id
    const tipoTarjetaCheck = await client.query(
      'SELECT id FROM tipos_tarjetas WHERE id = $1',
      [tipo_tarjeta_id]
    );
    if ((tipoTarjetaCheck.rowCount ?? 0) === 0) {
      client.release();
      return NextResponse.json({ message: 'Tipo de tarjeta no encontrado' }, { status: 400 });
    }


    // Verificar que el número de tarjeta no exista
    const numeroCheck = await client.query(
      'SELECT id FROM tarjetas WHERE numero_tarjeta = $1',
      [numero_tarjeta]
    );
    if ((numeroCheck.rowCount ?? 0) > 0) {
      client.release();
      return NextResponse.json({ message: 'El número de tarjeta ya existe' }, { status: 400 });
    }

    // Insertar la tarjeta
    const result = await client.query(
      `
      INSERT INTO tarjetas (numero_tarjeta, numero_correlativo, cliente_id, vehiculo_id, tipo_tarjeta_id, canal_id, subcanal_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
      RETURNING id, numero_tarjeta, cliente_id, vehiculo_id, tipo_tarjeta_id, canal_id, subcanal_id, created_at,
                (SELECT nombre FROM clientes WHERE id = $3) AS cliente_nombre,
                (SELECT marca || ' ' || modelo || ' - ' || placa FROM vehiculos WHERE id = $4) AS vehiculo_nombre,
                (SELECT tipo_tarjeta FROM tipos_tarjetas WHERE id = $5) AS tipo_tarjeta_nombre,
                (SELECT codigo_canal FROM canales WHERE id = $6) AS codigo_canal,
                (SELECT subcanal FROM subcanales WHERE id = $7) AS subcanal_nombre
      `,
      [numero_tarjeta, numero_correlativo, cliente_id || null, vehiculo_id || null, tipo_tarjeta_id, canal_id || null, subcanal_id || null]
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
    const vehiculo_id = formData.get('vehiculo_id')?.toString();
    const tipo_tarjeta_id = formData.get('tipo_tarjeta_id')?.toString();
    const canal_id = formData.get('canal_id')?.toString();
    const subcanal_id = formData.get('subcanal_id')?.toString();

    // Validar campos obligatorios
    if (!id || !numero_tarjeta || !tipo_tarjeta_id) {
      return NextResponse.json(
        { message: 'ID, número de tarjeta y tipo de tarjeta son obligatorios' },
        { status: 400 }
      );
    }

    // Validar que exactamente uno de cliente_id o vehiculo_id esté presente
    if (!cliente_id && !vehiculo_id) {
      return NextResponse.json(
        { message: 'Debe proporcionar un cliente_id o un vehiculo_id' },
        { status: 400 }
      );
    }
    if (cliente_id && vehiculo_id) {
      return NextResponse.json(
        { message: 'No puede proporcionar ambos: cliente_id y vehiculo_id' },
        { status: 400 }
      );
    }

    // Validar canal_id y subcanal_id si se proporciona vehiculo_id
    if (vehiculo_id && (!canal_id || !subcanal_id)) {
      return NextResponse.json(
        { message: 'Canal y subcanal son obligatorios para tarjetas de flota' },
        { status: 400 }
      );
    }

    // Validar formato de número de tarjeta
    if (!/^\d{4}$/.test(numero_tarjeta)) {
      return NextResponse.json(
        { message: 'El número de tarjeta debe tener 4 dígitos' },
        { status: 400 }
      );
    }

    const numero_correlativo = numero_tarjeta.slice(-4);

    const client = await pool.connect();

    // Verificar existencia de cliente_id si se proporciona
    if (cliente_id) {
      const clienteCheck = await client.query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
      if ((clienteCheck.rowCount ?? 0) === 0) {
        client.release();
        return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 400 });
      }
    }

    // Verificar existencia de vehiculo_id si se proporciona
    if (vehiculo_id) {
      const vehiculoCheck = await client.query('SELECT id FROM vehiculos WHERE id = $1', [vehiculo_id]);
      if ((vehiculoCheck.rowCount ?? 0) === 0) {
        client.release();
        return NextResponse.json({ message: 'Vehículo no encontrado' }, { status: 400 });
      }
    }

    // Verificar existencia de tipo_tarjeta_id
    const tipoTarjetaCheck = await client.query(
      'SELECT id FROM tipos_tarjetas WHERE id = $1',
      [tipo_tarjeta_id]
    );
    if ((tipoTarjetaCheck.rowCount ?? 0) === 0) {
      client.release();
      return NextResponse.json({ message: 'Tipo de tarjeta no encontrado' }, { status: 400 });
    }

    // Verificar existencia de canal_id si se proporciona
    if (canal_id) {
      const canalCheck = await client.query('SELECT id FROM canales WHERE id = $1', [canal_id]);
      if ((canalCheck.rowCount ?? 0) === 0) {
        client.release();
        return NextResponse.json({ message: 'Canal no encontrado' }, { status: 400 });
      }
    }

    // Verificar existencia de subcanal_id si se proporciona
    if (subcanal_id) {
      const subcanalCheck = await client.query('SELECT id FROM subcanales WHERE id = $1 AND canal_id = $2', [subcanal_id, canal_id]);
      if ((subcanalCheck.rowCount ?? 0) === 0) {
        client.release();
        return NextResponse.json({ message: 'Subcanal no encontrado o no pertenece al canal especificado' }, { status: 400 });
      }
    }

    // Verificar que el número de tarjeta no exista para otra tarjeta
    const numeroCheck = await client.query(
      'SELECT id FROM tarjetas WHERE numero_tarjeta = $1 AND id != $2',
      [numero_tarjeta, id]
    );
    if ((numeroCheck.rowCount ?? 0) > 0) {
      client.release();
      return NextResponse.json({ message: 'El número de tarjeta ya existe' }, { status: 400 });
    }

    // Actualizar la tarjeta
    const result = await client.query(
      `
      UPDATE tarjetas 
      SET numero_tarjeta = $1, numero_correlativo = $2, cliente_id = $3, vehiculo_id = $4, tipo_tarjeta_id = $5, canal_id = $6, subcanal_id = $7
      WHERE id = $8
      RETURNING id, numero_tarjeta, cliente_id, vehiculo_id, tipo_tarjeta_id, canal_id, subcanal_id, created_at,
                (SELECT nombre FROM clientes WHERE id = $3) AS cliente_nombre,
                (SELECT marca || ' ' || modelo || ' - ' || placa FROM vehiculos WHERE id = $4) AS vehiculo_nombre,
                (SELECT tipo_tarjeta FROM tipos_tarjetas WHERE id = $5) AS tipo_tarjeta_nombre,
                (SELECT codigo_canal FROM canales WHERE id = $6) AS codigo_canal,
                (SELECT nombre FROM subcanales WHERE id = $7) AS subcanal_nombre
      `,
      [numero_tarjeta, numero_correlativo, cliente_id || null, vehiculo_id || null, tipo_tarjeta_id, canal_id || null, subcanal_id || null, id]
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