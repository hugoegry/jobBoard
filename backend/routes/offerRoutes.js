import express from 'express';
import { OfferController as ClassController } from '../controllers/offerController.class.js';

const router = express.Router();

router.get('/', (req, res) => ClassController.get(req, res));
router.get('/search', (req, res) => ClassController.get(req, res));

router.get('/count', (req, res) => ClassController.count(req, res));

router.get('/update', (req, res) => ClassController.update(req, res));
router.put('/', (req, res) => ClassController.update(req, res));

router.get('/create', (req, res) => ClassController.create(req, res));
router.post('/', (req, res) => ClassController.create(req, res));

router.get('/delete', (req, res) => ClassController.delete(req, res));
router.delete('/', (req, res) => ClassController.delete(req, res));

export default router;