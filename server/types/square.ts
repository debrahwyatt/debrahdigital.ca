export type SquareProduct = {
  id: string
  variationId: string

  name: string
  description: string

  priceCents: number
  price: number
  currency: string

  sku: string | null

  imageIds: string[]
  primaryImageId: string | null
  imageUrl: string | null

  categoryId: string
  categoryName: string

  trackInventory: boolean
  stockable: boolean
  sellable: boolean
  soldOut: boolean

  inventoryAlertThreshold: number | null

  quantity: number
  updatedAt: string
}