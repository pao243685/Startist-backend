import { Router } from 'express'
import {
  listarTarjetas,
  obtenerTarjeta,
  crearTarjeta,
  editarTarjeta,
  eliminarTarjeta
} from '../controllers/tarjetasController'

const router: Router = Router()

router.get('/',      listarTarjetas)
router.get('/:id',   obtenerTarjeta)
router.post('/',     crearTarjeta)
router.patch('/:id', editarTarjeta)
router.delete('/:id', eliminarTarjeta)

export default router