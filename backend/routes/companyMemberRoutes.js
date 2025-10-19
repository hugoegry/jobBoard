import express from 'express';
import { CompanyMemberController as ClassController } from '../controllers/companyMemberController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();
const resource = 'company_member';

router.get('/', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));
router.get('/search', checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));

//router.get('/update', (req, res) => ClassController.update(req, res)); // juste pour test via navigateur
router.put('/', checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res));

//router.get('/create', (req, res) => ClassController.create(req, res)); // juste pour test via navigateur
router.post('/', checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res));

//router.get('/delete', (req, res) => ClassController.delete(req, res)); // juste pour test via navigateur
router.delete('/', checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res));

export default router;