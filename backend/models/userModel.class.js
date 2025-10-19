import { BaseModel } from "./baseModel.class.js";

export class UserModel extends BaseModel {
  static table = "users";

  static async create(data) {
    return await this._insert(this.table, data);
  }

  static async update(field, param) {
    return await this._update(this.table, field, param);
  }

  static async delete(conditions) {
    return await this._delete(this.table, conditions);
  }

  static async find(params, fieleds) {
    return await this._select(this.table, params, fieleds);
  }

  /**
   * Retourne tous les utilisateurs.
   *
   * @async
   * @function findAllUsers
   * @memberof UserModel
   * @static
   * @returns {Promise<Object|null>} L’utilisateur utilisateur ou `null`
   *
   * @example
   * const users = await UserModel.findAllUsers();
   * console.log(users);
   * // => { id: 7 } ou null
   */
  static async findAllUsers() {
    return await this._select(this.table, {}, ["id"]);
  }

  /**
   * Recherche un utilisateur par id.
   *
   * @async
   * @function findById
   * @memberof UserModel
   * @static
   * @param {string} id -id utilisateur.
   * @returns {Promise<Object|null>} L’utilisateur correspondant ou `null` si aucun ne correspond.
   *
   * @example
   * const user = await UserModel.findById('dsg54548f64g84g8');
   * console.log(user);
   * // => { id: 7 } ou null
   */
  static async findById(id) {
    return await this._select(this.table, { id: id }, [
      "id",
      "email",
      "last_name",
      "first_name",
      "phone",
      "profile",
      "role",
      "created_at",
      "updated_at",
    ]);
  }

  /**
   * Recherche un utilisateur par email.
   *
   * @async
   * @function findByEmail
   * @memberof UserModel
   * @static
   * @param {string} email - Adresse email de l’utilisateur.
   * @returns {Promise<Object|null>} L’utilisateur correspondant ou `null` si aucun ne correspond.
   *
   * @example
   * const user = await UserModel.findByEmail('user@example.com');
   * console.log(user);
   * // => { id: 7 } ou null
   */
  static async findByEmail(email, passwordincluded = false) {
    const includedFields = passwordincluded
      ? [
          "id",
          "email",
          "password",
          "last_name",
          "first_name",
          "phone",
          "profile",
          "role",
          "created_when",
          "updated_when",
          "login_metadata",
        ]
      : [
          "id",
          "email",
          "last_name",
          "first_name",
          "phone",
          "profile",
          "role",
          "created_when",
          "updated_when",
          "login_metadata",
        ];
    return await this._select(this.table, { email: email }, includedFields);
  }

  static async createUserSession(data, table = "tmp_session") {
    return await this._insert(table, data);
  }

  static async getSession(typeSession, idSession) {
    const rowsUserProfile = await this.query(`SELECT * FROM get_user_${typeSession}($1);`, [idSession,]);
    if (rowsUserProfile.length === 0) return [];
    const rowsUserSocietyMembership = await this.query(`SELECT * FROM company_members WHERE user_id = $1;`, [rowsUserProfile[0].user_id]);
    return {
      ...rowsUserProfile[0],
      societys: rowsUserSocietyMembership
    };
  }

  static async count(condition = {}, countColumn = "*", extraSql = "") {
    return await this._count("users", condition, countColumn, extraSql);
  }
}
