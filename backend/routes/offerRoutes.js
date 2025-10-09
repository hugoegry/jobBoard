import express from 'express';
import { OfferController } from '../controllers/offerController.js';

const router = express.Router();

//router.get('/', UserController.listUsers); // GET /users -> liste des utilisateurs
//router.get('/:id', UserController.getUser); // GET /users/:id -> détails d’un utilisateur // old

// user \\
router.get('/search', (req, res) => OfferController.getOffer(req, res)); // GET /users/search?email=... -> recherche un utilisateur par email

router.post('/search', OfferController.getOffer); // POST /users/search -> recherche un utilisateur par email (ex: pour formulaire avec body) // deprecated \\



export default router;