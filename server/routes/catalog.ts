import express from 'express'
import {
  readCatalogCache,
  syncIngramCatalogCache,
} from '../services/ingram/ingramCatalogCache'

const router = express.Router()

router.get('/products', async (_req, res) => {
  try {
    const catalogCache = await readCatalogCache()

    if (!catalogCache) {
      return res.status(503).json({
        error: 'Catalog cache has not been generated yet.',
        products: [],
      })
    }

    res.json(catalogCache)
  } catch (error) {
    console.error('Failed to read catalog cache:', error)

    res.status(500).json({
      error: 'Failed to read catalog cache.',
      products: [],
    })
  }
})

router.post('/sync', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token']

    if (adminToken !== process.env.ADMIN_SYNC_TOKEN) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const catalogCache = await syncIngramCatalogCache()

    res.json({
      message: 'Catalog sync complete.',
      lastSyncedAt: catalogCache.lastSyncedAt,
      productCount: catalogCache.productCount,
    })
  } catch (error) {
    console.error('Failed to sync catalog cache:', error)

    res.status(500).json({
      error: 'Failed to sync catalog cache.',
    })
  }
})

export default router