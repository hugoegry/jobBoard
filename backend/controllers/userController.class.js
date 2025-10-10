import { json } from 'express';
import { UserModel as ClassModel } from '../models/userModel.class.js';
import { BaseController } from './baseController.class.js';

export class UserController extends BaseController {
    static table = 'users';
    static tableColumns = ClassModel.getColumns(this.table);
    static allowedParams = ['id', 'email', 'first_name', 'last_name'];
    static lockedParams = ['password', 'login_metadata'];
    static lockedFields = ['password', 'login_metadata'];
  
export class UserController {
  static table = "users";
  static components = UserModel.getColumns(this.table);

  /**
   * Filtre un objet pour ne garder que les clés présentes dans la liste de colonnes.
   * @param {Object} source - Objet à filtrer (ex: req.params, req.body)
   * @param {Array<string>} columns - Liste des colonnes valides
   * @returns {Object} Objet filtré
   */
  static filterValidColumns(source, columns) {
    return Object.fromEntries(
      Object.entries(source).filter(([key]) => columns.includes(key))
    );
  }

  static async listUsers(req, res) {
    try {
      const users = await UserModel.selectAll("users");
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

    static async get(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, filtredFields } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields);
        const getValue = await ClassModel.find(filtredParams, filtredFields); // Appel dynamique de la méthode \\
        if (!getValue?.length) {
          return res.status(404).json({ error: `${this.table} not found`, status: `ERROR_NOT_FOUND` });
        }

        res.json(getValue);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async update(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, filtredFields } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' });
        const returnedData = await ClassModel.update(filtredFields, filtredParams);
        if (!returnedData?.length) {
          return res.status(404).json({ error: `No ${this.table} records were updated.`, status: `ERROR_NOT_FOUND` });
        }
        res.status(201).json(returnedData);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async create(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, _ } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' }, ['password']);
        //const usersAlreadyExist = await ClassModel.findByEmail(filtredParams.email);
        // triger verif email already existe \\
        const returnedData = await ClassModel.create(filtredParams);
        res.status(201).json(returnedData);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }


    static async delete(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, _ } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' });
        const returnedData = await ClassModel.delete(filtredParams);
        if (!returnedData?.length) {
          return res.status(404).json({ error: `No ${this.table} records were deleted.`, status: `ERROR_NOT_FOUND`});
        }
        res.status(201).end(); // old 204
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
    
    // 👉 Le code 204 No Content signifie littéralement « succès sans contenu dans la réponse » — c’est un code HTTP conçu pour ne rien retourner.


    static async getnumber(req, res) {
      try {
        res.json({number: 42});
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }



















  static async auth(req, res) {
    try {
      //console.log('Requête reçue :', req.method, req.url);
      const params = Object.keys(req.body || {}).length
        ? req.body
        : req.query || {};
      //console.log('Params reçus :', params);

        if (!Object.keys(params).length) {
          return res.status(400).json({ error: 'Missing parameters'});
        }
      if (!Object.keys(params).length) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      if (!params.email || !params.password || !params.remenber_me) {
        return res.status(400).json({ error: "Missing email or password" });
      }

        const users = await ClassModel.findByEmail(params.email, true);
        if (!users?.length) { 
          return res.status(404).json({ error: 'User not found' });
        }
        const user = users[0];

      let login_metadata = user.login_metadata;
      const now = new Date();
      if (
        login_metadata.lock_until &&
        new Date(login_metadata.lock_until) > now
      ) {
        return res
          .status(403)
          .json({ error: "Account is temporarily locked. Try again later." });
      } else if (login_metadata.lock_until !== null) {
        login_metadata.lock_until = null;
      }

        if (user.password !== params.password) {
          // incrementer le nombre de tentative de connexion \\ returne ban time si trop de tentative \\
          login_metadata.login_attempts = (login_metadata.login_attempts || 0) + 1;
          if (login_metadata.login_attempts >= 5) {
            login_metadata.lock_count = (login_metadata.lock_count || 0) + 1;
            const lockDuration = 5 * login_metadata.lock_count;
            const now = new Date();
            const lockUntil = new Date(now.getTime() + lockDuration * 60_000); // 
            login_metadata.lock_until = lockUntil.toISOString();
            login_metadata.login_attempts = 0; // reset attempts after locking
          }
          const updatedUser = await ClassModel.update({'login_metadata': login_metadata}, {'id': user.id});
          return res.status(401).json({ error: 'Invalid password' });
        }
        delete user.password; // on ne renvoie pas le mot de passe
        if (params.remenber_me === true && !params.fingerprint) {
          return res.status(400).json({ error: 'Missing fingerprint for remember me' });
        }

        let dataForSession = {'id_user': user.id};
        const sessionTable = (params.remember_me === true) ? 'const_session' : 'tmp_session';
        if(params.remenber_me === true) {
          dataForSession.fingerprint = params.fingerprint;
          res.cookie('session_token', token, {
            httpOnly: true,     // le cookie n’est pas accessible par JS côté client
            secure: false,     //seulement en HTTPS
            sameSite: 'Strict', //  empeche les attaques CSRF
            maxAge: 315360000000
          });
        }
        user.session_token = await ClassModel.createUserSession(dataForSession, sessionTable);
        res.json(user);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

  static async deleteUserV1(req, res) {
    try {
      await UserModel.delete("users", "id=$1", [req.params.id]);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }



    // OLD \\
    static async getUserV1(req, res) { // old
      try {
        console.log('Requête reçue :', req.method, req.url);
        const body = req.body || {};
        const query = req.query || {};
        const params = Object.keys(body).length ? body : query;
        console.log('Params reçus :', params);

        if (!Object.keys(params).length) {
          return res.status(400).json({ error: 'Missing parameters' });
        }


        const filtredParams = Object.keys(params).filter(k => allowedParams.includes(k));

        if (!filtredParams.length) {
          return res.status(400).json({ error: 'No supported search keys provided' });
        }

        const methodName = 'findBy' + filtredParams.map(k => k[0].toUpperCase() + k.slice(1)).join('And');

        if (typeof ClassModel[methodName] !== 'function') {
          return res.status(400).json({ error: `Method not implemented: ${methodName}` });
        }
  
        const values = filtredParams.map(k => params[k]); // Prépare les valeurs dans le même ordre que les clés
        const user = await ClassModel[methodName](...values); // Appel dynamique de la méthode

        if (!user?.length) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async listUsers(req, res) { // old
        try {
            const users = await ClassModel.selectAll('users');
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateUserV1(req, res) {
      try {
        const user = await ClassModel.update('users', req.body, 'id=$1', [req.params.id]);
        res.json(user);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
    
}
