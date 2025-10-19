import { BaseModel } from './baseModel.class.js';

export class OfferModel extends BaseModel {
    static table = 'offers';
    static tableView = 'v_offers_with_company';

    static async create(data) {
        return await this._insert(this.table, data);
    }

    static async update(field, param) {
        return await this._update(this.table, field, param);
    }

    static async delete(conditions) {
        return await this._delete(this.table, conditions);
    }

    static async find(params, fields) {
        return await this._select(this.tableView, params, fields);
    }

    static async count(condition = {}, countColumn = '*', extraSql = '') {
        return await this._count((this.tableView || this.table), condition, countColumn, extraSql);
    }
}