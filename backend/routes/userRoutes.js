import express from 'express';
import { UserController as ClassController } from '../controllers/userController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router(); 

//router.get('/', ClassController.listUsers); // GET /users -> liste des utilisateurs
//router.get('/:id', ClassController.getUser); // GET /users/:id -> détails d’un utilisateur // old

router.get('/', checkPermission('user', 'select'), (req, res) => ClassController.get(req, res));
router.get('/search', checkPermission('user', 'select'), (req, res) => ClassController.get(req, res)); // GET /users/search?email=... -> recherche un utilisateur par email

router.get('/update', checkPermission('user', 'update'), (req, res) => ClassController.update(req, res));
router.put('/', checkPermission('user', 'update'), (req, res) => ClassController.update(req, res));

router.get('/create', checkPermission('user', 'create'), (req, res) => ClassController.create(req, res)); // http://localhost/api/user/create?p:email=hugo.test@gmail.com&password=ttt222&last_name=ln&first_name=fn
router.post('/', checkPermission('user', 'create'), (req, res) => ClassController.create(req, res)); // POST /users -> créer un utilisateur

router.get('/delete', checkPermission('user', 'delete'), (req, res) => ClassController.delete(req, res));
router.delete('/', checkPermission('user', 'delete'), (req, res) => ClassController.delete(req, res));

//router.get('/auth', (req, res) => ClassController.auth(req, res)); // authentification principale \\ // authentication \\

export default router; // Obligatoire : export par défaut pour le lazy loader \\