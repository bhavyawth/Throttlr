import { Router } from "express";
import { checkController } from "../controllers/check.controller";

export const checkRouter = Router();

// rate limiting check endpoint
checkRouter.post("/", checkController.performCheck);