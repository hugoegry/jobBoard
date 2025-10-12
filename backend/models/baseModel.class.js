// BaseModel.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();


/**
 * Classe de base pour la gestion des opérations CRUD sur une base PostgreSQL.
 * Fournit des méthodes génériques pour exécuter des requêtes SQL paramétrées
 * avec un pool de connexions partagé.
 */
export class BaseModel {
  static pool = null;

  /**
   * Initialise le pool de connexions PostgreSQL si ce n’est pas déjà fait.
   * Utilise les variables d’environnement définies dans `.env`.
   *
   * @private
   */
  static init() {
    if (!BaseModel.pool) {
      BaseModel.pool = new Pool({
        host: process.env.DB_HOST || '92.88.3.200',
        user: process.env.DB_USER || 'hugo.egry@epitech.eu',
        password: process.env.DB_PASS || 'Azertyuiop123',
        database: process.env.DB_NAME || 'jobboard',
        port: process.env.DB_PORT || 5432,
        max: 10,
        idleTimeoutMillis: 30000,
      });
    }
  }

  /**
   * Exécute une requête SQL paramétrée via le pool.
   *
   * @async
   * @param {string} sql - Requête SQL à exécuter (peut contenir des placeholders `$1`, `$2`, etc.)
   * @param {Array<*>} [values=[]] - Valeurs à substituer dans les placeholders SQL
   * @returns {Promise<Array<Object>>} - Résultats de la requête sous forme de tableau d’objets
   * @throws {Error} En cas d’erreur SQL ou de connexion
   *
   * @example
   * const rows = await BaseModel.query('SELECT * FROM users WHERE id = $1', [1]);
   */
  static async query(sql, values = []) {
    BaseModel.init();
    try {
      const result = await BaseModel.pool.query(sql, values);
      return result.rows;
    } catch (err) {
      console.error('[PostgreSQL QUERY ERROR]', err.message, { sql, values });
      throw err;
    }
  }

  /**
   * Sélectionne des enregistrements dans une table avec des colonnes spécifiques et des conditions dynamiques.
   *
   * @async
   * @param {string} table - Nom de la table à interroger
   * @param {Object} [conditions={}] - Conditions de filtrage sous forme d'objet { colonne: valeur }
   * @param {string[]} [columns=['*']] - Liste des colonnes à sélectionner (par défaut toutes)
   * @param {string} [extraSql=''] - Clauses SQL additionnelles (ex: ORDER BY, LIMIT)
   * @returns {Promise<Array<Object>>} - Lignes retournées par la requête
   *
   * @example
   * // Sélectionner tous les utilisateurs actifs avec leurs id et emails
   * await model.select('users', { active: true }, ['id', 'email'], 'ORDER BY created_at DESC');
   */
  static async _select(table, conditions = {}, columns = ['*'], extraSql = '') {
    // Validation simple pour éviter injection dans le nom de colonnes
    const isSafeColumn = (name) => /^[a-zA-Z0-9_]+$/.test(name);// methode de regex

    // Construction des colonnes à sélectionner
    const selectCols = Array.isArray(columns) && columns.length ? columns.map(col => (col === '*' ? '*' : `"${col}"`)).join(', ') : '*';

    if (selectCols.includes(';')) {
      throw new Error('Caractère SQL interdit détecté dans la liste de colonnes');
    }

    let sql = `SELECT ${selectCols} FROM "${table}"`;
    const values = [];

    if (Object.keys(conditions).length) { // Construction du WHERE
      const where = Object.entries(conditions)
        .map(([k, v], i) => {
          if (!isSafeColumn(k)) throw new Error(`Nom de colonne invalide: ${k}`);
          values.push(v);
          return `"${k}" = $${i + 1}`;
        })
        .join(' AND ');
      sql += ` WHERE ${where}`;
    }

    // Clauses additionnelles (ORDER BY, LIMIT, etc.)
    if (extraSql && /;/.test(extraSql)) {
      throw new Error('Le paramètre extraSql ne doit pas contenir de point-virgule.');
    }
    sql += ` ${extraSql}`;

    return await this.query(sql, values);
  }

  /**
   * Insère un nouvel enregistrement dans une table.
   *
   * @async
   * @param {string} table - Nom de la table cible
   * @param {Object} data - Données à insérer (clé = colonne, valeur = donnée)
   * @param {string} [returning='id'] - Colonne(s) à retourner après insertion
   * @returns {Promise<Object|null>} - Ligne insérée (ou `null` si rien)
   *
   * @example
   * await model.insert('users', { email: 'test@test.com', name: 'John' });
   */
  static async _insert(table, data = {}, returning = 'id') {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')})
                 VALUES (${placeholders})
                 RETURNING ${returning}`;
    const result = await BaseModel.query(sql, values);
    return result || null;
  }


  static async _update(table, data = {}, conditions = {}, returning = 'id') {
    const keys = Object.keys(data);
    const setClauses = [];
    const values = [];

    for (const [i, key] of keys.entries()) {
      let value = data[key];

      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value); // Si c'est un objet  on le convertit en JSONB \\
        setClauses.push(`"${key}" = $${i + 1}::jsonb`);
      } else {
        setClauses.push(`"${key}" = $${i + 1}`);
      }

      values.push(value);
    }

    let sql = `UPDATE "${table}" SET ${setClauses.join(', ')}`;

    if (Object.keys(conditions).length) {
      const offset = values.length;
      const where = Object.entries(conditions)
        .map(([k, v], i) => {
          values.push(v);
          return `"${k}" = $${offset + i + 1}`;
        }).join(' AND ');
      sql += ` WHERE ${where}`;
    }

    sql += ` RETURNING ${returning}`;
    console.log('Condfgfdgd', sql);
    console.log('Values', values);
    const result = await BaseModel.query(sql, values);
    return result;
  }


  /**
   * Supprime un ou plusieurs enregistrements d’une table.
   *
   * @async
   * @param {string} table - Nom de la table
   * @param {Object} conditions - Conditions WHERE (clé/valeur)
   * @returns {Promise<Array<Object>>} - Lignes supprimées (vide si aucune)
   *
   * @example
   * await model.delete('users', { id: 5 });
   */
  static async _delete(table, conditions = {}, returning = '*') {
    const values = [];
    const where = Object.entries(conditions)
      .map(([k, v], i) => {
        values.push(v);
        return `"${k}" = $${i + 1}`;
      })
      .join(' AND ');
    const sql = `DELETE FROM "${table}" WHERE ${where} RETURNING ${returning}`;
    const result = await BaseModel.query(sql, values);
    return result;
  }


  /**
   * Compte le nombre d'enregistrements dans une table selon des conditions dynamiques.
   *
   * @async
   * @param {string} table - Nom de la table à interroger
   * @param {Object} [conditions={}] - Conditions de filtrage sous forme d'objet { colonne: valeur }
   * @param {string} [countColumn='*'] - Colonne sur laquelle faire le COUNT (par défaut '*')
   * @param {string} [extraSql=''] - Clauses SQL additionnelles (ex: GROUP BY, HAVING)
   * @returns {Promise<number>} - Nombre d'enregistrements correspondant aux conditions
   *
   * @example
   * // Compter le nombre d'utilisateurs actifs
   * const total = await model._count('users', { active: true });
   */
  static async _count(table, conditions = {}, countColumn = '*', extraSql = '') {
    const isSafeColumn = (name) => /^[a-zA-Z0-9_]+$/.test(name);

    if (!isSafeColumn(countColumn) && countColumn !== '*') {
      throw new Error(`Nom de colonne invalide pour COUNT: ${countColumn}`);
    }

    let sql = `SELECT COUNT(${countColumn === '*' ? '*' : `"${countColumn}"`}) AS total FROM "${table}"`;
    const values = [];

    if (Object.keys(conditions).length) {
      const where = Object.entries(conditions)
        .map(([k, v], i) => {
          if (!isSafeColumn(k)) throw new Error(`Nom de colonne invalide: ${k}`);
          values.push(v);
          return `"${k}" = $${i + 1}`;
        })
        .join(' AND ');
      sql += ` WHERE ${where}`;
    }

    if (extraSql) sql += ` ${extraSql}`;

    const result = await this.query(sql, values);
    return result[0]?.total || 0;
  }


  /**
  * Récupère toutes les colonnes de la table.
  * @async
  * @param {string} table - Nom de la table
  * @returns {Promise<Array<string>>} Liste des colonnes
  */
  // static async getColumns(table) {
  //     return await this.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
  // }
  static async getColumns(table) {
    const result = await this.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {// On transforme le tableau d'objets en tableau de noms de colonnes
      return result.map(col => col.column_name);
    }
    return [];
  }
}