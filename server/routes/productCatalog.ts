// server/routes/productCatalog.ts

import { Router } from "express";
import { buildProductCatalogCache } from "../services/catalog/productCatalogCache";

const router = Router();

router.post("/cache/build", async (_req, res) => {
  try {
    const result = await buildProductCatalogCache();

    res.json({
      success: true,
      lastSyncedAt: result.lastSyncedAt,
      productCount: result.productCount,
      ingramProductCount: result.ingramProductCount,
      icecatProductCount: result.icecatProductCount,
      icecatMatchedCount: result.icecatMatchedCount,
      icecatWithImageCount: result.icecatWithImageCount,
    });
  } catch (error) {
    console.error("Failed to build product catalog cache:", error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;