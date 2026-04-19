import { Router } from 'express'
import { obtenerTarjeta } from '../controllers/tarjetasController'

const router: Router = Router()

router.get('/:id', obtenerTarjeta)

export default router