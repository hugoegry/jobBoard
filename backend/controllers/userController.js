import { UserModel } from '../models/UserModel.js';

export class UserController {
  static async listUsers(req, res) {
    try {
      const users = await UserModel.selectAll('users');
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUser(req, res) {
    try {
      const user = await UserModel.selectWhere('users', 'id=$1', [req.params.id]);
      if (!user.length) return res.status(404).json({ error: 'User not found' });
      res.json(user[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createUser(req, res) {
    try {
      const user = await UserModel.insert('users', req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await UserModel.update('users', req.body, 'id=$1', [req.params.id]);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      await UserModel.delete('users', 'id=$1', [req.params.id]);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
