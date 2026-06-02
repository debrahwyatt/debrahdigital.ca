import crypto from 'crypto'

const DEFAULT_INGRAM_BASE_URL = 'https://api.ingrammicro.com:443/sandbox'

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const MAX_RATE_LIMIT_WAIT_MS = Number(
  process.env.INGRAM_MAX_RATE_LIMIT_WAIT_MS ?? 65_000,
)

const DEFAULT_RATE_LIMIT_WAIT_MS = Number(
  process.env.INGRAM_DEFAULT_RATE_LIMIT_WAIT_MS ?? 60_000,
)

export const getIngramBaseUrl = (): string => {
  return process.env.INGRAM_BASE_URL ?? DEFAULT_INGRAM_BASE_URL
}

export const getIngramCorrelationId = (): string => {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
}

export const getIngramHeaders = (token: string): Record<string, string> => {
  const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER
  const countryCode = process.env.INGRAM_COUNTRY_CODE ?? 'US'
  const senderId = process.env.INGRAM_SENDER_ID ?? 'MyCompany'

  if (!customerNumber) {
    throw new Error('Missing INGRAM_CUSTOMER_NUMBER in .env')
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'IM-CustomerNumber': customerNumber,
    'IM-CountryCode': countryCode,
    'IM-CorrelationID': getIngramCorrelationId(),
    'IM-SenderID': senderId,
  }
}

export const parseIngramResponse = async <T>(
  response: Response,
): Promise<T | string> => {
  const text = await response.text()

  try {
    return JSON.parse(text) as T
  } catch {
    return text
  }
}

export const buildIngramUrl = (
  path: string,
  params?: URLSearchParams,
): string => {
  const baseUrl = getIngramBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const query = params ? `?${params.toString()}` : ''

  return `${baseUrl}${cleanPath}${query}`
}

const getHeaderNumber = (
  response: Response,
  headerName: string,
): number | null => {
  const headerValue = response.headers.get(headerName)

  if (!headerValue) {
    return null
  }

  const numberValue = Number(headerValue)

  if (!Number.isFinite(numberValue)) {
    return null
  }

  return numberValue
}

const clampDelay = (delayMs: number): number => {
  if (!Number.isFinite(delayMs) || delayMs <= 0) {
    return DEFAULT_RATE_LIMIT_WAIT_MS
  }

  return Math.min(delayMs, MAX_RATE_LIMIT_WAIT_MS)
}

const getResetDelayMs = (resetValue: number): number | null => {
  const nowMs = Date.now()
  const bufferMs = Number(process.env.INGRAM_RATE_LIMIT_BUFFER_MS ?? 1500)

  // Ingram docs show X-RateLimit-Reset as Unix epoch seconds.
  // Example: 1392815263
  if (resetValue > 1_000_000_000 && resetValue < 10_000_000_000) {
    return resetValue * 1000 - nowMs + bufferMs
  }

  // Some APIs return epoch milliseconds.
  if (resetValue > 1_000_000_000_000 && resetValue < 10_000_000_000_000) {
    return resetValue - nowMs + bufferMs
  }

  // Some APIs return seconds-until-reset.
  if (resetValue > 0 && resetValue <= 3600) {
    return resetValue * 1000 + bufferMs
  }

  // Anything else is suspicious. Do not trust it.
  return null
}

export const getIngramRetryDelayFromResponse = (
  response: Response,
): number => {
  const retryAfterSeconds = getHeaderNumber(response, 'Retry-After')
  const resetValue = getHeaderNumber(response, 'X-RateLimit-Reset')

  if (retryAfterSeconds != null) {
    return clampDelay(retryAfterSeconds * 1000 + 1500)
  }

  if (resetValue != null) {
    const resetDelayMs = getResetDelayMs(resetValue)

    if (resetDelayMs != null) {
      return clampDelay(resetDelayMs)
    }
  }

  return DEFAULT_RATE_LIMIT_WAIT_MS
}

const getRateLimitWaitDelay = (response: Response): number | null => {
  const remaining = getHeaderNumber(response, 'X-RateLimit-Remaining')
  const resetValue = getHeaderNumber(response, 'X-RateLimit-Reset')

  if (remaining == null || resetValue == null) {
    return null
  }

  const minimumRemaining = Number(
    process.env.INGRAM_MIN_RATE_LIMIT_REMAINING ?? 2,
  )

  if (remaining > minimumRemaining) {
    return null
  }

  const resetDelayMs = getResetDelayMs(resetValue)

  if (resetDelayMs == null) {
    return DEFAULT_RATE_LIMIT_WAIT_MS
  }

  return clampDelay(resetDelayMs)
}

export const waitForIngramRateLimitIfNeeded = async (
  response: Response,
): Promise<void> => {
  const delayMs = getRateLimitWaitDelay(response)

  if (delayMs == null || delayMs <= 0) {
    return
  }

  console.log(
    `Ingram rate limit nearly reached. Waiting ${Math.ceil(
      delayMs / 1000,
    )} seconds before continuing...`,
  )

  await sleep(delayMs)
}

export const fetchIngramWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = Number(process.env.INGRAM_MAX_RETRIES ?? 2),
): Promise<Response> => {
  let attempt = 0

  while (true) {
    const response = await fetch(url, options)

    const isRateLimited =
      response.status === 429 ||
      response.status === 500

    if (!isRateLimited) {
      await waitForIngramRateLimitIfNeeded(response)
      return response
    }

    if (attempt >= maxRetries) {
      return response
    }

    const delayMs = getIngramRetryDelayFromResponse(response)

    console.log(
      `Ingram may be rate-limited. Status ${response.status}. Waiting ${Math.ceil(
        delayMs / 1000,
      )} seconds before retry ${attempt + 1}/${maxRetries}...`,
    )

    await sleep(delayMs)

    attempt += 1
  }
}