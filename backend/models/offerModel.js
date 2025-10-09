import { BaseModel } from './baseModel.js';

export class OfferModel extends BaseModel {
    static table = 'v_offers_with_company';

    static async createOffer(data) {
        return await this.insert(this.table, data);
    }

    static async updateOffer(field, param) {
        return await this.update(this.table, field, param);
    }

    static async deleteOffer(conditions) {
        return await this.delete(this.table, conditions);
    }

    static async findOffer(params, fieleds) {
        return await this.select(this.table, params, fieleds);
    }


}


// model.select('users', { active: true }, 'ORDER BY created_at DESC')
