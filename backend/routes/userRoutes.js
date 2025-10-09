import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

//router.get('/', UserController.listUsers); // GET /users -> liste des utilisateurs
//router.get('/:id', UserController.getUser); // GET /users/:id -> détails d’un utilisateur // old

// user \\
router.get('/search', (req, res) => UserController.getUser(req, res)); // GET /users/search?email=... -> recherche un utilisateur par email
//router.get('/user', (req, res) => MyController.getUser0(req, res));

router.post('/search', UserController.getUser); // POST /users/search -> recherche un utilisateur par email (ex: pour formulaire avec body) // deprecated \\

router.get('/update', (req, res) => UserController.updateUser(req, res));
router.put('/', (req, res) => UserController.updateUser(req, res));


router.post('/', UserController.createUser); // POST /users -> créer un utilisateur


router.put('/:id', UserController.updateUser); // PUT /users/:id -> mettre à jour un utilisateur

router.delete('/:id', UserController.deleteUser); // DELETE /users/:id -> supprimer un utilisateur


// just for test \\
router.get('/testreou', UserController.getnumber);

router.get('/testreou2', UserController.getjob);

// authentication \\
router.get('/auth', UserController.auth); // authentification principale \\

// Obligatoire : export par défaut pour le lazy loader
export default router;


// http://localhost:4000/users

// nom // poste // type de contrat 