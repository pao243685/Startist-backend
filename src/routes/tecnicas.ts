import { Router } from 'express'
import {
  listarTecnicas,
  obtenerTecnica,
  listarTarjetasPorTecnica
} from '../controllers/tecnicasController'

const router: Router = Router()

router.get('/',             listarTecnicas)
router.get('/:id',          obtenerTecnica)
router.get('/:id/tarjetas', listarTarjetasPorTecnica)

export default router