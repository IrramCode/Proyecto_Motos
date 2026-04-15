const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAR POSTGRES
const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'euro_motors',
    password: process.env.PGPASSWORD || 'cisco',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
});

// Verificar conexión a la base de datos al iniciar
async function verificarConexion() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Postgres conectado, hora del servidor:', res.rows[0].now);
    } catch (err) {
        console.error('Error conectando a Postgres:', err.message || err);
        console.error('Verifica que PostgreSQL esté en ejecución y que las credenciales/DB sean correctas.');
    }
}

verificarConexion();

// RUTAS CRUD (con manejo de errores)
app.get('/motos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM motos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /motos error:', err.message || err);
        res.status(500).json({ error: 'Error al obtener motos' });
    }
});

app.post('/motos', async (req, res) => {
    const { marca, modelo, precio } = req.body;
    try {
        await pool.query(
            'INSERT INTO motos (marca, modelo, precio) VALUES ($1, $2, $3)',
            [marca, modelo, precio]
        );
        res.json({ message: "Moto agregada" });
    } catch (err) {
        console.error('POST /motos error:', err.message || err);
        res.status(500).json({ error: 'Error al agregar la moto' });
    }
});

app.put('/motos/:id', async (req, res) => {
    const { id } = req.params;
    const { marca, modelo, precio } = req.body;
    try {
        await pool.query(
            'UPDATE motos SET marca=$1, modelo=$2, precio=$3 WHERE id=$4',
            [marca, modelo, precio, id]
        );
        res.json({ message: "Moto actualizada" });
    } catch (err) {
        console.error('PUT /motos/:id error:', err.message || err);
        res.status(500).json({ error: 'Error al actualizar la moto' });
    }
});

app.delete('/motos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM motos WHERE id=$1', [req.params.id]);
        res.json({ message: "Moto eliminada" });
    } catch (err) {
        console.error('DELETE /motos/:id error:', err.message || err);
        res.status(500).json({ error: 'Error al eliminar la moto' });
    }
});

// RUTAS CARRITO
app.get('/carrito', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM carrito ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /carrito error:', err.message || err);
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
});

app.post('/carrito', async (req, res) => {
    const { marca, modelo, precio } = req.body;
    try {
        await pool.query(
            'INSERT INTO carrito (marca, modelo, precio) VALUES ($1, $2, $3)',
            [marca, modelo, precio]
        );
        res.json({ message: "Item agregado al carrito" });
    } catch (err) {
        console.error('POST /carrito error:', err.message || err);
        res.status(500).json({ error: 'Error al agregar item al carrito' });
    }
});

app.delete('/carrito/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM carrito WHERE id=$1', [req.params.id]);
        res.json({ message: "Item eliminado del carrito" });
    } catch (err) {
        console.error('DELETE /carrito/:id error:', err.message || err);
        res.status(500).json({ error: 'Error al eliminar item del carrito' });
    }
});

// RUTA COMPRAS
app.post('/compras', async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No hay motos para comprar' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const item of items) {
            const { marca, modelo, precio } = item;
            await client.query(
                'INSERT INTO compras (marca, modelo, precio) VALUES ($1, $2, $3)',
                [marca, modelo, precio]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Compra registrada' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('POST /compras error:', err.message || err);
        res.status(500).json({ error: 'Error al registrar compra' });
    } finally {
        client.release();
    }
});

// INICIAR SERVIDOR
app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});