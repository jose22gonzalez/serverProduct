const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')

const app = express()
const port = 5000;

app.use(bodyParser.json())

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Jose1820*',
  database: 'ProduvtDB',
  port: 3306
}

const pool = mysql.createPool(dbConfig)

app.post('/checkout', async (req, res) => {
  const { date, total, items } = req.body

  let connection
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()

    const [orderResult] = await connection.query('INSERT INTO Ordenes (Fecha, Total) VALUES (?, ?)', [date, total])
    const orderId = orderResult.insertId

    const detailQuery = 'INSERT INTO DetalleOrdenes (IDOrden, CodigoItem, Cantidad, Precio) VALUES (?, ?, ?, ?)'
    for (const item of items) {
      await connection.query(detailQuery, [orderId, item.code, item.quantity, item.price])
    }

    await connection.commit();
    res.status(200).send('Orden guardada exitosamente')

  } catch (err) {

    if (connection) await connection.rollback()
    console.error('Error al guardar la orden:', err)
    res.status(500).send('Error al guardar la orden')
  } finally {
    if (connection) connection.release();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});
