import { Router, type IRouter } from "express";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { getDashboardSummary } from "../lib/transit-state";

const router: IRouter = Router();

router.get("/dashboard/summary", (_req, res) => {
  res.json(GetDashboardSummaryResponse.parse(getDashboardSummary()));
});

export default router;