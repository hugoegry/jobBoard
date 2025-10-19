import express from "express";
import { ApplicationController as ClassController } from "../controllers/applicationController.class.js";
import { checkPermission } from '../middlewares/checkPermission.js';

const router = express.Router();

router.get("/", (req, res) => ClassController.get(req, res));
router.get("/search", (req, res) => ClassController.get(req, res));

//router.get("/update", (req, res) => ClassController.update(req, res)); // juste pour test via navigateur
router.put("/", (req, res) => ClassController.update(req, res));

//router.get('/create', (req, res) => ClassController.create(req, res)); // juste pour test via navigateur
router.post('/', (req, res) => ClassController.create(req, res));

//router.get("/delete", (req, res) => ClassController.delete(req, res)); // juste pour test via navigateur
router.delete("/", (req, res) => ClassController.delete(req, res));

export default router;
