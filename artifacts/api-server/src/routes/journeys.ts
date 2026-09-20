import { Router, type IRouter } from "express";
import {
  ConfirmJourneyBody,
  ConfirmJourneyResponse,
  GetActiveJourneyResponse,
  GetJourneyOptionsQueryParams,
  GetJourneyOptionsResponse,
  ValidateJourneyLegBody,
  ValidateJourneyLegParams,
  ValidateJourneyLegResponse,
} from "@workspace/api-zod";
import {
  confirmJourney,
  getActiveJourney,
  planJourneys,
  validateLeg,
} from "../lib/transit-state";

const router: IRouter = Router();

router.get("/journeys/options", (req, res) => {
  const parsed = GetJourneyOptionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const options = planJourneys(parsed.data.from, parsed.data.to);
  res.json(GetJourneyOptionsResponse.parse(options));
});

router.post("/journeys/confirm", (req, res) => {
  const parsed = ConfirmJourneyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const journey = confirmJourney(parsed.data.optionId);
  if (!journey) {
    res.status(400).json({ error: "Journey unavailable or wallet balance is insufficient" });
    return;
  }
  res.status(201).json(ConfirmJourneyResponse.parse(journey));
});

router.get("/journeys/active", (_req, res) => {
  const journey = getActiveJourney();
  res.json(GetActiveJourneyResponse.parse(journey));
});

router.post("/journeys/:journeyId/validate", (req, res) => {
  const params = ValidateJourneyLegParams.safeParse(req.params);
  const body = ValidateJourneyLegBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const journey = validateLeg(params.data.journeyId, body.data.legId);
  if (!journey) {
    res.status(404).json({ error: "Journey not found" });
    return;
  }
  res.json(ValidateJourneyLegResponse.parse(journey));
});

export default router;