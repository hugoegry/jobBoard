import { BaseModel } from './baseModel.class.js';

export class OfferModel extends BaseModel {
    static table = 'offers';

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

    static async count(condition = {}, countColumn = '*', extraSql = '') {
        return await this._count('users', condition, countColumn, extraSql);
    }
}