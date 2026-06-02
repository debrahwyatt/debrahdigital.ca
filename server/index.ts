import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'

import squareRoutes from './routes/square'
import ingramRoutes from './routes/ingram'
import catalogRoutes from './routes/catalog'
import {
  startCatalogSyncScheduler,
} from './services/ingram/ingramCatalogScheduler'

dotenv.config()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.send('API server is running.')
})

app.use('/api/square', squareRoutes)
app.use('/api/ingram', ingramRoutes)
app.use('/api/catalog', catalogRoutes)

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${port}`)

  startCatalogSyncScheduler()
})