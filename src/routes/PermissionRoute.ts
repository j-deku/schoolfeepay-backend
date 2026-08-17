// routes/PermissionRoute.js
import express from 'express'
import { createPermission } from '../controllers/PermissionController';

const PermissionRouter = express.Router();

// ...

PermissionRouter.post('/create', createPermission);

export default PermissionRouter;