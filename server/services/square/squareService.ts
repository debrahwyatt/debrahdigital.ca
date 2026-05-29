import { square } from './squareClient'
import { toNumber } from '../../utils/numbers'
import type { SquareProduct } from '../../types/square'

export const getSquareProducts = async (): Promise<SquareProduct[]> => {
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

  const products: SquareProduct[] =
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
    return []
  }

  const inventoryResponse = await square.inventory.batchGetCounts({
    catalogObjectIds: variationIds,
  })

  const inventoryCounts = inventoryResponse.data ?? []

  return products.map((product) => {
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
}