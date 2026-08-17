// controllers/PermissionController.js
import Permission from '../models/UserPermission';
import { Request, Response } from 'express';

const createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description } = req.body;
  
      if (!name) {
        res.status(400).json({ success: false, message: 'Name is required' });
        return;
      }
  
      const permission = new Permission({ name, description });
      await permission.save();
  
      res.status(201).json({ success: true, message: 'Permission created successfully' });
      return;
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
      return;
    }
  };

  export {createPermission}