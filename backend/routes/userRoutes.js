import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

// GET /users -> liste des utilisateurs
router.get('/', UserController.listUsers);

// GET /users/:id -> détails d’un utilisateur
//router.get('/:id', UserController.getUser); // old

// GET /users/search?email=... -> recherche un utilisateur par email
router.get('/search', UserController.getUser);

router.get('/auth', UserController.auth); // authentification principale \\

router.get('/testreou', UserController.getnumber);

router.get('/testreou2', UserController.getjob);
// POST /users/search -> recherche un utilisateur par email (ex: pour formulaire avec body)
router.post('/search', UserController.getUser); // deprecated

// POST /users -> créer un utilisateur
router.post('/', UserController.createUser);

// PUT /users/:id -> mettre à jour un utilisateur
router.put('/:id', UserController.updateUser);

// DELETE /users/:id -> supprimer un utilisateur
router.delete('/:id', UserController.deleteUser);

// Obligatoire : export par défaut pour le lazy loader
export default router;


// http://localhost:4000/users

// nom // poste // type de contrat 