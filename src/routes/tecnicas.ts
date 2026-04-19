import { Router } from 'express'
import {
  obtenerTecnica,
  listarTarjetasPorTecnica
} from '../controllers/tecnicasController'

const router: Router = Router()

router.get('/:id',          obtenerTecnica)
router.get('/:id/tarjetas', listarTarjetasPorTecnica)

export default router