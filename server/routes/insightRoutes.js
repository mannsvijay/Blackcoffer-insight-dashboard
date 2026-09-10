import { Router } from "express";
import {
  getInsights,
  getFilterOptions,
  getKpis,
  getAggregate,
  getTimeseries,
  getScatterData,
} from "../controllers/insightController.js";

const router = Router();

// Order matters: specific string routes must come before none conflict here
// since none of these collide with an :id-style param route.
router.get("/filters", getFilterOptions);
router.get("/kpis", getKpis);
router.get("/aggregate", getAggregate);
router.get("/timeseries", getTimeseries);
router.get("/scatter", getScatterData);
router.get("/", getInsights);

export default router;
