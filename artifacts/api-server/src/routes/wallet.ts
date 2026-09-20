import { Router, type IRouter } from "express";
import {
  GetWalletLedgerResponse,
  GetWalletResponse,
  TopUpWalletBody,
  TopUpWalletResponse,
} from "@workspace/api-zod";
import { getLedger, getWallet, topUp } from "../lib/transit-state";

const router: IRouter = Router();

router.get("/wallet", (_req, res) => {
  res.json(GetWalletResponse.parse(getWallet()));
});

router.get("/wallet/ledger", (_req, res) => {
  res.json(GetWalletLedgerResponse.parse(getLedger()));
});

router.post("/wallet/top-up", (req, res) => {
  const parsed = TopUpWalletBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(201).json(TopUpWalletResponse.parse(topUp(parsed.data.amountPaise)));
});

export default router;