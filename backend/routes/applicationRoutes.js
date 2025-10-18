import express from 'express';
import { ApplicationController as ClassController } from '../controllers/applicationController.class.js';

const router = express.Router();

router.get('/', (req, res) => ClassController.get(req, res));
router.get('/search', (req, res) => ClassController.get(req, res));

router.get('/update', (req, res) => ClassController.update(req, res));
router.put('/', (req, res) => ClassController.update(req, res));

router.get('/create', (req, res) => ClassController.create(req, res)); // http://localhost/api/user/create?p:email=hugo.test@gmail.com&password=ttt222&last_name=ln&first_name=fn
router.post('/', (req, res) => ClassController.create(req, res));

router.get('/delete', (req, res) => ClassController.delete(req, res));
router.delete('/', (req, res) => ClassController.delete(req, res));

export default router;