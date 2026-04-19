import 'dotenv/config'
import express, { Application, Request, Response, RequestHandler } from 'express'
import { verificarToken } from './middlewares/auth'

import tecnicasRouter  from './routes/tecnicas'
import tarjetasRouter  from './routes/tarjetas'
import proyectosRouter from './routes/proyectos'
import artistasRouter  from './routes/artistas'
import authRouter      from './routes/auth'

const app: Application = express()

app.use(express.json())

app.use('/api/v1/auth',     authRouter)
app.use('/api/v1/tecnicas', tecnicasRouter)
app.use('/api/v1/tarjetas', tarjetasRouter)

app.use('/api/v1/proyectos', verificarToken as unknown as RequestHandler, proyectosRouter)
app.use('/api/v1/artistas',  verificarToken as unknown as RequestHandler, artistasRouter)

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'Startist API corriendo' })
})

export default app