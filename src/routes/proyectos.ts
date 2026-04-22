import { Router } from 'express'
import {
  obtenerProyecto,
  crearProyecto,
  eliminarProyecto
} from '../controllers/proyectosController'
import { upload } from '../middlewares/upload'

const router: Router = Router()

router.get('/:id',    obtenerProyecto)
router.post('/',      upload.single('archivo'), crearProyecto) 
router.delete('/:id', eliminarProyecto)

export default router