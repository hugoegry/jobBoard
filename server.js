import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import chalk from "chalk";
import './backend/globals.js';

// Gestion des variables d'environnement
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 80;
const SECURITE_MODE = process.env.SECURITE_MODE || false;

// Gestion des chemins (ESM compatibilité)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedModules = ['user', 'auth', 'offer', 'company', 'application', 'companyMember'];
const preloadedModules = ['user', 'auth', 'offer', 'company', 'application', 'companyMember'];
const routersCache = {};

//  Préchargement au démarrage \\ 
for (const moduleName of preloadedModules) {
  if (allowedModules.includes(moduleName) || !SECURITE_MODE) {
    import(`./backend/routes/${moduleName}Routes.js`).then((module) => {
      routersCache[moduleName] = module.default;
      console.log(chalk.cyanBright('Preloaded module:') + ' ' + chalk.green(moduleName));
    }).catch((err) => {
      console.error(chalk.redBright.bold(`Error preloading module ${moduleName}:`) + ' ' + chalk.red(err.message));
    });
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-def',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 20, // 20 min
    httpOnly: true,
    sameSite: 'Strict',
    secure: false // pour HTTPS
  }
}));


app.use("/api/:module", async (req, res, next) => {
  const moduleName = req.params.module;
  if (!allowedModules.includes(moduleName) && SECURITE_MODE) {
    return res.status(404).json({ error: "Module API non trouvé" });
  }

  if (!routersCache[moduleName]) {
    try {
      const routeModule = await import(`./backend/routes/${moduleName}Routes.js`);
      routersCache[moduleName] = routeModule.default; // stocke le Router
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur serveur route not found" });
    }
  }
  return routersCache[moduleName](req, res, next); // Passe la requête au router stocké
});


// Fallback vers le frontend
app.use(express.static(path.join(__dirname, "frontend/public")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend/public", "index.html"));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));