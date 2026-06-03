// server/routes/catalog.ts

import fs from 'fs/promises'
import path from 'path'
import { Router } from 'express'

const router = Router()

const DATA_DIR = path.resolve(process.cwd(), 'data')
const PRODUCT_CATALOG_PATH = path.join(DATA_DIR, 'product-catalog.json')

router.get('/products', async (_req, res) => {
  try {
    console.log('Serving website product catalog from:', PRODUCT_CATALOG_PATH)

    const raw = await fs.readFile(PRODUCT_CATALOG_PATH, 'utf-8')
    const catalog = JSON.parse(raw)

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    res.json(catalog)
  } catch (error) {
    console.error('Failed to read website product catalog:', error)

    res.status(500).json({
      lastSyncedAt: null,
      productCount: 0,
      products: [],
      error:
        error instanceof Error
          ? error.message
          : 'Failed to read website product catalog',
    })
  }
})

export default router