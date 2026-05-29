let ingramToken: string | null = null
let ingramTokenExpiresAt = 0

export const getIngramToken = async (): Promise<string> => {
  const now = Date.now()

  if (ingramToken && now < ingramTokenExpiresAt) {
    return ingramToken
  }

  const clientId = process.env.INGRAM_CLIENT_ID
  const clientSecret = process.env.INGRAM_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing INGRAM_CLIENT_ID or INGRAM_CLIENT_SECRET in .env')
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const response = await fetch(
    'https://api.ingrammicro.com:443/oauth/oauth30/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  )

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Ingram token failed: ${response.status} ${text}`)
  }

  const data = JSON.parse(text)
  const token = data.access_token

  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('Ingram token response did not include a valid access_token')
  }

  ingramToken = token

  const expiresInSeconds = Number(data.expires_in ?? 3600)
  ingramTokenExpiresAt = now + (expiresInSeconds - 300) * 1000

  return token
}