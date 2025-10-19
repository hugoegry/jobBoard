import express from "express";
import { DocumentController as ClassController } from "../controllers/documentController.class.js";
import { checkPermission } from '../middlewares/checkPermission.js';
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const resource = 'document';

const storage = multer.diskStorage({
  // Le dossier uploads est dans backend/uploads
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/", checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));
router.get("/search", checkPermission(resource, 'select'), (req, res) => ClassController.get(req, res));

//router.get("/update", checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res)); // juste pour test via navigateur
router.put("/", checkPermission(resource, 'update'), (req, res) => ClassController.update(req, res));

//router.get("/create", checkPermission(resource, 'create'), (req, res) => ClassController.create(req, res)); // juste pour test via navigateur
router.post("/", upload.single("file"), ClassController.createWithFiles);

//router.get("/delete", checkPermission(resource, 'delete'), (req, res) => ClassController.delete(req, res)); // juste pour test via navigateur
// router.delete("/", (req, res) => ClassController.delete(req, res));
router.delete("/:id", (req, res) => ClassController.deleteDocument(req, res));

export default router;
