import { application } from 'express';
import {AuthController as classAuth} from '../controllers/authController.class.js';
const permissionsMatrix = {
  admin: {
    user: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    company: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    offer: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    application: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    company_member: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    company: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    document: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    document_selected: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}}
  },
  user: {
    user: {create: {restricted:  true, type: 'never'}, update: {restricted: true, type: 'own'}, delete: {restricted:  true, type: 'own'}, select: {restricted:  true, type: 'own'}},
    company: {create: {restricted:  true, type: 'never'}, update: {restricted:  true, type: 'societyMembership'}, delete: {restricted:  true, type: 'never'}, select: {restricted:  false, type: 'all'}},
    offer: {create: {restricted:  false, type: 'all'}, update: {restricted:  true, type: 'societyMembership'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    application: {create: {restricted:  false, type: 'all'}, update: {restricted:  true, type: 'societyMembership'}, delete: {restricted:  true, type: 'societyMembership'}, select: {restricted:  false, type: 'all'}},
    company_member: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    company: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    document: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}},
    document_selected: {create: {restricted:  false, type: 'all'}, update: {restricted:  false, type: 'all'}, delete: {restricted:  false, type: 'all'}, select: {restricted:  false, type: 'all'}}
  }
};

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
  const { body, query, paramsReceived } = req;
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

  const merged = { ...paramsReceived, ...data };

  const authParams = {}; // Authentification
  const params = {}; // Paramètres applicatifs

  for (const [key, value] of Object.entries(merged)) {
    if (/^a:/i.test(key)) {
      authParams[key.replace(/^a:/i, '')] = value;
    } else if (/^p:/i.test(key)) {
      params[key.replace(/^p:/i, '')] = value;
    }
  }

  return { authParams, params };
};

function hasPermission(user, resource, action, dynamicParam = null) {
  console.log('Checking permission for user:', user, 'resource:', resource, 'action:', action);
  const userRole = user?.role || 'user';
  console.log('User role determined as:', userRole);
  const rolePerms = permissionsMatrix[userRole];
  if (!rolePerms?.[resource]?.[action]) return false;
  const perm = rolePerms[resource][action];
  if (perm.restricted === false) return true; // si restricted = false alors ok \\
  if (perm.restricted === true && perm.type === 'all') return true; // all ok \\
  if (perm.restricted === true && perm.type === 'never') return false; // never always denied \\
  if (perm.restricted === true && perm.type === 'own') { // own on verifie si c est le proprietaire \\
    if (!user) return false;
    let targetId = null; // id dans parametre \\ si il n y en a pas retourne acces refusé \\
    if (!dynamicParam) return false;
    if (dynamicParam.id_users) targetId = dynamicParam.id_users;
    else if (dynamicParam.users_id) targetId = dynamicParam.users_id;
    else if (dynamicParam.id) targetId = dynamicParam.id;
    if (!targetId) return false;
    return user.user_id === targetId;
  }
  if (perm.restricted === true && perm.type === 'societyMembership') {
    if (!user) return false;
    if (!user.societys || !dynamicParam || !dynamicParam.company_id) return false;
    for (const society of user.societys) {
      if (society.company_id === dynamicParam.company_id) return true;
    }
    return false;
  }
  return false;
}

export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const {authParams, params} = extractParams(req, res); // on extrait les params \\
      const sessionCheckData = await classAuth.checkSession(req.session || null, req.cookies || null);
      console.log('Session check data:', sessionCheckData);
      if (sessionCheckData.valid) req.session.user = sessionCheckData.userSession; // on set la session \\

      const allowed = hasPermission(req.session.user || null, resource, action, params);
      if (!allowed) return res.status(403).json({ error: 'Accès refusé', code: 'ACCES_DENIED', message: 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.' });
      next(); // suivent \\ 
    } catch (err) {
      console.error('Erreur middleware permission:', err);
      res.status(500).json({ error: 'Erreur interne' });
    }
  }; 
};