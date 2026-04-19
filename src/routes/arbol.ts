import { Router } from 'express'
import { obtenerArbol } from '../controllers/arbolController'
 
const router: Router = Router()
 
router.get('/', obtenerArbol)
 
export default router