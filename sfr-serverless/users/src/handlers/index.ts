import { Router } from "express";
import { userRouter } from "./user";
import { userAdminRouter } from "./user-admin";

const routerAdmin: Router = Router();
userAdminRouter(routerAdmin);

const router: Router = Router();
userRouter(router);

export { router, routerAdmin };
