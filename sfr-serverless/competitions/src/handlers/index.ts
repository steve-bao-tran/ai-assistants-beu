import { Router } from "express";
import { isAdmin } from "../../../common";
import { competitionRouter } from "./competition";
import { competitionAdminRouter } from "./competition-admin";

const router: Router = Router();
competitionRouter(router);

const routerAdmin: Router = Router();
routerAdmin.use(isAdmin);
competitionAdminRouter(routerAdmin);

export { router, routerAdmin };
