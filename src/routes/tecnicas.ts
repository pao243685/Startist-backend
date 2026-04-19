import { Router } from 'express'
import {
  obtenerTecnica,
  listarTarjetasPorTecnica
} from '../controllers/tecnicasController'
import { obtenerGaleria } from '../controllers/galeriaController'

const router: Router = Router()

router.get('/:id',          obtenerTecnica)
router.get('/:id/tarjetas', listarTarjetasPorTecnica)
router.get('/:id/galeria',  obtenerGaleria)

export default router