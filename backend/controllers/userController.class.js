import { json } from "express";
import { UserModel as ClassModel } from "../models/userModel.class.js";
import { BaseController } from "./baseController.class.js";
import { hashPassword, verifyAndRehash } from "../utils/password.utils.js";

export class UserController extends BaseController {
  static table = "users";
  static tableColumns = ClassModel.getColumns(this.table);
  static allowedParams = ["id", "email", "first_name", "last_name"];
  static lockedParams = ["password", "login_metadata"];
  static lockedFields = ["password", "login_metadata"];

  /**
   * Récupère des données en fonction des paramètres fournis.
   *
   * @async
   * @static
   * @route GET /api/...
   * @example
   * // Récupération d'un utilisateur par email
   * // GET /api/...?email=user@example.com
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 200 : Données récupérées avec succès.
   * - 4xx : Paramètres invalides ou non trouvés (retourné dans `error`).
   * - 500 : Erreur serveur.
   */
  static async get(req, res) {
    try {
      const value = await this._get(
        ClassModel,
        this.extractParams(req, res),
        this.table,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields
      );
      res
        .status(value.statusCode)
        .json(value.statusCode === 200 ? value.value : { error: value.error });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Met à jour des données en fonction des paramètres fournis.
   *
   * @async
   * @static
   * @route PUT /api/...
   * @example
   * // Met à jour un utilisateur par ID
   * // PUT /api/... avec body { "id": 1, "first_name": "John" }
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 201 : Données mises à jour avec succès.
   * - 4xx : Paramètres invalides ou non trouvés (retourné dans `error`).
   * - 500 : Erreur serveur.
   */
  static async update(req, res) {
    try {
      const data = await this._update(
        ClassModel,
        this.extractParams(req, res),
        this.table,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields
      );
      res
        .status(data.statusCode)
        .json(data.statusCode === 201 ? data.data : { error: data.error });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Crée un nouvel enregistrement selon les paramètres fournis.
   *
   * @async
   * @static
   * @route POST /api/...
   * @example
   * // Crée un utilisateur
   * // POST /api/... avec body { "email": "user@example.com", "first_name": "John", "last_name": "Doe" }
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 201 : Données créées avec succès.
   * - 409 : Email déjà existant (retourné dans `error`).
   * - 500 : Erreur serveur.
   */
  static async create(req, res) {
    try {
      const params = this.extractParams(req, res);
      const dataAreadyExiste = await this._get(
        ClassModel,
        { "p:email": params["p:email"], "f:email": params["p:email"] },
        this.table,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields
      );
      if (dataAreadyExiste.statusCode == 200) {
        return res.status(409).json({
          error: `A record with this email already exists in ${this.table}.`,
          status: `ERROR_EMAIL_ALREADY_EXISTS`,
        });
      }
      const data = await this._create(
        ClassModel,
        params,
        this.table,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields,
        ["password"]
      );
      res
        .status(data.statusCode)
        .json(data.statusCode === 201 ? data.data : { error: data.error });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Supprime un enregistrement selon les paramètres fournis.
   *
   * @async
   * @static
   * @route DELETE /api/...
   * @example
   * // Supprime un utilisateur par ID
   * // DELETE /api/... avec body { "id": 1 }
   *
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   *
   * @returns {Promise<void>} Réponse JSON :
   * - 201 : Données supprimées avec succès.
   * - 4xx : Paramètres invalides ou non trouvés (retourné dans `error`).
   * - 500 : Erreur serveur.
   */
  static async delete(req, res) {
    try {
      const data = await this._delete(
        ClassModel,
        this.extractParams(req, res),
        this.table,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields
      );
      res
        .status(data.statusCode)
        .json(data.statusCode === 201 ? data.data : { error: data.error });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getnumber(req, res) {
    try {
      res.json(ClassModel.count());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // OLD \\
  static async deleteUserV1(req, res) {
    try {
      await UserModel.delete("users", "id=$1", [req.params.id]);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserV1(req, res) {
    // old
    try {
      console.log("Requête reçue :", req.method, req.url);
      const body = req.body || {};
      const query = req.query || {};
      const params = Object.keys(body).length ? body : query;
      console.log("Params reçus :", params);

      if (!Object.keys(params).length) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const filtredParams = Object.keys(params).filter((k) =>
        allowedParams.includes(k)
      );

      if (!filtredParams.length) {
        return res
          .status(400)
          .json({ error: "No supported search keys provided" });
      }

      const methodName =
        "findBy" +
        filtredParams.map((k) => k[0].toUpperCase() + k.slice(1)).join("And");

      if (typeof ClassModel[methodName] !== "function") {
        return res
          .status(400)
          .json({ error: `Method not implemented: ${methodName}` });
      }

      const values = filtredParams.map((k) => params[k]); // Prépare les valeurs dans le même ordre que les clés
      const user = await ClassModel[methodName](...values); // Appel dynamique de la méthode

      if (!user?.length) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listUsers(req, res) {
    // old
    try {
      const users = await ClassModel.selectAll("users");
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateUserV1(req, res) {
    try {
      const user = await ClassModel.update("users", req.body, "id=$1", [
        req.params.id,
      ]);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
