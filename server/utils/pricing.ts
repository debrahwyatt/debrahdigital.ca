export type CalculateSellPriceOptions = {
  markupMultiplier?: number
}

export const DEFAULT_MARKUP_MULTIPLIER = 1.175

export const roundUpToCents = (value: number): number => {
  return Math.ceil(value * 100) / 100
}

export const calculateSellPrice = (
  cost: number,
  msrp: number | null,
  options: CalculateSellPriceOptions = {},
): number => {
  const markupMultiplier =
    options.markupMultiplier ?? DEFAULT_MARKUP_MULTIPLIER

  const markupPrice = cost * markupMultiplier
  const basePrice = msrp != null && msrp > markupPrice ? msrp : markupPrice

  return roundUpToCents(basePrice)
}