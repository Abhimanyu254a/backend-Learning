import { Router } from "express";
import { registerUses } from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:"Cover Image",
            maxCount:1
        }
    ]),
    registerUses
)


export default router;