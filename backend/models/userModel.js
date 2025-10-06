import { BaseModel } from './baseModel.js';

export class UserModel extends BaseModel {
    static table = 'users';

    static async createUser(data) {
        return await this.insert(this.table, data);
    }

    static async updateUser(updateData, conditions) {
        return await this.update(this.table, updateData, conditions);
    }

    static async deleteUser(conditions) {
        return await this.delete(this.table, conditions);
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
        return await this.select(this.table, {}, ['id']);
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
    static async findUserById(id) {
        return await this.select(this.table, {'user_id': id}, ['user_id']);
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
    static async findByEmail(email) {
        return await this.select(this.table, { 'email': email}, ['id']);
    }

    /**
     * Recherche un utilisateur par email et mot de passe.
     * 
     * @async
     * @function findByEmailAndPassword
     * @memberof UserModel
     * @static
     * @param {string} email - Adresse email de l’utilisateur.
     * @param {string} password - Mot de passe haché.
     * @returns {Promise<Object|null>} L’utilisateur correspondant ou `null` si aucun ne correspond.
     * 
     * @example
     * const user = await UserModel.findByEmailAndPassword('user@example.com', 'secret');
     * console.log(user);
     * // => { id: 7 } ou null
     */
    static async findByEmailAndPassword(email, password) {
        return await this.select(this.table, { 'email': email, 'password': password }, ['id']);
    }


}


// model.select('users', { active: true }, 'ORDER BY created_at DESC')
