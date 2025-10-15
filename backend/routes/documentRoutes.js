import express from "express";
import { DocumentController as ClassController } from "../controllers/documentController.class.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  // Le dossier uploads est dans backend/uploads
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", (req, res) => ClassController.get(req, res));
router.get("/search", (req, res) => ClassController.get(req, res));

router.get("/update", (req, res) => ClassController.update(req, res));
router.put("/", (req, res) => ClassController.update(req, res));

router.get("/create", (req, res) => ClassController.create(req, res)); // http://localhost/api/user/create?p:email=hugo.test@gmail.com&password=ttt222&last_name=ln&first_name=fn
// router.post("/", (req, res) => ClassController.create(req, res)); // POST /users -> créer un utilisateur
router.post("/", upload.single("file"), ClassController.createWithFiles);

router.get("/delete", (req, res) => ClassController.delete(req, res));
router.delete("/", (req, res) => ClassController.delete(req, res));

export default router;
