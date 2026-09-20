import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import journeysRouter from "./journeys";
import walletRouter from "./wallet";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(journeysRouter);
router.use(walletRouter);

export default router;
