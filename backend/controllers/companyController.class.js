import { json } from 'express';
import { CompanyModel as ClassModel } from '../models/companyModel.class.js';
import { BaseController } from './baseController.class.js';

export class CompanyController extends BaseController {
    static table = 'company';
    static tableColumns = ClassModel.getColumns(this.table);
    static allowedParams = [];
    static lockedParams = [];
    static lockedFields = [];
  

    static async get(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, filtredFields } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields);
        const getValue = await ClassModel.find(filtredParams, filtredFields); // Appel dynamique de la méthode \\
        if (!getValue?.length) {
          return res.status(404).json({ error: `${this.table} not found`, status: `ERROR_NOT_FOUND` });
        }
        res.json(getValue);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async update(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, filtredFields } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' });
        const returnedData = await ClassModel.update(filtredFields, filtredParams);
        if (!returnedData?.length) {
          return res.status(404).json({ error: `No ${this.table} records were updated.`, status: `ERROR_NOT_FOUND` });
        }
        res.status(201).json(returnedData);
      } catch (err) { 
        res.status(500).json({ error: err.message });
      }
    }

    static async create(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, _ } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' }, ['password']);
        const returnedData = await ClassModel.create(filtredParams);
        res.status(201).json(returnedData);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }

    static async delete(req, res) {
      try {
        const params = this.extractParams(req, res);
        const { filtredParams, _ } = await this.filterValidParams(params, this.tableColumns, this.lockedParams, this.lockedFields, { params: 'objet', fields: 'objet' });
        const returnedData = await ClassModel.delete(filtredParams);
        if (!returnedData?.length) {
          return res.status(404).json({ error: `No ${this.table} records were deleted.`, status: `ERROR_NOT_FOUND`});
        }
        res.status(201).end(); // old 204
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }

    static async getnumber(req, res) {
      try {
        res.json({number: 42});
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
    
}