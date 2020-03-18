import * as express from "express";
import { initialApp } from "../../common/services";
import { router, routerAdmin } from "./handlers";

const app: express.Express = express();
initialApp(app);

app.use("/globals", router);
app.use("/admin", routerAdmin);

export { app };
