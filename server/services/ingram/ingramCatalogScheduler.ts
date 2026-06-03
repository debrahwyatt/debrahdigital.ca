import {
  syncIngramCatalogCache,
} from './ingramCatalogCache'

import {
  buildIcecatCatalogCache,
} from '../icecat/icecatCatalogCache'

import {
  buildProductCatalogCache,
} from '../catalog/productCatalogCache'

let isCatalogSyncRunning = false
let dailyCatalogSyncTimeout: NodeJS.Timeout | null = null

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.round(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

const getDailySyncTime = (): {
  hour: number
  minute: number
} => {
  const dailyAt = process.env.CATALOG_SYNC_DAILY_AT ?? '02:30'
  const [hourText, minuteText] = dailyAt.split(':')

  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return {
      hour: 2,
      minute: 30,
    }
  }

  return {
    hour,
    minute,
  }
}

const getNextDailySyncDelayMs = (): number => {
  const {
    hour,
    minute,
  } = getDailySyncTime()

  const now = new Date()
  const nextRun = new Date(now)

  nextRun.setHours(hour, minute, 0, 0)

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1)
  }

  return nextRun.getTime() - now.getTime()
}

const scheduleNextDailySync = (): void => {
  const delayMs = getNextDailySyncDelayMs()
  const {
    hour,
    minute,
  } = getDailySyncTime()

  const paddedHour = String(hour).padStart(2, '0')
  const paddedMinute = String(minute).padStart(2, '0')

  console.log(
    `Next daily catalog sync scheduled for ${paddedHour}:${paddedMinute} in ${formatDuration(
      delayMs,
    )}.`,
  )

  if (dailyCatalogSyncTimeout) {
    clearTimeout(dailyCatalogSyncTimeout)
  }

  dailyCatalogSyncTimeout = setTimeout(() => {
    void runCatalogSyncSafely('daily overnight schedule').finally(() => {
      scheduleNextDailySync()
    })
  }, delayMs)
}

export const runCatalogSyncSafely = async (
  reason = 'manual',
): Promise<void> => {
  if (isCatalogSyncRunning) {
    console.log(
      `Catalog sync skipped because another sync is already running. Reason: ${reason}`,
    )

    return
  }

  isCatalogSyncRunning = true

  const syncStartedAt = Date.now()

  try {
    console.log(`Starting full catalog sync. Reason: ${reason}`)

    console.log('Step 1/3: Syncing Ingram products...')
    const ingramStartedAt = Date.now()
    const ingramResult = await syncIngramCatalogCache()

    console.log(
      `Step 1/3 complete. Saved ${ingramResult.productCount} Ingram products in ${formatDuration(
        Date.now() - ingramStartedAt,
      )}.`,
    )

    console.log('Step 2/3: Syncing Icecat product content/images...')
    const icecatStartedAt = Date.now()
    const icecatResult = await buildIcecatCatalogCache()

    console.log(
      `Step 2/3 complete. Checked ${icecatResult.checkedProductCount} Icecat products, matched ${icecatResult.matchedProductCount}, with images ${icecatResult.withImageCount}, in ${formatDuration(
        Date.now() - icecatStartedAt,
      )}.`,
    )

    console.log('Step 3/3: Building public product catalog...')
    const productCatalogStartedAt = Date.now()
    const productCatalogResult = await buildProductCatalogCache()

    console.log(
      `Step 3/3 complete. Built ${productCatalogResult.productCount} public catalog products in ${formatDuration(
        Date.now() - productCatalogStartedAt,
      )}.`,
    )

    const durationMs = Date.now() - syncStartedAt

    console.log(
      `Full catalog sync complete in ${formatDuration(durationMs)}.`,
    )
  } catch (error) {
    const durationMs = Date.now() - syncStartedAt

    console.error(
      `Full catalog sync failed after ${formatDuration(durationMs)}:`,
      error,
    )
  } finally {
    isCatalogSyncRunning = false
  }
}

export const startCatalogSyncScheduler = (): void => {
  const shouldAutoSync = process.env.CATALOG_SYNC_ON_STARTUP !== 'false'

  if (shouldAutoSync) {
    const startupDelayMs = Number(
      process.env.CATALOG_SYNC_STARTUP_DELAY_MS ?? 10_000,
    )

    console.log(
      `Catalog startup sync enabled. First sync in ${Math.ceil(
        startupDelayMs / 1000,
      )} seconds.`,
    )

    setTimeout(() => {
      void runCatalogSyncSafely('server startup')
    }, startupDelayMs)
  } else {
    console.log('Catalog startup sync disabled by CATALOG_SYNC_ON_STARTUP=false')
  }

  scheduleNextDailySync()
}