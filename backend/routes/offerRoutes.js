import express from 'express';
import { OfferController as ClassController } from '../controllers/offerController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();

router.get('/', checkPermission('offer', 'select'), (req, res) => ClassController.get(req, res));
router.get('/search', checkPermission('offer', 'select'), (req, res) => ClassController.get(req, res));

router.get('/count', checkPermission('offer', 'select'), (req, res) => ClassController.count(req, res));

router.get('/update', checkPermission('offer', 'update'), (req, res) => ClassController.update(req, res));
router.put('/', checkPermission('offer', 'update'), (req, res) => ClassController.update(req, res));

router.get('/create', checkPermission('offer', 'create'), (req, res) => ClassController.create(req, res));
router.post('/', checkPermission('offer', 'create'), (req, res) => ClassController.create(req, res));

router.get('/delete', checkPermission('offer', 'delete'), (req, res) => ClassController.delete(req, res));
router.delete('/', checkPermission('offer', 'delete'), (req, res) => ClassController.delete(req, res));

export default router;