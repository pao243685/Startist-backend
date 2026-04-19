import { Router } from 'express'
import {
  listarArtistas,
  obtenerArtista,
  editarArtista,
  listarProyectosDeArtista
} from '../controllers/artistasController'

const router: Router = Router()

router.get('/',                  listarArtistas)
router.get('/:id',               obtenerArtista)
router.patch('/:id',             editarArtista)
router.get('/:id/proyectos',     listarProyectosDeArtista)

export default router