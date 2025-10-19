import express from 'express';
import { CompanyController as ClassController } from '../controllers/companyController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();
const resource = 'company';

router.get('/', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));
router.get('/search', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));

router.put('/', checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res));

router.post('/', checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res));

router.delete('/', checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res));

export default router;