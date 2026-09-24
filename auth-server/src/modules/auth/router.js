import { Router } from "express";
import * as controllerMethods from './controller.js';

const authRouter = Router();

authRouter
    .post(
        '/register', 
        controllerMethods.register
    )
    .post(
        '/login',
        controllerMethods.login
    )
    .get(
        '/me',
        controllerMethods.getMe
    )
    .get(
        '/refresh-token',
        controllerMethods.refreshToken
    )
    .get(
        '/logout',
        controllerMethods.logout
    );

export default authRouter;