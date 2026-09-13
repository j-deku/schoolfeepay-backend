import { Router } from "express";
import { getInstitutions } from "../controllers/InstitutionController";

const router = Router();

router.get("/", getInstitutions);

export default router;