import { SquareClient, SquareEnvironment } from 'square'

const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN

if (!squareAccessToken) {
  throw new Error('Missing SQUARE_ACCESS_TOKEN in .env')
}

export const square = new SquareClient({
  token: squareAccessToken,
  environment:
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
})