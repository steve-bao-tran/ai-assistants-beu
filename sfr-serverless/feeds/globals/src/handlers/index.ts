import { Router } from "express";
import { isAdmin } from "../../../common";
import { adminRouter } from "./admin";
import { globalRouter } from "./global";

const routerAdmin: Router = Router();
routerAdmin.use(isAdmin);
adminRouter(routerAdmin);

const router: Router = Router();
globalRouter(router);

export { router, routerAdmin };
