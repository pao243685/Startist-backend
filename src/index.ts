import 'dotenv/config'
import app  from './app'
import pool from './db/pool'

const PORT = process.env.PORT ?? 3001

const iniciar = async (): Promise<void> => {
  try {
    await pool.query('SELECT 1')
    console.log('Conectado a la base de datos')
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`)
    })
  } catch (error) {
    console.error('Error al conectar a la DB, reintentando...', (error as Error).message)
    setTimeout(iniciar, 3000)
  }
}

iniciar()