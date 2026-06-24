import { Router } from "express";
import { registerUses } from "../controllers/user.controllers.js";

const router = Router();

router.route('/register').post(registerUses)


export default router;