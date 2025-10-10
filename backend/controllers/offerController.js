import { json } from 'express';
import { OfferModel } from '../models/offerModel.js';
import { BaseController } from './baseController.class.js';

export class OfferController extends BaseController {
    static table = 'v_offers_with_company';
    static tableColumns = OfferModel.getColumns(this.table);
    static allowedParams = [];
    static lockedParams = [];
    static lockedFields = [];
  

    static async getOffer(req, res) {
      try {
        console.log('Requête reçue :', req.method, req.url);
        const body = req.body || {};
        const query = req.query || {};
        const params = Object.keys(body).length ? body : query;
        console.log('Params reçus :', params);

        const { filtredParams, filtredFields } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields);
        console.log('Params filtrés :', filtredParams, 'Fields filtrés :', filtredFields);
        const user = await OfferModel.findOffer(filtredParams, filtredFields); // Appel dynamique de la méthode \\
        console.log('User trouvé :', user);

        if (!user?.length) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async updateOffer(req, res) {
      try {
        console.log('Requête reçue :', req.method, req.url);
        const body = req.body || {};
        const query = req.query || {};
        const params = Object.keys(body).length ? body : query;
        console.log('Params reçus :', params);
        const { filtredParams, filtredFields } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' });
        const returnedData = await OfferModel.updateUser(filtredFields, filtredParams);
        res.status(201).json(returnedData);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async createUser(req, res) {
      try {

        
        const user = await OfferModel.insert(this.table, req.body);
        res.status(201).json(user);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }





  static async deleteUser(req, res) {
    try {
      await OfferModel.delete('users', 'id=$1', [req.params.id]);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

    
}