import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Gestion des route \\
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 80;


// Gestion des chemins (ESM compatibilité)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use((req, res, next) => { // index principal 
  if (req.path.startsWith("/api")) {// Si la route commence par /api → on traite
    next(); //
  } else {
    res.sendFile(path.join(__dirname, "frontend/public", "index.html"));
  }
});





// // Servir le frontend build
// app.use(express.static(path.join(__dirname, "public")));

// // Route API de test
// app.get("/api/hello", (req, res) => {
//   res.json({ message: "Hello from backend!" });
// });

// // Toutes les autres routes → frontend React
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend/public", "index.html"));
// });

// app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));