import { json } from 'express';
import { UserModel as ClassModel } from '../models/userModel.class.js';
import { CompanyMemberModel as ClassModelSocetyMembers } from '../models/companyMemberModel.class.js';
import { BaseController } from './baseController.class.js';
import { hashPassword, verifyAndRehash } from '../utils/password.utils.js';

export class AuthController extends BaseController {
  static table = 'users';
  static tableColumns = ClassModel.getColumns(this.table);
  static tableSocietyMembership = "company_members";
  static tableSocietyMembershipColumns = ClassModel.getColumns(this.tableSocietyMembership);
  static allowedParams = ['id', 'email', 'first_name', 'last_name'];
  static lockedParams = [];
  static lockedFields = [];



  static async createCookie(res, value, type='tmp') {
    log.log("Creating cookie with value:", value, "and type:", type);
    res.cookie('session_token', value, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: (type === 'const' ? 365 * 24 * 60 * 60 * 1000 : 25 * 60 * 1000),  // 1h // 25min
      path: '/', 
    });
  }

  /**
   * Authentifie un utilisateur avec email et mot de passe, gère les sessions et le "remember me".
   *
   * @async
   * @static
   * @param {string} email - Adresse email de l'utilisateur.
   * @param {string} password - Mot de passe en clair.
   * @param {boolean|string} remember_me - Si true, crée une session persistante.
   * @param {string} [fingerprint=''] - Identifiant unique du navigateur/appareil pour le "remember me".
   *
   * @returns {Promise<{success: boolean, status: number, user?: Object, error?: string}>} 
   * - success: true si l’authentification réussit, sinon false.
   * - status: code HTTP associé.
   * - user: objet utilisateur (sans mot de passe) si succès.
   * - error: message d'erreur si échec.
   *
   * @example
   * const result = await AuthController.authentification('user@example.com', 'password123', true, 'fingerprint123');
   * if(result.success) console.log(result.user.session_token);
   * /api/auth/auth?email=admin@example.com&password=63a2492944bfae7323bcb84ff3ff6d9b78edcbb8077c84d39bc37033b6dbffbd&remenber_me=false
   */
  static async authentification(email, password, remember_me, fingerprint = '') {// req.cookies.session_token
    remember_me = (remember_me === 'true' || remember_me === true); // force le bool
    const users = await ClassModel.findByEmail(email, true);
    if (!users?.length) {
      return { success: false, status: 404, error: 'User not found' };
    }

    const user = users[0];
    let login_metadata = user.login_metadata || {};
    const now = new Date();

    // Vérifie si le compte est temporairement bloqué
    if (login_metadata.lock_until && new Date(login_metadata.lock_until) > now) {
      return { success: false, status: 403, error: 'Account temporarily locked' };
    } else if (login_metadata.lock_until !== null) {
      login_metadata.lock_until = null;
    }

    // Vérifie le mot de passe
    const passwordVerif = await verifyAndRehash(user.password, password);
    if (!passwordVerif.valid) {
      // Gestion du compteur d'échecs
      login_metadata.login_attempts = (login_metadata.login_attempts || 0) + 1;

      if (login_metadata.login_attempts >= 5) {
        login_metadata.lock_count = (login_metadata.lock_count || 0) + 1;
        const lockDuration = 5 * login_metadata.lock_count;
        const lockUntil = new Date(Date.now() + lockDuration * 60_000);
        login_metadata.lock_until = lockUntil.toISOString();
        login_metadata.login_attempts = 0;
      }

      await ClassModel.update({ login_metadata }, { id: user.id }); // await facultatif // si pas await peut coser bug poten si trop de tentative proche
      return { success: false, status: 401, error: 'Invalid password' };
    }

    // Si le hash doit être réactualisé
    if (passwordVerif.newHash) {
      await ClassModel.update({ password: passwordVerif.newHash }, { id: user.id });
    }

    delete user.password; // Sécurité
    // Ajoute des information d emploi dans des société (company membership)  \\
    const userSocietys = await this._get(ClassModelSocetyMembers, {'p:user_id': user.id}, this.tableSocietyMembership, this.tableSocietyMembershipColumns, [], []);
    user.societys = userSocietys.statusCode === 200 ? userSocietys.value : [];
    //

    // Gestion du "remember me" \\
    if (remember_me && !fingerprint) {
      return { success: false, status: 400, error: 'Missing fingerprint for remember me' }; 
    }

    let dataForSession = { id_user: user.id };
    const sessionTable = remember_me ? 'const_session' : 'tmp_session';
    const abrToken = remember_me ? 'const_' : 'tmp_';
    if (remember_me) {
      dataForSession.fingerprint = fingerprint;
    }
    user.session_token = abrToken + (await ClassModel.createUserSession(dataForSession, sessionTable))[0].id;

    return { success: true, status: 200, user };
  }


  /**
   * Vérifie la validité d'une session utilisateur à partir de la session serveur ou du cookie.
   *
   * @async
   * @static
   * @param {Object|null} session - Objet session Express (req.session).
   * @param {Object|null} cookie - Objet cookies Express (req.cookies).
   *
   * @returns {Promise<{valid: boolean, userSession?: Object}>} 
   * - `valid: true` et `userSession` si la session est valide.
   * - `valid: false` si aucun token ou session invalide.
   *
   * @example
   * const result = await AuthController.checkSession(req.session, req.cookies);
   * if(result.valid) console.log(result.userSession);
   */
   static async checkSession(session, cookie) {
    const [token, tokenSource] = session?.user?.session_token ? [session.user.session_token, "session"] : cookie?.session_token ? [cookie.session_token, "cookie"] : [null, null];
    console.log('log du cookie', cookie.session_token)
    console.log('Checking session with token from', tokenSource, ':', token);

    if (!token) return {valid: false};

    const [tablePrefix, idSession] = token.split('_');
    const tableSession = `${tablePrefix}_session`;

    if (tablePrefix != 'tmp' && tablePrefix != 'const') return {valid: false};

    let userSession = await ClassModel.getSession(tableSession, idSession);
    console.log('User session fetched from', tokenSource, ':', userSession);
 
    if (!userSession || userSession.length === 0) return {valid: false};
    
    userSession.prefix = tablePrefix;
    userSession.idSession = idSession;
    session.user = userSession; // set / re set la session \\

    return { valid: true, userSession }
  }


  /**
   * Vérifie la validité du token de session et renouvelle le cookie si actif.
   *
   * @async
   * @static
   * @route GET/POST /api/auth/handshake
   * @example
   * curl -X GET http://localhost/api/auth/handshake
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 200 : Session valide, cookie mis à jour et informations utilisateur renvoyées.
   * - 404 : Token invalide ou expiré (`deprecated token !`).
   */
  static async handshakeToken(req, res) {
    const chekSession = await this.checkSession(req.session || null, req.cookies || null);
    if(chekSession.valid) {
      // res.cookie('session_token', `${userSession.tablePrefix}_${userSession.idSession}`, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'Strict',
      //   maxAge: (userSession.tablePrefix == 'const' ? 365 * 24 * 60 * 60 * 1000 : 25 * 60 * 1000),  // 1 // 25min
      //   path: '/', 
      // });
      this.createCookie(res, `${userSession.tablePrefix}_${userSession.idSession}`, userSession.tablePrefix);
      return res.status(200).json(chekSession.userSession);
    }
    return res.status(404).json({ error: 'deprecated token !' });
  }


  /**
   * Crée un nouveau compte utilisateur et ouvre une session.
   * 
   * @async
   * @static
   * @route GET/POST /api/auth/create
   * @example
   * p:email=admin@example.com&p:password=1234&p:first_name=John&p:last_name=Doe&remenber_me=false
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 200 : Utilisateur créé + session ouverte.
   * - 400 : Paramètres manquants.
   * - 409 : Email déjà existant.
   * - 500 : Erreur interne.
   */
  static async createAccount(req, res) {
    try {
      let params = this.extractParams(req, res);
      if (!params['p:email'] || !params['p:password'] || !params['p:last_name'] || !params['p:first_name']) return res.status(400).json({ error: 'Missing parameters' });
      const dataAreadyExiste = await this._get(ClassModel, {'p:email': params['p:email'], 'f:email': params['p:email']}, this.table, this.tableColumns, this.lockedParams, this.lockedFields);
      if (dataAreadyExiste.statusCode == 200) {
        return res.status(409).json({ error: `A record with this email already exists in ${this.table}.`, status: `ERROR_EMAIL_ALREADY_EXISTS`});
      }
      const basePassWord = params['p:password'];
      params['p:password'] = await hashPassword(params['p:password']);
      const data = await this._create(ClassModel, params, this.table, this.tableColumns, this.lockedParams, this.lockedFields, []);
      // error prb insertion \\
      const result = await this.authentification(params['p:email'], basePassWord, params['remenber_me'] || params['f:remenber_me'] , params['fingerprint'] || params['f:fingerprint'] || '');

      if (!result.success) {
        req.session.destroy();
        return res.status(result.status).json({ error: result.error });
      }

      // res.cookie('session_token', result.user.session_token, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'Strict',
      //   maxAge: (params.remenber_me == true ? 365 * 24 * 60 * 60 * 1000 : 25 * 60 * 1000),  // 1 // 25min
      //   path: '/', 
      // });
      this.createCookie(res, result.user.session_token, (params.remenber_me == true ? 'const' : 'tmp'));

      req.session.user = result.user;
      return res.status(200).json(result.user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  /**
   * Authentifie un utilisateur existant ou vérifie la session active.
   *
   * @async
   * @static
   * @route GET/POST /api/auth
   * @example
   * curl -X POST http://localhost/api/auth -d '{"email":"user@example.com","password":"1234"}'
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 200 : Authentification réussie ou session active.
   * - 400 : Paramètres manquants ou email/mot de passe manquant.
   * - 401 : Échec de l’authentification.
   * - 500 : Erreur interne.
   */
  static async auth(req, res) {
    try {
      const params = this.extractParams(req, res);
      const chekSession = await this.checkSession(req.session || null, req.cookies || null); // ajouter les signed cookie fonctionel \\ au cas ou
      if(chekSession.valid) {
        this.createCookie(res, `${chekSession.userSession.prefix}_${chekSession.userSession.idSession}`, chekSession.userSession.prefix);
        return res.status(200).json({ success: true, status: 200, user: chekSession.userSession });
      }

      if (!Object.keys(params).length) {
        req.session.destroy();
        return res.status(400).json({ error: 'Missing parameters' });
      }

      if (!params.email || !params.password) {
        req.session.destroy();
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const result = await this.authentification(params.email,params.password,params.remenber_me,params.fingerprint || '');

      if (!result.success) {
        req.session.destroy();
        return res.status(result.status).json({ error: result.error });
      }

      this.createCookie(res, result.user.session_token, (params.remenber_me == true ? 'const' : 'tmp')); // Gestion du cookie ici uniquement

      req.session.user = result.user;
      return res.status(200).json(result);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      } else {
        console.error('Erreur après envoi des headers :', err);
      }
    }
  }

  static async logout(req, res) {
    try {
      if (req.session) req.session.destroy();
      res.clearCookie('session_token', { path: '/' });
      // res.clearCookie('session_token', {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'Strict',
      //   path: '/', 
      // });
      return res.status(200).json({ success: true, message: 'Déconnexion réussie' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // return res.status(403).json({ error: 'Utilisateur non autorisé', code: 'ERROR_USER_ACCESS_DENIED' });  // --->>>> code <<<<--- \\
  // return res.status(401).json({ error: 'Utilisateur non connecté', code: 'ERROR_USER_NOT_CONNECTED' }); //  --->>>> code <<<<---  \\
}