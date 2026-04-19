import { Router } from 'express'
import {
  obtenerProyecto,
  crearProyecto,
  eliminarProyecto
} from '../controllers/proyectosController'

const router: Router = Router()

router.get('/:id',    obtenerProyecto)
router.post('/',      crearProyecto)
router.delete('/:id', eliminarProyecto)

export default router