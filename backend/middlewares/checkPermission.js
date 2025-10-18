import {AuthController as classAuth} from '../controllers/authController.class.js';


/**
 * Extrait proprement les paramètres pertinents d'une requête Express
 * et isole ceux commençant par "A:"/"a:" (authentification)
 * et "P:"/"p:" (paramètres applicatifs).
 * 
 * @param {import('express').Request} req - L'objet requête Express.
 * @param {import('express').Response} res - L'objet réponse Express.
 * @returns {Object} - { a, p }
 */
const extractParams = (req, res) => {
  const { body, query, params } = req;
  let data = {};

  switch (req.method.toUpperCase()) {
    case 'GET':
      data = query;
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
    default:
      data = (body && Object.keys(body).length) ? body : query;
      break;
  }

  const merged = { ...params, ...data };

  const a = {}; // Authentification
  const p = {}; // Paramètres applicatifs

  for (const [key, value] of Object.entries(merged)) {
    if (/^a:/i.test(key)) {
      a[key.replace(/^a:/i, '')] = value;
    } else if (/^p:/i.test(key)) {
      p[key.replace(/^p:/i, '')] = value;
    }
  }

  return { a, p };
};



const permissionsMatrix = {
  admin: {
    user: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    document: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    company: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}}
  },
  user: {
    user: {create: {restricted:  true, type: 'never'}, update: {restricted: true, type: 'own'}, delete: {restricted:  true, type: 'own'}, select: {restricted:  true, type: 'own'}},
    document: {create: {restricted:  true, type: 'own'}, update: {restricted: true, type: 'own'}, delete: {restricted:  true, type: 'own'}, select: {restricted:  true, type: 'own'}},
    company: {create: {restricted:  true, type: 'never'}, update: {restricted:  true, type: 'societyMembership'}, delete: {restricted:  true, type: 'never'}, select: {restricted:  false, type: 'all'}}
  }
};// societyMembership

function hasPermission(user, resource, action, dynamicParam = null) {
  console.log('Checking permission for user:', user, 'resource:', resource, 'action:', action);
  if (!user || !user.role) return false;
  const perms = permissionsMatrix[user.role];
  if (!perms) return false;
  if (!perms[resource]) return false;
  if (!perms[resource][action]) return false;
  if (perms[resource][action].restricted === false) return true; // si restricted = false alors ok \\
  if (perms[resource][action].restricted === true && perms[resource][action].type === 'all') return true; // all ok \\
  if (perms[resource][action].restricted === true && perms[resource][action].type === 'never') return false; // never always denied \\
  if (perms[resource][action].restricted === true && perms[resource][action].type === 'own') { // own on verifie si c est le proprietaire \\
    let targetId = null; // id dans parametre \\ si il n y en a pas retourne acces refusé \\
    if (!dynamicParam) return false;// && typeof dynamicParam === 'string'
    if (dynamicParam.id_users) targetId = dynamicParam.id_users;
    else if (dynamicParam.users_id) targetId = dynamicParam.users_id;
    else if (dynamicParam.id) targetId = dynamicParam.id;
    if (!targetId) return false;
    console.log('Comparing user id:', user.id, 'with target id:', targetId);
    return user.id === targetId;
  }
  if(perms[resource][action].restricted === true && perms[resource][action].type === 'societyMembership') {
    if (!user.societys && !dynamicParam) return false;
    user.societys.forEach(society => {
      if (society.id === dynamicParam.society_id) return true;
    });

    return false;
  }
  return false;
}

export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const {authParams, params} = extractParams(req, res); // on extrait les params \\
      if (!req.session || !req.session.user) {
        if (!authParams || !authParams || !authParams.token) {
          // la personne n est pas autentifier \\
        } else {
          console.log('Session not existe param detected:', authParams.token);
        }
      }

      const sessionCheckData = await classAuth.checkSession(req.session || null, req.cookies || null);
      console.log('Session check data:', sessionCheckData);
      if (sessionCheckData.valid) req.session.user = sessionCheckData.userSession; // on set la session \\

      const allowed = hasPermission(req.session.user || null, resource, action, params); // MTN IL FAUT BOSSER ICI !!!!!!
      if (!allowed) return res.status(403).json({ error: 'Accès refusé', code: 'ACCES_DENIED', message: 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.' });
      next(); // suivent \\ 
    } catch (err) {
      console.error('Erreur middleware permission:', err);
      res.status(500).json({ error: 'Erreur interne' });
    }
  }; 
};






/* V2 */
/*
// middlewares/checkPermission.js
import jwt from 'jsonwebtoken';
import { getUserById } from '../services/authService.js';
import { hasPermission } from '../services/permissionService.js';

export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // 1. Vérif du token JWT
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token manquant ou invalide' });

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Chargement utilisateur
      const user = await getUserById(decoded.id);
      if (!user)
        return res.status(401).json({ error: 'Utilisateur introuvable' });

      // 3. Vérification des permissions générales
      const allowed = hasPermission(user.role, resource, action);
      if (!allowed)
        return res.status(403).json({ error: 'Accès refusé (rôle insuffisant)' });

      // 4. Gestion de la granularité : accès conditionnel
      // Exemple : si la ressource = "user", on empêche un user de modifier un autre
      if (resource === 'user' && ['update', 'delete'].includes(action)) {
        const targetUserId = req.params.id || req.body.id || req.query.id;

        // Si pas d'id, on laisse passer (par ex : route PUT /user sans cible explicite)
        if (targetUserId && user.role !== 'admin' && user.id !== targetUserId) {
          return res.status(403).json({
            error: 'Accès refusé : vous ne pouvez modifier que vos propres données'
          });
        }
      }

      // 5. Attache l'utilisateur à la requête
      req.user = user;
      next();

    } catch (err) {
      console.error('Erreur middleware permission:', err);
      res.status(500).json({ error: 'Erreur interne middleware' });
    }
  };
};
*/
