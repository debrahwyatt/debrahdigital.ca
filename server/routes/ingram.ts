import 'dotenv/config'
import express from 'express'

import { getIngramToken } from '../services/ingram/ingramAuth'
import {
  syncIngramCatalogCache,
} from '../services/ingram/ingramCatalogCache'
import {
  getIngramPriceAvailability,
  getIngramProductDetails,
  searchIngramProducts,
} from '../services/ingram/ingramService'

const router = express.Router()

router.get('/token-test', async (_req, res) => {
  try {
    const token = await getIngramToken()

    res.json({
      success: true,
      message: 'Ingram token received successfully.',
      tokenPreview: `${token.slice(0, 12)}...`,
    })
  } catch (error) {
    console.error('INGRAM TOKEN ERROR:', error)

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Ingram error',
    })
  }
})

router.post('/catalog/sync', async (_req, res) => {
  try {
    const result = await syncIngramCatalogCache()

    res.json({
      success: true,
      lastSyncedAt: result.lastSyncedAt,
      productCount: result.productCount,
    })
  } catch (error) {
    console.error('INGRAM CATALOG SYNC ERROR:', error)

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Ingram error',
    })
  }
})

router.get('/search-products', async (req, res) => {
  try {
    const keyword = String(req.query.keyword ?? '')
    const category = String(req.query.category ?? '')
    const pageNumber = String(req.query.pageNumber ?? '1')
    const pageSize = String(req.query.pageSize ?? '25')

    const result = await searchIngramProducts({
      keyword,
      category,
      pageNumber,
      pageSize,
      type: 'IM::physical',
    })

    // Ingram returns 404 when a search/page has no records.
    // For our frontend catalog, that should behave like an empty result page.
    if (!result.success && result.status === 404) {
      res.json({
        success: true,
        recordsFound: 0,
        pageSize: Number(pageSize),
        pageNumber: Number(pageNumber),
        products: [],
        raw: result.data,
      })
      return
    }

    if (!result.success) {
      res.status(result.status ?? 500).json(result)
      return
    }

    res.json(result)
  } catch (error) {
    console.error('INGRAM SEARCH PRODUCTS ERROR:', error)

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Ingram error',
    })
  }
})

router.post('/price-availability', async (req, res) => {
  try {
    const { skus } = req.body as {
      skus?: string[]
    }

    if (!Array.isArray(skus) || skus.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Send an array of SKUs, example: { "skus": ["5591DX"] }',
      })
      return
    }

    if (skus.length > 50) {
      res.status(400).json({
        success: false,
        error: 'Maximum 50 SKUs per request.',
      })
      return
    }

    const result = await getIngramPriceAvailability(skus)

    if (!result.success) {
      res.status(result.status ?? 500).json(result)
      return
    }

    res.json(result)
  } catch (error) {
    console.error('INGRAM PRICE/AVAILABILITY ERROR:', error)

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Ingram error',
    })
  }
})

router.get('/product-details/:ingramPartNumber', async (req, res) => {
  try {
    const { ingramPartNumber } = req.params

    if (!ingramPartNumber) {
      res.status(400).json({
        success: false,
        error: 'Missing Ingram part number.',
      })
      return
    }

    const result = await getIngramProductDetails(ingramPartNumber)

    if (!result.success) {
      res.status(result.status ?? 500).json(result)
      return
    }

    res.json(result)
  } catch (error) {
    console.error('INGRAM PRODUCT DETAILS ERROR:', error)

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Ingram error',
    })
  }
})

export default router