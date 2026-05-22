import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { SquareClient, SquareEnvironment } from 'square'

dotenv.config()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

const square = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
})

const toNumber = (value: unknown): number => {
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

app.get('/', (_req, res) => {
  res.send('Square API server is running. Try /api/products')
})

app.get('/api/products', async (_req, res) => {
  try {
    const catalogResponse = await square.catalog.search({
      objectTypes: ['ITEM'],
      includeRelatedObjects: true,
      includeCategoryPathToRoot: true,
    })

    
    const relatedObjects = catalogResponse.relatedObjects ?? []
    const imageMap = new Map<string, string | null>()
    const categoryMap = new Map<string, string>()

    relatedObjects.forEach((obj: any) => {
      if (obj.type === 'IMAGE') {
        imageMap.set(String(obj.id), obj.imageData?.url ?? null)
      }

      if (obj.type === 'CATEGORY') {
        categoryMap.set(
          String(obj.id),
          String(obj.categoryData?.name ?? 'Uncategorized'),
        )
      }
    })

    const products =
      catalogResponse.objects
        ?.filter((item: any) => {
          const data = item.itemData
          const variation = data?.variations?.[0]?.itemVariationData
          const locationOverride = variation?.locationOverrides?.[0]

          if (!data || !variation) return false
          if (data.productType !== 'REGULAR') return false
          if (data.isArchived) return false
          if (!variation.trackInventory) return false
          if (!variation.sellable) return false
          if (locationOverride?.soldOut === true) return false

          return true
        })
        .map((item: any) => {
          const data = item.itemData
          const variationObject = data.variations[0]
          const variation = variationObject.itemVariationData
          const priceCents = toNumber(variation.priceMoney?.amount)
          const locationOverride = variation.locationOverrides?.[0]

          const primaryImageId = data.imageIds?.[0]
            ? String(data.imageIds[0])
            : null

          const categoryId = String(
            data.reportingCategory?.id || data.categories?.[0]?.id || '',
          )

          return {
            id: String(item.id),
            variationId: String(variationObject.id),

            name: String(data.name ?? ''),
            description: String(
              data.descriptionPlaintext || data.description || '',
            ),

            priceCents,
            price: priceCents / 100,
            currency: String(variation.priceMoney?.currency ?? 'CAD'),

            sku: variation.sku ? String(variation.sku) : null,

            imageIds: data.imageIds?.map(String) ?? [],
            primaryImageId,
            imageUrl: primaryImageId ? imageMap.get(primaryImageId) ?? null : null,

            categoryId,
            categoryName: categoryMap.get(categoryId) ?? 'Uncategorized',

            trackInventory: Boolean(variation.trackInventory),
            stockable: Boolean(variation.stockable),
            sellable: Boolean(variation.sellable),
            soldOut: Boolean(locationOverride?.soldOut),

            inventoryAlertThreshold:
              locationOverride?.inventoryAlertThreshold != null
                ? toNumber(locationOverride.inventoryAlertThreshold)
                : null,

            quantity: 0,
            updatedAt: String(item.updatedAt ?? ''),
          }
        }) || []

    const variationIds = products.map((product) => product.variationId)

    if (variationIds.length === 0) {
      res.json([])
      return
    }

    const inventoryResponse = await square.inventory.batchGetCounts({
      catalogObjectIds: variationIds,
    })

    const inventoryCounts = inventoryResponse.data ?? []

    const productsWithInventory = products.map((product) => {
      const count = inventoryCounts.find(
        (inventory: any) =>
          String(inventory.catalogObjectId) === product.variationId &&
          String(inventory.state) === 'IN_STOCK',
      )

      return {
        ...product,
        quantity: toNumber(count?.quantity),
      }
    })

    res.json(productsWithInventory)
  } catch (error) {
    console.error('SQUARE ERROR:', error)

    res.status(500).json({
      error: 'Failed to fetch Square products',
    })
  }
})

app.listen(port, () => {
  console.log(`Square API test server running on http://localhost:${port}`)
})