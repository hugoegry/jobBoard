import express from 'express';
import { AuthController as ClassController } from '../controllers/authController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();

router.get('/', (req, res) => ClassController.auth(req, res));
router.post('/', (req, res) => ClassController.auth(req, res));

router.get('/auth', (req, res) => ClassController.auth(req, res));
router.post('/auth', (req, res) => ClassController.auth(req, res));
router.post('/logout', (req, res) => ClassController.logout(req, res));

router.get('/handshake', (req, res) => ClassController.handshakeToken(req, res));
router.post('/handshake', (req, res) => ClassController.handshakeToken(req, res));

router.get('/create', (req, res) => ClassController.createAccount(req, res));
router.post('/create', (req, res) => ClassController.createAccount(req, res));

export default router;