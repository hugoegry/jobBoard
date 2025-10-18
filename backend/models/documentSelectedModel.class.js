import { BaseModel } from './baseModel.class.js';

export class DocumentSelectedModel extends BaseModel {
    static table = 'selected_document';

    static async create(data) {
        return await this._insert(this.table, data, '*');
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

}