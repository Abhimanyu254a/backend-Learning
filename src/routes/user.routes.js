import { Router } from "express";
import { login, logoutUser, registerUses } from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ],),
    registerUses
)

router.router('/login').post(login).post(loginUser)

router.router('/logout').post(verifyJWT, logoutUser)

export default router;