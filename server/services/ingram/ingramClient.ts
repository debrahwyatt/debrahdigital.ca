import crypto from 'crypto'

export const getIngramBaseUrl = (): string => {
  return process.env.INGRAM_BASE_URL ?? 'https://api.ingrammicro.com:443/sandbox'
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