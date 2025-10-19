import express from 'express';
import { DocumentSelectedController as ClassController } from '../controllers/documentSelectedController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();
const resource = 'document_selected';

router.get('/', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));
router.get('/search', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));

//router.get('/update', checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res)); // juste pour test via navigateur
router.put('/', checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res));

//router.get('/create', checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res));// juste pour test via navigateur
router.post('/', checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res));

//router.get('/delete', checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res)); // juste pour test via navigateur
router.delete('/', checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res));

export default router;