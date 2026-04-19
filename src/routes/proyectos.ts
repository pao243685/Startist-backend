import { Router } from 'express'
import {
  listarProyectos,
  obtenerProyecto,
  crearProyecto,
  editarProyecto,
  eliminarProyecto
} from '../controllers/proyectosController'

const router: Router = Router()

router.get('/',       listarProyectos)
router.get('/:id',    obtenerProyecto)
router.post('/',      crearProyecto)
router.patch('/:id',  editarProyecto)
router.delete('/:id', eliminarProyecto)

export default router