import express from 'express';
import { OfferController as ClassController } from '../controllers/offerController.class.js';
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();

router.get("/", (req, res) => ClassController.get(req, res));
router.get("/search", (req, res) => ClassController.get(req, res));
router.get("/vueEmployeur", (req, res) =>
  ClassController.getSecondView(req, res)
);

router.get('/count', checkPermission('offer', 'select'), (req, res) => ClassController.count(req, res));

//router.get('/update', checkPermission('offer', 'update'), (req, res) => ClassController.update(req, res)); // juste pour test via navigateur
router.put('/', checkPermission('offer', 'update'), (req, res) => ClassController.update(req, res));

//router.get('/create', checkPermission('offer', 'create'), (req, res) => ClassController.create(req, res)); // juste pour test via navigateur
router.post('/', checkPermission('offer', 'create'), (req, res) => ClassController.create(req, res));

//router.get('/delete', checkPermission('offer', 'delete'), (req, res) => ClassController.delete(req, res)); // juste pour test via navigateur
router.delete('/', checkPermission('offer', 'delete'), (req, res) => ClassController.delete(req, res));

export default router;
