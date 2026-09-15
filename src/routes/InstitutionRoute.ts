import { Router } from "express";
import { getInstitutions, listInstitutions, listProgrammes } from "../controllers/InstitutionController";

const institutionRouter = Router();

institutionRouter.get("/", getInstitutions);
//institutionRouter.get("/", listInstitutions);
institutionRouter.get("/:institutionCode/programmes", listProgrammes);


export default institutionRouter;