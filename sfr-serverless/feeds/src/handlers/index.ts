import { Router } from "express";
import { isAdmin } from "../../../common";
import { feedRouter } from "./feed";
import { feedRouterAdmin } from "./feed-admin";

const router: Router = Router();
feedRouter(router);

const routerAdmin: Router = Router();
routerAdmin.use(isAdmin);
feedRouterAdmin(routerAdmin);

export { router, routerAdmin };
