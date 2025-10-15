import { json } from "express";
import { DocumentModel as ClassModel } from "../models/documentModel.class.js";
import { BaseController } from "./baseController.class.js";

export class DocumentController extends BaseController {
  static table = "document";
  static tableColumns = ClassModel.getColumns(this.table);
  static allowedParams = [];
  static lockedParams = [];
  static lockedFields = [];

  static async get(req, res) {
    try {
      const params = this.extractParams(req, res);
      const { filtredParams, filtredFields } = await this.filterValidParams(
        params,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields
      );
      const getValue = await ClassModel.find(filtredParams, filtredFields); // Appel dynamique de la méthode \\
      if (!getValue?.length) {
        return res.status(404).json({
          error: `${this.table} not found`,
          status: `ERROR_NOT_FOUND`,
        });
      }
      res.json(getValue);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const params = this.extractParams(req, res);
      const { filtredParams, filtredFields } = await this.filterValidParams(
        params,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields,
        { params: "objet", fields: "objet" }
      );
      const returnedData = await ClassModel.update(
        filtredFields,
        filtredParams
      );
      if (!returnedData?.length) {
        return res.status(404).json({
          error: `No ${this.table} records were updated.`,
          status: `ERROR_NOT_FOUND`,
        });
      }
      res.status(201).json(returnedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const params = this.extractParams(req, res);
      const { filtredParams, _ } = await this.filterValidParams(
        params,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields,
        { params: "objet", fields: "objet" },
        ["password"]
      );
      const returnedData = await ClassModel.create(filtredParams);
      res.status(201).json(returnedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  static async createWithFiles(req, res) {
    try {
      console.log("📥 req.body =", req.body);
      console.log("📎 req.file =", req.file);

      // Vérifs
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier reçu" });
      }
      const id_user = req.body.id_user;
      if (!id_user) {
        return res.status(400).json({ error: "id_user manquant" });
      }

      const params = {
        id: req.file.filename.slice(0, -4),
        id_user: id_user,
        name: req.file.originalname,
      };

      console.log("→ insertion document params =", params);
      const returnedData = await ClassModel.create(params);

      res.status(201).json(returnedData);
    } catch (err) {
      console.error("Erreur DocumentController.create :", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const params = this.extractParams(req, res);
      const { filtredParams, _ } = await this.filterValidParams(
        params,
        this.tableColumns,
        this.lockedParams,
        this.lockedFields,
        { params: "objet", fields: "objet" }
      );
      const returnedData = await ClassModel.delete(filtredParams);
      if (!returnedData?.length) {
        return res.status(404).json({
          error: `No ${this.table} records were deleted.`,
          status: `ERROR_NOT_FOUND`,
        });
      }
      res.status(201).end(); // old 204
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getnumber(req, res) {
    try {
      res.json({ number: 42 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
