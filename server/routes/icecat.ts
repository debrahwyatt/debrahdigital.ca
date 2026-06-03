// server/routes/icecat.ts

import { Router } from "express";
import { buildIcecatCatalogCache } from "../services/icecat/icecatCatalogCache";

const router = Router();

router.post("/cache/build", async (_req, res) => {
  try {
    const result = await buildIcecatCatalogCache();

    res.json({
      success: true,
      ...result,
      products: undefined,
    });
  } catch (error) {
    console.error("Failed to build Icecat cache:", error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;