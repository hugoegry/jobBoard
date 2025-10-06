import { BaseModel } from '/baseModel.js';

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

    static async findAllUsers() {
        return await this.select(this.table, {}, ['id']);
    }

    static async findUserById(id) {
        return await this.select(this.table, {'id': id}, ['id']);
    }

    static async findByEmail(email) {
        return await this.select(this.table, { 'email': email}, ['id']);
    }

    static async findByEmailAndPassword(email, password) {
        return await this.select(this.table, { 'email': email, 'password': password }, ['id']);
    }


}


// model.select('users', { active: true }, 'ORDER BY created_at DESC')
