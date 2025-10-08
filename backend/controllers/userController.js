import { UserModel } from '../models/UserModel.js';

export class UserController {
    static table = 'users';
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
            const users = await UserModel.selectAll('users');
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getUser(req, res) {
      try {
        console.log('Requête reçue :', req.method, req.url);
        const body = req.body || {};
        const query = req.query || {};
        const params = Object.keys(body).length ? body : query;
        console.log('Params reçus :', params);

        if (!Object.keys(params).length) {
          return res.status(400).json({ error: 'Missing parameters' });
        }
        const allowedParams = ['id', 'email', 'username', 'phone'];
        const filtredParams = Object.keys(params).filter(k => allowedParams.includes(k));

        if (!filtredParams.length) {
          return res.status(400).json({ error: 'No supported search keys provided' });
        }

        const methodName = 'findBy' + filtredParams.map(k => k[0].toUpperCase() + k.slice(1)).join('And');

        if (typeof UserModel[methodName] !== 'function') {
          return res.status(400).json({ error: `Method not implemented: ${methodName}` });
        }
  
        const values = filtredParams.map(k => params[k]); // Prépare les valeurs dans le même ordre que les clés
        const user = await UserModel[methodName](...values); // Appel dynamique de la méthode

        if (!user?.length) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async authUser(req, res) {
      try {
        console.log('Requête reçue :', req.method, req.url);
        const params = Object.keys(req.body || {}).length ? req.body : (req.query || {});
        console.log('Params reçus :', params);

        if (!Object.keys(params).length) {
          return res.status(400).json({ error: 'Missing parameters' });
        }

        if (!params.email || !params.password || !params.remenber_me) {
          return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = await UserModel.findByEmail(params.email);
        if (!user?.length) {
          return res.status(404).json({ error: 'User not found' });
        }
        user = user[0];
        if (user.password !== params.password) {
          return res.status(401).json({ error: 'Invalid password' });
        }
        delete user.password; // on ne renvoie pas le mot de passe

        if (params.remenber_me === true && !params.fingerprint) {
          return res.status(400).json({ error: 'Missing fingerprint for remember me' });
        }

        // si les deux mp sont ok on insert un insert une session en bdd \\
        // insertion de la session ici ...

        user.session_token = 'session_token'; // a retour de requette
        const userSession = await UserModel.createUserSession();
        console.log('User session created:', userSession);


        res.json(user);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

  static async createUser(req, res) {
    try {
      const user = await UserModel.insert('users', req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await UserModel.update('users', req.body, 'id=$1', [req.params.id]);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      await UserModel.delete('users', 'id=$1', [req.params.id]);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }




  // ZONE TEST 

  static async getnumber(req, res) {
    try {
      res.json({number: 42});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}