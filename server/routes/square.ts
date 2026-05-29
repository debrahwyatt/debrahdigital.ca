import 'dotenv/config'
import express from 'express'

import { getSquareProducts } from '../services/square/squareService'

const router = express.Router()

router.get('/products', async (_req, res) => {
  try {
    const products = await getSquareProducts()

    res.json(products)
  } catch (error) {
    console.error('SQUARE PRODUCTS ERROR:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to fetch Square products',
      details: error instanceof Error ? error.message : 'Unknown Square error',
    })
  }
})

export default router