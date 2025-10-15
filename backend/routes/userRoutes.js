import express from "express";
import { UserController as ClassController } from "../controllers/userController.class.js";
import multer from "multer";
const upload = multer({ dest: "frontend/public/uploads" });
const app = express();

// On rend les fichiers statiques accessibles via /uploads
app.use("/uploads", express.static("frontend/public/uploads"));

// dossier où les fichiers seront stockés
const router = express.Router();

//router.get('/', ClassController.listUsers); // GET /users -> liste des utilisateurs
//router.get('/:id', ClassController.getUser); // GET /users/:id -> détails d’un utilisateur // old

// user \\
router.get("/search", (req, res) => ClassController.get(req, res)); // GET /users/search?email=... -> recherche un utilisateur par email
//router.get('/user', (req, res) => ClassController.getUser0(req, res));

router.post("/search", ClassController.get); // POST /users/search -> recherche un utilisateur par email (ex: pour formulaire avec body) // deprecated \\

router.get("/update", (req, res) => ClassController.update(req, res));
router.put("/", (req, res) => ClassController.update(req, res));
// PUT /api/user/file -> met à jour l'utilisateur + upload fichier
router.put("/file", upload.single("file"), (req, res) =>
  ClassController.updateWithFile(req, res)
);

router.get("/create", (req, res) => ClassController.create(req, res)); // http://localhost/api/user/create?p:email=hugo.test@gmail.com&password=ttt222&last_name=ln&first_name=fn
router.post("/", (req, res) => ClassController.create(req, res)); // POST /users -> créer un utilisateur

router.get("/delete", (req, res) => ClassController.delete(req, res));
router.delete("/", (req, res) => ClassController.delete(req, res));

// just for test \\
router.get("/testreou", ClassController.getnumber);

// authentication \\
router.get("/auth", (req, res) => ClassController.auth(req, res)); // authentification principale \\

// Obligatoire : export par défaut pour le lazy loader \\
export default router;
