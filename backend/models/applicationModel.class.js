import { BaseModel } from "./baseModel.class.js";

export class ApplicationModel extends BaseModel {
  static table = "applications";

  static async create(data) {
    return await this._insert(this.table, data);
  }

  static async update(field, param, returning = "*") {
    console.log(param, field);
    return await this._update(this.table, field, param, returning);
  }

  static async delete(conditions) {
    return await this._delete(this.table, conditions);
  }

  static async find(params, fields) {
    return await this._select(this.table, params, fields);
  }
}
