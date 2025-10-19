import express from 'express';
import { UserController as ClassController } from '../controllers/userController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router(); 
const resource = 'user';

//router.get('/', ClassController.listUsers); // GET /users -> liste des utilisateurs
//router.get('/:id', ClassController.getUser); // GET /users/:id -> détails d’un utilisateur // old

router.get('/', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));
router.get('/search', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res)); // GET /users/search?email=... -> recherche un utilisateur par email

//router.get('/update', checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res)); // juste pour test via navigateur
router.put('/', checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res));

//router.get('/create', checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res)); // http://localhost/api/user/create?p:email=hugo.test@gmail.com&password=ttt222&last_name=ln&first_name=fn // juste pour test via navigateur
router.post('/', checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res)); // POST /users -> créer un utilisateur

//router.get('/delete', checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res)); // juste pour test via navigateur
router.delete('/', checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res));

//router.get('/auth', (req, res) => ClassController.auth(req, res)); // authentification principale \\ // authentication \\

export default router; // Obligatoire : export par défaut pour le lazy loader \\