import { Router } from 'express'
import {
  listarArtistas,
  obtenerArtista,
  crearArtista,
  editarArtista,
  eliminarArtista,
  listarProyectosDeArtista
} from '../controllers/artistasController'

const router: Router = Router()

router.get('/',                  listarArtistas)
router.get('/:id',               obtenerArtista)
router.post('/',                 crearArtista)
router.patch('/:id',             editarArtista)
router.delete('/:id',            eliminarArtista)
router.get('/:id/proyectos',     listarProyectosDeArtista)

export default router