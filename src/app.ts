import 'dotenv/config'
import express, { Application, Request, Response } from 'express'
import { verificarToken } from './middlewares/auth'

import tecnicasRouter  from './routes/tecnicas'
import tarjetasRouter  from './routes/tarjetas'
import proyectosRouter from './routes/proyectos'
import artistasRouter  from './routes/artistas'
import authRouter      from './routes/auth'

const app: Application = express()

app.use(express.json())

// Rutas públicas
app.use('/api/v1/auth',     authRouter)
app.use('/api/v1/tecnicas', tecnicasRouter)
app.use('/api/v1/tarjetas', tarjetasRouter)

// Rutas protegidas
app.use('/api/v1/proyectos', verificarToken, proyectosRouter)
app.use('/api/v1/artistas',  verificarToken, artistasRouter)

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'Startist API corriendo 🎨' })
})

export default app